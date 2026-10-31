from typing import Dict, Any, Optional
from app.services.llm_service import llm_service


class ReconstructionService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are an expert, compassionate legal communication assistant specialized in trauma-informed statement reconstruction.
Your mission is to assist an individual who provided fragmented, incomplete, or distressed notes into a clear, coherent, and readable narrative.

MANDATORY ETHICAL CONSTRAINTS:
1. NEVER invent names, locations, dates, timestamps, or specific actions not present in the original input.
2. PRESERVE UNCERTAINTY: If the victim says "maybe", "I think", "blue or dark grey", or sounds unsure, you MUST preserve that exact uncertainty. Never make it sound definitive.
3. IDENTIFY UNCLEAR PORTIONS: List fragmented thoughts or ambiguous phrases that need human clarification.
4. IDENTIFY MISSING INFORMATION: Note logical gaps (e.g. sequence of events) without guessing what happened.
5. NEVER evaluate truthfulness, lie detection, guilt, or innocence.
6. The victim MUST review and approve any reconstruction before it is accepted.

You must output valid JSON matching this schema:
{
  "reconstructed_statement": "Coherent reconstructed narrative preserving original meaning and uncertainty...",
  "unclear_portions": ["Unclear fragment 1", "..."],
  "missing_information": ["Missing contextual detail 1", "..."],
  "preserved_uncertainties": ["Preserved uncertainty 1", "..."],
  "requires_victim_review": true
}
"""

    @classmethod
    def reconstruct(cls, original_text: str, correction_feedback: Optional[str] = None) -> Dict[str, Any]:
        """
        Reconstructs a fragmented victim statement while strictly adhering to ethical constraints.
        """
        prompt = f"""
Original Fragmented Statement:
\"\"\"{original_text}\"\"\"
"""
        if correction_feedback:
            prompt += f"""
Victim Correction Feedback:
\"\"\"{correction_feedback}\"\"\"
Please adjust the reconstruction in accordance with the victim's feedback while preserving original meaning.
"""

        # High-fidelity synthetic fallback if in demo mode or offline
        lines = [line.strip() for line in original_text.splitlines() if line.strip()]
        fallback_reconstruction = (
            " ".join(lines)
            .replace("..", ".")
            .replace("...", ".")
            .replace("  ", " ")
        )
        if not fallback_reconstruction.endswith("."):
            fallback_reconstruction += "."

        # Detect potential uncertainties in original text
        uncertain_keywords = ["maybe", "think", "probably", "not sure", "around", "can't remember", "guess", "might"]
        found_uncertainties = [word for word in uncertain_keywords if word in original_text.lower()]
        
        demo_fallback = {
            "reconstructed_statement": f"Reconstructed Narrative: {fallback_reconstruction}",
            "unclear_portions": [
                line for line in lines if len(line.split()) < 4 or line.endswith("...")
            ][:3] or ["Some incomplete sentence fragments noted in the original submission."],
            "missing_information": [
                "Exact chronological sequence between events described in fragmented notes.",
                "Specific lighting conditions and full environmental context."
            ],
            "preserved_uncertainties": [
                f"Preserved uncertainty expression: '{u}'" for u in found_uncertainties
            ] if found_uncertainties else ["Any stated hesitations or approximate descriptions have been preserved as tentative."],
            "requires_victim_review": True
        }

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )
        
        # Ensure mandatory ethical fields are present
        if "reconstructed_statement" not in result:
            result["reconstructed_statement"] = demo_fallback["reconstructed_statement"]
        result.setdefault("unclear_portions", [])
        result.setdefault("missing_information", [])
        result.setdefault("preserved_uncertainties", [])
        result["requires_victim_review"] = True

        return result


reconstruction_service = ReconstructionService()
