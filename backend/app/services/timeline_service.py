from typing import Dict, Any, List
from app.services.llm_service import llm_service


class TimelineService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are a chronological timeline specialist for legal and forensic investigations.
Your mission is to organize factual claims and evidence timestamps into a coherent chronological sequence.

CRITICAL RULES:
1. NEVER invent or fabricate missing timestamps or dates.
2. For each event, assign time_precision:
   - "exact": Stated with specific minute or explicit confirmed timestamp.
   - "approximate": Stated with relative time (e.g., "around 8 PM", "later that night").
   - "unknown": Stated without clear temporal anchor (mark is_uncertain: true).
3. Specify source_type: "claim", "evidence", or "statement".
4. Mark `is_uncertain: true` for any events where timing or sequence is ambiguous.
5. Order events as chronologically as possible based strictly on provided data.

Return JSON with key "events":
{
  "events": [
    {
      "description": "Victim arrived at the office building entrance.",
      "date_time_str": "Approximately 20:30",
      "time_precision": "approximate",
      "source_type": "claim",
      "source_id": 1,
      "related_claim_ids": [1],
      "is_uncertain": false
    }
  ]
}
"""

    @classmethod
    def generate_timeline(
        cls,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Assembles chronological event timeline from claims and evidence items.
        """
        claims_context = [
            f"Claim {c['id']}: \"{c['claim_text']}\" | Dates: {c.get('dates')} | Times: {c.get('times')} | Notes: {c.get('uncertainty_notes')}"
            for c in claims
        ]
        evidence_context = [
            f"Evidence {ev['id']}: {ev.get('title') or ev.get('filename')} | Metadata: {ev.get('metadata_json')}"
            for ev in evidence_items
        ]

        prompt = f"""
Claims to Sequence:
{chr(10).join(claims_context)}

Evidence to Corroborate:
{chr(10).join(evidence_context) if evidence_context else "No evidence documents uploaded."}
"""

        # Deterministic demo fallback
        demo_events = []
        for c in claims:
            time_val = None
            if c.get("times"):
                time_val = c["times"][0] if isinstance(c["times"], list) else str(c["times"])
            elif c.get("dates"):
                time_val = c["dates"][0] if isinstance(c["dates"], list) else str(c["dates"])
            
            precision = "exact" if time_val and ":" in time_val else ("approximate" if time_val else "unknown")
            is_unc = bool(c.get("uncertainty_notes")) or precision == "unknown"

            demo_events.append({
                "description": c["claim_text"],
                "date_time_str": time_val or "Time Unknown",
                "time_precision": precision,
                "source_type": "claim",
                "source_id": c["id"],
                "related_claim_ids": [c["id"]],
                "is_uncertain": is_unc
            })

        demo_fallback = {"events": demo_events}

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        events = result.get("events", [])
        if not isinstance(events, list) or not events:
            events = demo_fallback["events"]

        valid_precisions = {"exact", "approximate", "unknown"}
        for ev in events:
            if ev.get("time_precision") not in valid_precisions:
                ev["time_precision"] = "approximate"
            ev.setdefault("is_uncertain", False)
            ev.setdefault("related_claim_ids", [])
            ev.setdefault("source_type", "claim")

        return events


timeline_service = TimelineService()
