import re
from typing import Dict, Any, List, Optional
from app.services.llm_service import llm_service


class ClaimService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are an expert legal fact extraction specialist.
Your mission is to parse an approved statement and extract distinct, atomic factual claims.

MANDATORY RULES:
1. Extract individual atomic claims (one discrete fact or observation per claim).
2. For each claim, identify:
   - People mentioned
   - Locations mentioned
   - Dates mentioned
   - Times mentioned
   - Events mentioned
   - Actions observed or taken
   - Uncertainty notes (e.g. if the speaker expressed doubt, hesitation, or approximation)
3. Quote the EXACT source excerpt from the text that corresponds to this claim.
4. NEVER convert assumptions, inferences, or speculative thoughts into objective facts.
5. If a claim involves uncertainty, clearly flag it in the uncertainty_notes.

Return valid JSON with key "claims" containing an array of objects:
{
  "claims": [
    {
      "claim_text": "Victim observed a tall figure wearing a dark jacket near the entrance.",
      "original_excerpt": "...tall guy maybe wearing black or dark jacket by the door...",
      "people": ["tall figure", "individual in dark jacket"],
      "locations": ["entrance / door"],
      "dates": [],
      "times": [],
      "events": ["sighting near entrance"],
      "actions": ["standing by door"],
      "uncertainty_notes": "Jacket color was reported tentatively as black or dark."
    }
  ]
}
"""

    @classmethod
    def extract_claims(
        cls,
        text: str,
        original_statement_text: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Extracts factual claims and entities from approved reconstructed or original statements.
        """
        prompt = f"""
Input Statement for Claim Extraction:
\"\"\"{text}\"\"\"

Original Raw Text for Excerpt Verification:
\"\"\"{original_statement_text or text}\"\"\"
"""
        # High quality synthetic demo fallback
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 8]
        if not sentences:
            sentences = [text.strip()]

        demo_claims = []
        for i, sentence in enumerate(sentences[:6], start=1):
            demo_claims.append({
                "claim_text": sentence,
                "original_excerpt": sentence[:100],
                "people": ["individual mentioned"] if any(w in sentence.lower() for w in ["he", "she", "man", "person", "they", "someone", "guy"]) else [],
                "locations": ["location referenced"] if any(w in sentence.lower() for w in ["at", "near", "in", "street", "building", "door", "room", "park", "store"]) else [],
                "dates": ["date noted"] if any(w in sentence.lower() for w in ["yesterday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "october", "november"]) else [],
                "times": ["time noted"] if any(w in sentence.lower() for w in ["pm", "am", "morning", "night", "evening", "afternoon", "around", "o'clock"]) else [],
                "events": ["reported event"],
                "actions": ["reported action"],
                "uncertainty_notes": "Tentative phrasing noted in original fragment." if any(w in sentence.lower() for w in ["maybe", "think", "probably", "guess", "unsure", "not certain"]) else None
            })

        demo_fallback = {"claims": demo_claims}

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        claims = result.get("claims", [])
        if not isinstance(claims, list) or not claims:
            claims = demo_fallback["claims"]

        # Ensure all required keys exist
        for claim in claims:
            claim.setdefault("claim_text", "Extracted factual claim")
            claim.setdefault("original_excerpt", text[:120])
            claim.setdefault("people", [])
            claim.setdefault("locations", [])
            claim.setdefault("dates", [])
            claim.setdefault("times", [])
            claim.setdefault("events", [])
            claim.setdefault("actions", [])
            claim.setdefault("uncertainty_notes", None)

        return claims


claim_service = ClaimService()
