"""
Nexus Intelligence Service — Fragment First 2.0

Identifies potentially relevant connections across statements, evidence, and
entities within authorized cases.

ETHICAL FRAMEWORK (MANDATORY):
  Every result from this service is explicitly labeled:
    - is_ai_generated = True
    - review_status = "pending_review"
    - confidence_score with clear uncertainty
    - rationale explaining WHY the connection was identified
    - source text from BOTH sides of the connection

  This service NEVER:
    - Merges identities automatically
    - Declares connections as facts
    - Ranks people as suspects
    - Produces output without source references
    - Returns results without uncertainty labels

All connections require investigator review before being actionable.
"""
import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.statement import Statement
from app.models.evidence import Evidence
from app.models.reconstruction import Reconstruction
from app.models.nexus import NexusConnection
from app.models.entity import ExtractedEntity
from app.services.llm_service import llm_service

logger = logging.getLogger("fragment_first.nexus")

ENTITY_EXTRACTION_INSTRUCTION = """
You are an entity extraction engine for a legal investigation platform.
Extract named entities from the provided text. Be conservative — only extract
what is clearly stated. Never infer or assume.

Return a JSON object with this exact structure:
{
  "entities": [
    {
      "entity_type": "PERSON|LOCATION|VEHICLE|PHONE|EMAIL|DATE|ORGANIZATION|OBJECT|IDENTIFIER|OTHER",
      "entity_value": "exact text from the source",
      "normalized_value": "cleaned version (e.g. lowercase phone number)",
      "context_snippet": "15-30 words of surrounding context",
      "confidence_score": 0.0_to_1.0
    }
  ]
}

RULES:
- Only include entities explicitly present in the text.
- If uncertain about type, use OTHER.
- Do not invent entities.
- Do not include pronouns alone (he, she, they) unless a specific referent is clear.
- Confidence 0.9+ = clearly stated; 0.6-0.9 = mentioned but possibly ambiguous; below 0.6 = uncertain.
"""

CONNECTION_ANALYSIS_INSTRUCTION = """
You are a cross-case connection analyst for a legal investigation platform.
Compare two sets of extracted entities and identify POSSIBLE connections.

CRITICAL ETHICAL RULES:
- A shared name does NOT prove two records involve the same person.
- A shared location does NOT prove involvement or guilt.
- Every connection must have a specific, traceable rationale.
- Do not fabricate connections.
- State confidence clearly. When uncertain, say so.
- Connections are SUGGESTIONS for investigator review, not facts.

Return a JSON object:
{
  "connections": [
    {
      "connection_type": "same_person|shared_location|shared_vehicle|shared_phone|shared_email|temporal_overlap|shared_organization|other",
      "entity_a_value": "value from record A",
      "entity_b_value": "value from record B",
      "rationale": "specific reason why these may be connected",
      "supporting_text_a": "exact excerpt from record A",
      "supporting_text_b": "exact excerpt from record B",
      "confidence_score": 0.0_to_1.0,
      "confidence_label": "speculative|possible|probable"
    }
  ]
}
"""


