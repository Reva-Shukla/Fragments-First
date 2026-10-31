"""
LLM Service — Fragment First
Routes all Gemini generation through the Prune proxy.

Verified working configuration (2026-10-31):
  Provider : Prune → Gemini
  Model    : gemini-3.8-flash  (gemini-1.5-flash / gemini-2.5-flash both deprecated)
  Response : candidates[0].content.parts[0].text  (NOT choices[0].message.content)
  Auth     : prune_api_key only; no separate GEMINI_API_KEY required via Prune
  Caching  : Prune uses semantic caching. The connectivity probe uses a unique nonce
             to bypass the cache and force a real upstream call.

Modes:
  DEMO_MODE=true   — Returns clearly labelled synthetic responses. No API calls made.
  DEMO_MODE=false  — Requires PRUNE_API_KEY. Makes real calls to Gemini via Prune proxy.

Key model notes (gemini-3.8-flash):
  - This is a THINKING model. It internally uses tokens for chain-of-thought reasoning.
  - These thought tokens (visible as thoughtsTokenCount) consume from the max_tokens
    budget BEFORE any text output parts are produced.
  - Thought-only entries appear in parts with a 'thoughtSignature' key but NO 'text' key.
  - Minimum safe budget for connectivity probe: 512 tokens
  - Minimum safe budget for content generation: 4096 tokens
  - When max_tokens is exhausted entirely by thinking, the response has content:{} with
    no parts at all — we detect and report this explicitly.
"""

import json
import logging
import re
import time
import uuid
from typing import Any, Dict, Optional

from app.core.config import settings

logger = logging.getLogger("fragment_first.llm")

# ── Model configuration ────────────────────────────────────────────────────────
# gemini-1.5-flash : DEPRECATED — 404 Not Found
# gemini-2.5-flash : DEPRECATED — 404 Not Found (no longer available to new users)
# gemini-3.8-flash : CURRENT   — verified working 2026-10-31
GEMINI_MODEL = "gemini-3.8-flash"

# Token budgets (gemini-3.8-flash is a thinking model — allocate for thought + output)
GEMINI_MAX_TOKENS            = 4096   # content generation calls
GEMINI_CONNECTIVITY_TOKENS   = 512    # startup probe call


def _extract_text_from_gemini_response(data: Dict[str, Any]) -> str:
    """
    Extracts the generated text from the native Gemini response format.

    Verified response structure from Prune gateway:
      {
        "candidates": [{
          "content": {
            "parts": [
              {"text": "...", "thoughtSignature": "..."},   # thinking + output combined
              {"thoughtSignature": "..."}                   # thought-only, no text
            ],
            "role": "model"
          },
          "finishReason": "STOP" | "MAX_TOKENS" | ...,
          "index": 0
        }],
        "usageMetadata": {
          "promptTokenCount": N,
          "candidatesTokenCount": N,
          "thoughtsTokenCount": N,
          "totalTokenCount": N,
          ...
        },
        "modelVersion": "gemini-3.8-flash",
        "responseId": "..."
      }

    NOTE: prune_metadata is popped by post_proxy before this function sees the data.

    When the entire token budget is consumed by thinking (MAX_TOKENS during thought),
    the response may arrive as:
        "candidates": [{"content": {}, "finishReason": "MAX_TOKENS"}]
    i.e. content is an empty dict with no 'parts' key at all.
    """
    usage = data.get("usageMetadata", {})
    candidates = data.get("candidates")

    if not candidates:
        raise ValueError(
            f"Gemini response contained no 'candidates'. "
            f"Response keys: {list(data.keys())}"
        )

    candidate = candidates[0]
    finish_reason = candidate.get("finishReason", "UNKNOWN")

    logger.debug(
        "Gemini candidate: finishReason=%s  "
        "prompt=%s  output=%s  thoughts=%s  total=%s tokens",
        finish_reason,
        usage.get("promptTokenCount", "?"),
        usage.get("candidatesTokenCount", "?"),
        usage.get("thoughtsTokenCount", "?"),
        usage.get("totalTokenCount", "?"),
    )

    content = candidate.get("content") or {}   # handles both missing key and None
    parts = content.get("parts") or []         # handles both missing key and None

    # Filter to parts that carry text output — thinking-only entries have no 'text' key
    text_parts = [p["text"] for p in parts if "text" in p]

    if not text_parts:
        thought_tokens = usage.get("thoughtsTokenCount", "?")
        output_tokens  = usage.get("candidatesTokenCount", "?")

        if finish_reason == "MAX_TOKENS":
            raise ValueError(
                f"Gemini response exhausted its token budget ({GEMINI_MAX_TOKENS} max) "
                f"before producing any text output. "
                f"Thinking used {thought_tokens} tokens, output used {output_tokens}. "
                f"Increase GEMINI_MAX_TOKENS or shorten the prompt."
            )
        raise ValueError(
            f"Gemini response had no text output in any part. "
            f"finishReason={finish_reason}, "
            f"parts={[list(p.keys()) for p in parts]}"
        )

    if finish_reason == "MAX_TOKENS":
        logger.warning(
            "Gemini response was truncated at MAX_TOKENS=%d "
            "(thinking=%s tokens, output=%s tokens). "
            "Response may be incomplete.",
            GEMINI_MAX_TOKENS,
            usage.get("thoughtsTokenCount", "?"),
            usage.get("candidatesTokenCount", "?"),
        )

    return "".join(text_parts).strip()


