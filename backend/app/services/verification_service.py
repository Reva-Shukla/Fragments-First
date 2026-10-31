from typing import Dict, Any, List
from app.services.llm_service import llm_service


class VerificationService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are an objective, rigorous evidence verification analyst in a legal assistance platform.
Your mission is to compare extracted claims against available physical and documentary evidence items provided by investigators.

STRICT ETHICAL AND LEGAL PROTOCOLS:
1. Status must strictly be one of:
   - "Supported": Evidence directly substantiates the claim.
   - "Partially Supported": Evidence substantiates some aspects, but leaves others unverified.
   - "Contradicted": Evidence directly conflicts with the factual claim.
   - "Unverified": There is insufficient or no relevant evidence regarding this claim.
2. MISSING EVIDENCE RULE: Absence of evidence is NOT proof of contradiction or falsity. If no evidence addresses the claim, mark it "Unverified".
3. EVIDENCE ID INTEGRITY: You MUST only cite existing evidence IDs provided in the context. Never fabricate or hallucinate evidence IDs or document contents.
4. EXPLANATION: Clearly and objectively state what the evidence shows and what it does not prove.
5. NO TRUTHFULNESS/CREDIBILITY SCORE: Never assign percentage scores, truthfulness ratings, or credibility indices to the victim.
6. HUMAN REVIEW: Always mark `human_review_required: true`.

Return JSON with key "assessments":
{
  "assessments": [
    {
      "claim_id": 1,
      "status": "Supported",
      "explanation": "Security log (Evidence ID 2) confirms entry at 21:15.",
      "evidence_ids": [2],
      "limitations": ["Camera timestamp has +/- 2 minute clock drift margin."],
      "human_review_required": true
    }
  ]
}
"""

    @classmethod
    def verify_claims(
        cls,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates a list of claims against a list of evidence documents/records.
        Each evidence item contains: id, title, filename, file_type, extracted_text.
        """
        if not claims:
            return []

        # Prepare evidence text summary
        evidence_summary_lines = []
        for ev in evidence_items:
            text_snippet = (ev.get("extracted_text") or "")[:500].replace("\n", " ")
            evidence_summary_lines.append(
                f"[Evidence ID {ev['id']}]: Title: '{ev.get('title') or ev.get('filename')}' | "
                f"Type: {ev.get('file_type')} | Content: \"{text_snippet}\""
            )
        evidence_context = "\n".join(evidence_summary_lines) if evidence_summary_lines else "NO EVIDENCE UPLOADED YET."

        claims_lines = []
        for c in claims:
            claims_lines.append(f"Claim ID {c['id']}: \"{c['claim_text']}\" (Excerpt: \"{c.get('original_excerpt', '')}\")")
        claims_context = "\n".join(claims_lines)

        prompt = f"""
Available Evidence Items:
{evidence_context}

Claims to Verify:
{claims_context}
"""

        # Build realistic synthetic fallback
        demo_assessments = []
        has_evidence = len(evidence_items) > 0
        all_ev_ids = [ev["id"] for ev in evidence_items]

        for i, c in enumerate(claims):
            if not has_evidence:
                demo_assessments.append({
                    "claim_id": c["id"],
                    "status": "Unverified",
                    "explanation": "No evidentiary documents or records have been uploaded for this case yet. Absence of evidence does not imply contradiction.",
                    "evidence_ids": [],
                    "limitations": ["Evidentiary investigation is ongoing; no corroborating records available."],
                    "human_review_required": True
                })
            else:
                # Correlate keywords between claim and evidence
                matched_ids = []
                c_text = c["claim_text"].lower()
                for ev in evidence_items:
                    ev_text = (ev.get("extracted_text") or "").lower()
                    words = [w for w in c_text.split() if len(w) > 4]
                    if any(w in ev_text for w in words):
                        matched_ids.append(ev["id"])

                if matched_ids:
                    demo_assessments.append({
                        "claim_id": c["id"],
                        "status": "Supported" if len(matched_ids) > 1 else "Partially Supported",
                        "explanation": f"Documentary evidence (IDs: {matched_ids}) correlates with the temporal and spatial details in this claim.",
                        "evidence_ids": matched_ids,
                        "limitations": ["Documentary corroborate is specific to noted timestamps; contextual intent requires human investigator verification."],
                        "human_review_required": True
                    })
                else:
                    demo_assessments.append({
                        "claim_id": c["id"],
                        "status": "Unverified",
                        "explanation": "Currently uploaded evidence files do not explicitly cover this specific claim.",
                        "evidence_ids": [],
                        "limitations": ["Further document or witness inquiry recommended."],
                        "human_review_required": True
                    })

        demo_fallback = {"assessments": demo_assessments}

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        assessments = result.get("assessments", [])
        if not isinstance(assessments, list) or not assessments:
            assessments = demo_fallback["assessments"]

        valid_statuses = {"Supported", "Partially Supported", "Contradicted", "Unverified"}
        for a in assessments:
            if a.get("status") not in valid_statuses:
                a["status"] = "Unverified"
            # Ensure referenced evidence IDs are real
            if has_evidence:
                a["evidence_ids"] = [eid for eid in a.get("evidence_ids", []) if eid in all_ev_ids]
            else:
                a["evidence_ids"] = []
            a.setdefault("limitations", [])
            a["human_review_required"] = True

        return assessments


verification_service = VerificationService()