class NexusService:
    """Cross-case intelligence engine."""

    def extract_entities(
        self,
        text: str,
        case_id: int,
        statement_id: Optional[int] = None,
        evidence_id: Optional[int] = None,
        reconstruction_id: Optional[int] = None,
        db: Optional[Session] = None,
    ) -> List[Dict[str, Any]]:
        """
        Extract named entities from text using the LLM.
        Stores results in extracted_entities table if db is provided.
        Returns list of entity dicts.
        """
        if not text or not text.strip():
            return []

        prompt = f"Extract entities from this text:\n\n\"\"\"\n{text[:3000]}\n\"\"\""
        demo_fallback = {
            "entities": [
                {
                    "entity_type": "OTHER",
                    "entity_value": "Fragment First Demo Entity",
                    "normalized_value": "fragment first demo entity",
                    "context_snippet": "Demo mode — no real extraction performed.",
                    "confidence_score": 0.5,
                }
            ]
        }

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=ENTITY_EXTRACTION_INSTRUCTION,
            demo_fallback=demo_fallback,
        )

        entities = result.get("entities", [])

        if db:
            for ent in entities:
                record = ExtractedEntity(
                    case_id=case_id,
                    statement_id=statement_id,
                    evidence_id=evidence_id,
                    reconstruction_id=reconstruction_id,
                    entity_type=ent.get("entity_type", "OTHER"),
                    entity_value=str(ent.get("entity_value", ""))[:500],
                    normalized_value=str(ent.get("normalized_value", ""))[:500] or None,
                    context_snippet=ent.get("context_snippet") or None,
                    confidence_score=float(ent.get("confidence_score", 0.7)),
                    is_ai_generated=True,
                    is_verified=False,
                )
                db.add(record)
            db.commit()

        return entities

    def find_connections(
        self,
        case_id: int,
        authorized_case_ids: List[int],
        db: Session,
        max_other_cases: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Analyze entities in case_id against entities in other authorized cases.
        Returns a list of suggested connections (not facts).
        """
        # Get entities for this case
        source_entities = (
            db.query(ExtractedEntity)
            .filter(ExtractedEntity.case_id == case_id, ExtractedEntity.is_redacted == False)
            .all()
        )
        if not source_entities:
            return []

        # Get entities from other authorized cases (limit to avoid huge prompts)
        other_case_ids = [c for c in authorized_case_ids if c != case_id][:max_other_cases]
        if not other_case_ids:
            return []

        target_entities = (
            db.query(ExtractedEntity)
            .filter(
                ExtractedEntity.case_id.in_(other_case_ids),
                ExtractedEntity.is_redacted == False,
            )
            .all()
        )
        if not target_entities:
            return []

        # Build compact entity lists for the LLM
        source_summary = [
            {
                "case_id": e.case_id,
                "type": e.entity_type,
                "value": e.entity_value,
                "context": e.context_snippet or "",
                "entity_db_id": e.id,
            }
            for e in source_entities[:30]  # cap to keep prompt manageable
        ]
        target_summary = [
            {
                "case_id": e.case_id,
                "type": e.entity_type,
                "value": e.entity_value,
                "context": e.context_snippet or "",
                "entity_db_id": e.id,
            }
            for e in target_entities[:30]
        ]

        prompt = (
            f"RECORD SET A (Case {case_id} entities):\n{json.dumps(source_summary, indent=2)}\n\n"
            f"RECORD SET B (Other authorized case entities):\n{json.dumps(target_summary, indent=2)}\n\n"
            "Identify any POSSIBLE connections between these two sets. "
            "Remember: similarity is a suggestion only, not proof."
        )

        demo_fallback = {"connections": []}

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=CONNECTION_ANALYSIS_INSTRUCTION,
            demo_fallback=demo_fallback,
        )

        connections = result.get("connections", [])
        saved = []

        for conn in connections:
            confidence = float(conn.get("confidence_score", 0.4))
            label = conn.get("confidence_label", "possible")
            if label not in ("speculative", "possible", "probable"):
                label = "possible"

            record = NexusConnection(
                source_type="entity",
                source_id=case_id,
                source_case_id=case_id,
                target_type="entity",
                target_id=other_case_ids[0],
                target_case_id=other_case_ids[0],
                connection_type=conn.get("connection_type", "other"),
                rationale=conn.get("rationale", "AI identified a possible similarity."),
                supporting_text_a=conn.get("supporting_text_a") or "",
                supporting_text_b=conn.get("supporting_text_b") or "",
                confidence_score=confidence,
                confidence_label=label,
                review_status="pending_review",
                is_ai_generated=True,
                generated_by_model="gemini-nexus-v1",
            )
            db.add(record)
            saved.append(conn)

        db.commit()
        return saved

    def get_graph_data(
        self,
        authorized_case_ids: List[int],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Returns nodes and edges for the connection graph visualization.
        Only includes records from authorized cases.
        """
        nodes = []
        edges = []
        seen_nodes = set()

        # Case nodes
        cases = db.query(Case).filter(Case.id.in_(authorized_case_ids)).all()
        for case in cases:
            node_id = f"case_{case.id}"
            if node_id not in seen_nodes:
                nodes.append({
                    "id": node_id,
                    "type": "case",
                    "label": case.title,
                    "data": {
                        "case_id": case.id,
                        "status": case.status,
                        "category": case.category or "other",
                        "priority": case.priority or "medium",
                    },
                })
                seen_nodes.add(node_id)

        # Entity nodes (top entities per case, not redacted)
        entities = (
            db.query(ExtractedEntity)
            .filter(
                ExtractedEntity.case_id.in_(authorized_case_ids),
                ExtractedEntity.is_redacted == False,
                ExtractedEntity.confidence_score >= 0.6,
            )
            .limit(100)
            .all()
        )
        for ent in entities:
            node_id = f"entity_{ent.id}"
            if node_id not in seen_nodes:
                nodes.append({
                    "id": node_id,
                    "type": "entity",
                    "label": ent.entity_value[:40],
                    "data": {
                        "entity_type": ent.entity_type,
                        "confidence": ent.confidence_score,
                        "is_verified": ent.is_verified,
                        "case_id": ent.case_id,
                    },
                })
                seen_nodes.add(node_id)
            # Edge: entity → case
            edges.append({
                "id": f"e_ent_{ent.id}_case_{ent.case_id}",
                "source": f"case_{ent.case_id}",
                "target": node_id,
                "type": "entity_member",
                "label": ent.entity_type.lower(),
            })

        # Nexus connection edges
        connections = (
            db.query(NexusConnection)
            .filter(
                NexusConnection.source_case_id.in_(authorized_case_ids),
                NexusConnection.target_case_id.in_(authorized_case_ids),
            )
            .limit(50)
            .all()
        )
        for conn in connections:
            edges.append({
                "id": f"nexus_{conn.id}",
                "source": f"case_{conn.source_case_id}",
                "target": f"case_{conn.target_case_id}",
                "type": "nexus_connection",
                "label": conn.connection_type.replace("_", " "),
                "data": {
                    "nexus_id": conn.id,
                    "confidence": conn.confidence_score,
                    "confidence_label": conn.confidence_label,
                    "review_status": conn.review_status,
                    "rationale": conn.rationale,
                    "is_ai_generated": conn.is_ai_generated,
                },
            })

        return {"nodes": nodes, "edges": edges, "total_nodes": len(nodes), "total_edges": len(edges)}

    def answer_query(
        self,
        question: str,
        authorized_case_ids: List[int],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Answer a natural-language investigation query using only authorized records.
        Returns answer with source citations.
        """
        # Gather context from authorized records
        statements = (
            db.query(Statement)
            .filter(Statement.case_id.in_(authorized_case_ids))
            .limit(20)
            .all()
        )
        evidence_items = (
            db.query(Evidence)
            .filter(Evidence.case_id.in_(authorized_case_ids))
            .limit(20)
            .all()
        )
        entities = (
            db.query(ExtractedEntity)
            .filter(
                ExtractedEntity.case_id.in_(authorized_case_ids),
                ExtractedEntity.is_redacted == False,
            )
            .limit(50)
            .all()
        )

        # Build compact context
        context_parts = []
        stmt_refs = []
        for s in statements:
            ref = f"[Statement #{s.id}, Case #{s.case_id}]"
            context_parts.append(f"{ref}: {s.original_text[:400]}")
            stmt_refs.append({"id": s.id, "case_id": s.case_id, "type": "statement"})

        for ev in evidence_items:
            if ev.extracted_text:
                ref = f"[Evidence #{ev.id} '{ev.title}', Case #{ev.case_id}]"
                context_parts.append(f"{ref}: {ev.extracted_text[:400]}")

        entity_list = [
            f"{e.entity_type}: {e.entity_value} (Case #{e.case_id})"
            for e in entities
        ]

        system_instruction = """
You are an AI investigation assistant for a secure legal platform.
Answer the investigator's question using ONLY the provided records.
RULES:
1. Cite every fact with its source reference (e.g. [Statement #3, Case #2]).
2. Clearly distinguish: directly recorded facts vs. AI inferences vs. unknown information.
3. If you cannot find supporting evidence in the records, say so clearly.
4. Never declare guilt or innocence.
5. Never invent evidence, names, dates or events not present in the records.
6. If a question asks about something not in the records, respond: "I could not find information about this in the authorized records."
Return JSON: {"answer": "...", "citations": [{"source_type": "statement|evidence|entity", "source_id": 1, "case_id": 1, "excerpt": "..."}], "confidence": "high|medium|low|unknown", "limitations": "..."}
"""
        prompt = (
            f"INVESTIGATOR QUESTION:\n{question}\n\n"
            f"AUTHORIZED RECORDS CONTEXT:\n"
            + "\n".join(context_parts[:15])
            + f"\n\nEXTRACTED ENTITIES:\n"
            + "\n".join(entity_list[:30])
        )

        demo_fallback = {
            "answer": "Demo mode is active. No real records have been searched.",
            "citations": [],
            "confidence": "unknown",
            "limitations": "Running in demo mode — no actual case records were queried.",
        }

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=system_instruction,
            demo_fallback=demo_fallback,
        )
        result.setdefault("citations", [])
        result.setdefault("limitations", "")
        result["authorized_cases_searched"] = authorized_case_ids
        result["records_searched"] = {
            "statements": len(statements),
            "evidence": len(evidence_items),
            "entities": len(entities),
        }
        return result


nexus_service = NexusService()
