import uuid
from typing import Dict, Any, List
from app.services.llm_service import llm_service


class ContradictionService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are an investigative cross-examination analyst.
Your objective is to identify informational discrepancies across multiple statements, claims, and documentary evidence.

CRITICAL ETHICAL PROTOCOLS:
1. DO NOT label discrepancies or differences as "lies", "deception", "untruthful", or "fabrication".
2. Recognize that human memory under stress and fragmented recall naturally produces temporal ambiguity or variations.
3. Clearly highlight the specific discrepancy (e.g. difference in reported times, vehicle colors, locations).
4. List the claim IDs and evidence IDs involved in the divergence.
5. Always mandate human review.

Return JSON with key "contradictions":
{
  "contradictions": [
    {
      "contradiction_id": "DISC-01",
      "conflicting_claim_ids": [1, 3],
      "source_references": ["Claim 1 reported 9:00 PM; Claim 3 mentioned after midnight"],
      "discrepancy_explanation": "Divergence in estimated time of occurrence between initial fragment and later observation.",
      "relevant_evidence_ids": [1],
      "uncertainties": ["Exact clock calibration is unverified; lighting may affect victim's perception."],
      "human_review_required": true
    }
  ]
}
"""

    @classmethod
    def detect_contradictions(
        cls,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyzes claims and evidence to detect discrepancies without moral or deceptive judgment.
        """
        if len(claims) < 2 and not evidence_items:
            return []

        claims_lines = [
            f"Claim ID {c['id']}: \"{c['claim_text']}\" (Time: {c.get('times')}, Loc: {c.get('locations')})"
            for c in claims
        ]
        evidence_lines = [
            f"Evidence ID {ev['id']}: {ev.get('title') or ev.get('filename')} - {(ev.get('extracted_text') or '')[:300]}"
            for ev in evidence_items
        ]

        prompt = f"""
Case Claims:
{chr(10).join(claims_lines)}

Case Evidence:
{chr(10).join(evidence_lines) if evidence_lines else "No documentary evidence uploaded."}
"""

        # Deterministic analysis for demo fallback
        demo_contradictions = []
        # Check for multiple claims with different times or locations
        timed_claims = [c for c in claims if c.get("times")]
        if len(timed_claims) >= 2:
            demo_contradictions.append({
                "contradiction_id": f"DISC-{uuid.uuid4().hex[:4].upper()}",
                "conflicting_claim_ids": [timed_claims[0]["id"], timed_claims[1]["id"]],
                "source_references": [
                    f"Claim {timed_claims[0]['id']}: {timed_claims[0].get('times')}",
                    f"Claim {timed_claims[1]['id']}: {timed_claims[1].get('times')}"
                ],
                "discrepancy_explanation": "Identified divergent reported timeframes across statement fragments.",
                "relevant_evidence_ids": [ev["id"] for ev in evidence_items[:2]],
                "uncertainties": ["Time references are approximate due to stress and lack of synced clocks."],
                "human_review_required": True
            })

        demo_fallback = {"contradictions": demo_contradictions}

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        contradictions = result.get("contradictions", [])
        if not isinstance(contradictions, list):
            contradictions = demo_fallback["contradictions"]

        for item in contradictions:
            item.setdefault("contradiction_id", f"DISC-{uuid.uuid4().hex[:4].upper()}")
            item.setdefault("conflicting_claim_ids", [])
            item.setdefault("source_references", [])
            item.setdefault("discrepancy_explanation", "Potential informational variance detected.")
            item.setdefault("relevant_evidence_ids", [])
            item.setdefault("uncertainties", ["Requires contextual examination by lead investigator."])
            item["human_review_required"] = True

        return contradictions


contradiction_service = ContradictionService()
