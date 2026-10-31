from typing import Dict, Any, List, Optional
from app.services.llm_service import llm_service


class InvestigationService:
    ETHICAL_SYSTEM_INSTRUCTION = """
You are an expert legal reasoning and investigative analysis assistant.
Your goal is to help defense attorneys or investigators explore multiple alternative hypotheses and counterfactual scenarios.

STRICT ETHICAL AND LEGAL GUARDRAILS:
1. NEVER determine guilt, liability, or innocence.
2. Formulate multiple plausible hypotheses based on the facts and evidence.
3. For each hypothesis:
   - Clearly state the hypothesis text
   - Link supporting evidence IDs
   - Link conflicting evidence IDs
   - Enumerate key underlying assumptions
   - Identify critical missing information needed to validate or refute it
4. Clearly distinguish established facts from speculative inferences.
5. COUNTERFACTUAL ANALYSIS:
   - When generating a "what-if" counterfactual scenario, mark `is_counterfactual: true` and label it clearly as "HYPOTHETICAL SCENARIO".
   - State the altered premise and what evidence would be affected.
   - Strictly remind investigators that counterfactual scenarios are brainstorming aids and must NEVER be inserted into the case's ground-truth timeline.

Return JSON with key "hypotheses":
{
  "hypotheses": [
    {
      "label": "Hypothesis 1: Primary Sequence",
      "hypothesis_text": "The event proceeded as described with external third-party interference.",
      "supporting_evidence_ids": [1],
      "conflicting_evidence_ids": [],
      "assumptions": ["Assumes building security cameras covered all active exits."],
      "missing_information": ["Access card badge swipe logs for the stairwell."],
      "is_counterfactual": false
    }
  ]
}
"""

    @classmethod
    def generate_hypotheses(
        cls,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        focus_topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generates alternative investigative hypotheses based on case facts."""
        claims_text = "\n".join([f"- Claim {c['id']}: {c['claim_text']}" for c in claims])
        evidence_text = "\n".join([f"- Evidence {e['id']}: {e.get('title') or e.get('filename')}" for e in evidence_items])
        
        prompt = f"""
Case Factual Claims:
{claims_text or 'No claims approved yet.'}

Available Evidence:
{evidence_text or 'No evidence uploaded yet.'}

Focus Topic:
{focus_topic or 'Comprehensive alternative explanations of the sequence of events.'}
"""
        ev_ids = [e["id"] for e in evidence_items]

        demo_fallback = {
            "hypotheses": [
                {
                    "label": "Hypothesis A: Consistent Primary Narrative",
                    "hypothesis_text": "The sequence of events transpired according to the victim's primary recollection, supported by physical location proximity.",
                    "supporting_evidence_ids": ev_ids[:1],
                    "conflicting_evidence_ids": [],
                    "assumptions": ["Victim's recall of spatial landmarks is accurate."],
                    "missing_information": ["Corroborating witness testimonies from surrounding premises."],
                    "is_counterfactual": False
                },
                {
                    "label": "Hypothesis B: Environmental Misattribution",
                    "hypothesis_text": "Dim lighting or stressful conditions may have caused partial misattribution of secondary details (e.g. jacket color or vehicle model) without invalidating the core event.",
                    "supporting_evidence_ids": ev_ids[:2],
                    "conflicting_evidence_ids": [],
                    "assumptions": ["Visual acuity was impacted by low ambient street illumination."],
                    "missing_information": ["Independent meteorological and street lighting maintenance records."],
                    "is_counterfactual": False
                }
            ]
        }

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        hypotheses = result.get("hypotheses", [])
        if not isinstance(hypotheses, list) or not hypotheses:
            hypotheses = demo_fallback["hypotheses"]

        return hypotheses

    @classmethod
    def generate_counterfactual(
        cls,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        counterfactual_premise: str
    ) -> Dict[str, Any]:
        """Generates an isolated counterfactual 'what-if' investigative scenario."""
        prompt = f"""
Counterfactual Premise to Explore:
\"{counterfactual_premise}\"

Existing Case Context:
{chr(10).join([f'- Claim {c["id"]}: {c["claim_text"]}' for c in claims[:5]])}
"""
        ev_ids = [e["id"] for e in evidence_items]

        demo_fallback = {
            "hypotheses": [
                {
                    "label": "HYPOTHETICAL COUNTERFACTUAL SCENARIO (Do Not Include in Ground Truth)",
                    "hypothesis_text": f"What-If Analysis under premise: '{counterfactual_premise}'. If this condition held true, the timing and potential witness angles would diverge substantially from initial reports.",
                    "supporting_evidence_ids": [],
                    "conflicting_evidence_ids": ev_ids[:1],
                    "assumptions": [
                        f"Assumes hypothetical premise holds: '{counterfactual_premise}'",
                        "Inferences derived are purely analytical and not established case facts."
                    ],
                    "missing_information": [
                        "Independent surveillance footage covering hypothetical alternate routes.",
                        "Telecommunications cell tower metadata."
                    ],
                    "is_counterfactual": True
                }
            ]
        }

        result = llm_service.generate_json(
            prompt=prompt,
            system_instruction=cls.ETHICAL_SYSTEM_INSTRUCTION,
            demo_fallback=demo_fallback
        )

        hypotheses = result.get("hypotheses", [])
        if not isinstance(hypotheses, list) or not hypotheses:
            hypotheses = demo_fallback["hypotheses"]

        # Ensure counterfactual flags are properly set
        for h in hypotheses:
            h["is_counterfactual"] = True
            if "HYPOTHETICAL" not in h.get("label", "").upper():
                h["label"] = f"HYPOTHETICAL: {h.get('label', 'Scenario')}"

        return hypotheses[0] if hypotheses else demo_fallback["hypotheses"][0]


investigation_service = InvestigationService()