class _PruneGeminiClient:
    """
    Thin, correctly typed wrapper around the Prune Gemini client.

    Key SDK facts (prune-sdk 0.3.0, verified by source inspection):
      - Gemini(prune_api_key=...) — raises PruneConfigError if key is absent.
      - generate_content(*, model, messages, max_tokens, ...) — ALL keyword-only.
      - Returns dict[str, Any] directly (NOT a wrapper object).
      - Response is Gemini-native format (candidates), NOT OpenAI format (choices).
    """

    def __init__(self, prune_api_key: str) -> None:
        from prune import Gemini, PruneConfigError

        try:
            self._client = Gemini(prune_api_key=prune_api_key)
        except PruneConfigError as exc:
            raise RuntimeError(
                f"Prune client constructor rejected the API key: {exc}"
            ) from exc

    def generate(self, prompt: str, max_tokens: int = GEMINI_MAX_TOKENS) -> str:
        """
        Make a generation request. Returns extracted text content.
        The prompt is sent as a user-role message.
        """
        data = self._client.generate_content(
            model=GEMINI_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return _extract_text_from_gemini_response(data)

    def connectivity_probe(self) -> str:
        """
        Performs a real network call to verify connectivity and API key validity.

        Uses a unique nonce in the prompt to prevent Prune's semantic cache from
        serving a stale or corrupted cached response — which would give a false
        positive (200 OK but no usable content).

        Raises on any failure; caller decides how to handle it.
        """
        nonce = uuid.uuid4().hex[:12]
        probe_prompt = (
            f"This is a connectivity probe [{nonce}]. "
            f"Reply with exactly one word: CONNECTED"
        )
        data = self._client.generate_content(
            model=GEMINI_MODEL,
            max_tokens=GEMINI_CONNECTIVITY_TOKENS,
            messages=[{"role": "user", "content": probe_prompt}],
        )
        return _extract_text_from_gemini_response(data)


class LLMService:
    """
    Central LLM service for Fragment First.

    DEMO_MODE=true   — synthetic responses only, no external calls.
    DEMO_MODE=false  — live Gemini calls via Prune proxy (requires PRUNE_API_KEY).

    At startup in live mode, a real connectivity probe is made to confirm that:
      (a) the Prune API key is accepted
      (b) the model endpoint responds
      (c) the response contains actual text output (not a cache artifact)

    If the probe fails, the service gracefully falls back to DEMO MODE rather than
    serving corrupted or absent AI responses silently.
    """

    def __init__(self) -> None:
        self._prune_api_key: Optional[str] = settings.PRUNE_API_KEY
        self._demo_mode: bool = self._resolve_demo_mode()
        self._client: Optional[_PruneGeminiClient] = None

        if not self._demo_mode:
            self._init_live_client()

        self._log_startup_state()

    # ── Initialisation ─────────────────────────────────────────────────────────

    def _resolve_demo_mode(self) -> bool:
        if settings.DEMO_MODE:
            return True
        if not self._prune_api_key or not self._prune_api_key.strip():
            logger.warning(
                "DEMO_MODE=false but PRUNE_API_KEY is not configured. "
                "Falling back to DEMO MODE. Set PRUNE_API_KEY in .env to enable live AI."
            )
            return True
        return False

    def _init_live_client(self) -> None:
        """
        Instantiates the Prune client, then makes a real probe call.
        We never trust constructor-only initialisation as proof of auth.
        """
        try:
            self._client = _PruneGeminiClient(prune_api_key=self._prune_api_key)
        except Exception as exc:
            logger.error(
                "[FAIL] Prune client initialisation failed -- switching to DEMO MODE. "
                "Reason: %s", exc
            )
            self._demo_mode = True
            return

        # Real connectivity + auth + model validation
        try:
            reply = self._client.connectivity_probe()
            logger.info(
                "[OK] Prune -> Gemini connectivity confirmed. "
                "model=%s  probe_reply=%r",
                GEMINI_MODEL, reply[:60],
            )
        except Exception as exc:
            err = str(exc)
            if "401" in err or "403" in err or "authentication" in err.lower():
                logger.error(
                    "[FAIL] Prune authentication failed -- check PRUNE_API_KEY. "
                    "Switching to DEMO MODE. Error: %s", err[:300]
                )
            elif "404" in err:
                logger.error(
                    "[FAIL] Gemini model '%s' not found via Prune. "
                    "Switching to DEMO MODE. Error: %s", GEMINI_MODEL, err[:300]
                )
            elif "429" in err or "quota" in err.lower():
                logger.error(
                    "[FAIL] Prune/Gemini quota exceeded or rate-limited. "
                    "Switching to DEMO MODE. Error: %s", err[:300]
                )
            elif "MAX_TOKENS" in err or "token budget" in err.lower():
                logger.error(
                    "[FAIL] Connectivity probe exhausted token budget -- "
                    "model config or Prune account issue. "
                    "Switching to DEMO MODE. Error: %s", err[:300]
                )
            else:
                logger.error(
                    "[FAIL] Prune connectivity probe failed -- switching to DEMO MODE. "
                    "Error: %s", err[:300]
                )
            self._demo_mode = True
            self._client = None

    def _log_startup_state(self) -> None:
        if self._demo_mode:
            logger.info(
                "LLMService active in DEMO MODE — "
                "all responses are synthetic placeholders. "
                "No external API calls will be made."
            )
        else:
            logger.info(
                "LLMService active in LIVE MODE -- "
                "model=%s  provider=Prune->Gemini",
                GEMINI_MODEL,
            )

    # ── Public API ─────────────────────────────────────────────────────────────

    def is_demo_mode(self) -> bool:
        return self._demo_mode

    @staticmethod
    def _clean_json_response(text: str) -> str:
        """Strips markdown code fences from JSON output."""
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        return text

    def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        """
        Generates raw text.

        Demo mode  → clearly-labelled synthetic placeholder.
        Live mode  → real Gemini call, up to 3 retries with back-off.
                     Raises RuntimeError on persistent failure (never silently fakes it).
        """
        if self._demo_mode:
            return (
                "[DEMO MODE] Synthetic response — no AI model was called. "
                f"Prompt excerpt: {prompt[:80]}…"
            )

        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        last_error: Optional[Exception] = None

        for attempt in range(1, 4):
            try:
                text = self._client.generate(full_prompt, max_tokens=GEMINI_MAX_TOKENS)
                logger.info(
                    "[OK] Gemini generate_text: attempt=%d  output_chars=%d",
                    attempt, len(text),
                )
                return text
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini generate_text attempt %d/3 failed: %s", attempt, exc
                )
                if attempt < 3:
                    time.sleep(attempt)

        raise RuntimeError(
            f"Gemini API failed after 3 attempts. Last error: {last_error}"
        )

    def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        demo_fallback: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates a structured JSON response.

        Demo mode  → returns demo_fallback labelled _meta.source = DEMO_MODE_MOCK.
        Live mode  → real Gemini call with JSON parsing, up to 3 retries.
                     On success: _meta.source = GEMINI_LIVE_API.
                     On failure: returns demo_fallback labelled LIVE_FALLBACK_AFTER_ERROR
                                 — never silently presented as a live model response.
        """
        if self._demo_mode:
            payload = dict(demo_fallback) if demo_fallback is not None else {}
            payload["_meta"] = {
                "source": "DEMO_MODE_MOCK",
                "note": (
                    "Synthetic response — set DEMO_MODE=false and provide PRUNE_API_KEY "
                    "in .env to use live Gemini."
                ),
            }
            return payload

        json_suffix = (
            "\n\nIMPORTANT: Respond with pure, valid JSON ONLY. "
            "Do not wrap in markdown code fences. "
            "Do not add any text outside the JSON object."
        )
        full_prompt = (
            f"{system_instruction}\n\n{prompt}{json_suffix}"
            if system_instruction
            else f"{prompt}{json_suffix}"
        )

        last_error: Optional[Exception] = None
        raw = ""

        for attempt in range(1, 4):
            try:
                raw = self._client.generate(full_prompt, max_tokens=GEMINI_MAX_TOKENS)
                logger.debug(
                    "Gemini raw output attempt %d (%d chars): %.150s…",
                    attempt, len(raw), raw,
                )
                clean = self._clean_json_response(raw)
                parsed = json.loads(clean)
                parsed["_meta"] = {
                    "source": "GEMINI_LIVE_API",
                    "model": GEMINI_MODEL,
                }
                logger.info(
                    "[OK] Gemini live JSON response parsed successfully on attempt %d "
                    "(%d chars).", attempt, len(raw),
                )
                return parsed
            except json.JSONDecodeError as jde:
                last_error = jde
                logger.warning(
                    "JSON parse failed on attempt %d/3: %s  "
                    "Raw excerpt: %.200s", attempt, jde, raw,
                )
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini call failed on attempt %d/3: %s", attempt, exc
                )
            if attempt < 3:
                time.sleep(attempt)

        logger.error(
            "[FAIL] All 3 Gemini attempts failed. Last error: %s. "
            "Returning fallback labelled LIVE_FALLBACK_AFTER_ERROR.", last_error
        )
        payload = dict(demo_fallback) if demo_fallback is not None else {}
        payload["_meta"] = {
            "source": "LIVE_FALLBACK_AFTER_ERROR",
            "model": GEMINI_MODEL,
            "error": str(last_error)[:300],
            "note": (
                "Live Gemini call failed after 3 attempts. "
                "This is a fallback — not a model-generated answer."
            ),
        }
        return payload


# ── Global singleton — initialised once at server startup ─────────────────────
llm_service = LLMService()
