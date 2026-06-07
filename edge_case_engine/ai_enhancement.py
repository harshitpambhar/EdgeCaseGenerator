"""
Optional Ollama-assisted semantic enhancement.

This module is intentionally additive: when Ollama is unavailable, disabled,
or returns invalid output, callers should ignore the result and continue with
the existing rule-based pipeline.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from shared.utils.logger import get_logger

log = get_logger(__name__)


def ai_generation_enabled() -> bool:
    return os.getenv("ENABLE_AI_GENERATION", "false").strip().lower() in {"1", "true", "yes", "on"}


def _ollama_url() -> str:
    base_url = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    return f"{base_url}/api/chat"


def _model_name() -> str:
    return os.getenv("OLLAMA_MODEL", "qwen2.5:7b")


def _build_payload(function_data: dict[str, Any], language: str, framework: str) -> dict[str, Any]:
    return {
        "model": _model_name(),
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a test-case generator. Respond with strict JSON only — "
                    "no markdown, no code fences, no commentary. "
                    'Schema: {"edge_cases": {"<key>": [<value>, ...]}, '
                    '"assertion_hints": {"<condition_key>": "<assert_expression>"}, '
                    '"exception_cases": [{"exception_type": "<Type>", "inputs": [<value>]}]}'
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "function_name": function_data.get("name"),
                        "parameters": function_data.get("parameter_details") or function_data.get("parameters", []),
                        "allowed_values": function_data.get("allowed_values", {}),
                        "exceptions": function_data.get("exceptions_detail", []),
                        "return_type": function_data.get("return_type"),
                        "language": language,
                        "framework": framework,
                        "task": (
                            "Generate semantic edge cases for each parameter including valid, "
                            "invalid, boundary, and null values. Include exception test inputs "
                            "for every declared exception type. Return assertion_hints "
                            "that describe what to assert on the result per condition key."
                        ),
                    },
                    indent=2,
                    ensure_ascii=False,
                ),
            },
        ],
    }


def generate_semantic_enrichment(function_data: dict[str, Any], language: str, framework: str) -> dict[str, list[Any]] | None:
    if not ai_generation_enabled():
        return None

    payload = _build_payload(function_data, language, framework)
    log.info(
        "AI request | function=%s lang=%s framework=%s",
        function_data.get("name", ""),
        language,
        framework,
    )
    log.debug("AI request payload: %s", json.dumps(payload, ensure_ascii=False))
    request = urllib.request.Request(
        _ollama_url(),
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:  # noqa: S310
            body = response.read().decode("utf-8", errors="replace")
        log.info("AI response | function=%s status=ok", function_data.get("name", ""))
        log.debug("AI raw response: %s", body)
        data = json.loads(body)
        content = data.get("message", {}).get("content", "")
        parsed = json.loads(content) if isinstance(content, str) else {}

        result: dict[str, list[Any]] = {}

        edge_cases = parsed.get("edge_cases", {})
        if isinstance(edge_cases, dict):
            for key, value in edge_cases.items():
                if isinstance(value, list):
                    result[str(key)] = value

        # Lift exception_cases into the standard exception: key format
        for exc_case in (parsed.get("exception_cases") or []):
            if not isinstance(exc_case, dict):
                continue
            exc_type = str(exc_case.get("exception_type", "Exception"))
            inputs = exc_case.get("inputs", [])
            if isinstance(inputs, list) and inputs:
                key = f"exception:{exc_type}"
                existing = result.get(key, [])
                for v in inputs:
                    if v not in existing:
                        existing.append(v)
                result[key] = existing

        if result:
            log.info("AI enrichment available | function=%s keys=%s", function_data.get("name", ""), list(result.keys()))
            return result
        log.warning("AI response yielded no usable cases | function=%s", function_data.get("name", ""))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        log.warning("AI unavailable | function=%s reason=%s", function_data.get("name", ""), exc)
    except Exception as exc:
        log.warning("AI failed | function=%s reason=%s", function_data.get("name", ""), exc)
    return None