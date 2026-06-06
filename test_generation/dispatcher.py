"""
Test generation dispatcher.

Maps language → (framework, generator_callable).
To add a new language/framework, register it in GENERATOR_REGISTRY.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Callable

_HERE = Path(__file__).resolve().parent   # test-generation/
_ROOT = _HERE.parent
for _p in (str(_ROOT), str(_HERE)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from typing import Any

from shared.schemas.models import EdgeCaseSchema, GeneratedTest
from shared.utils.logger import get_logger
from edge_case_engine.ai_enhancement import generate_semantic_enrichment, ai_generation_enabled

log = get_logger(__name__)

# language → (framework, generator_callable)
GENERATOR_REGISTRY: dict[str, tuple[str, Callable]] = {}


def _register_defaults() -> None:
    from generators.pytest_generator import generate_pytest_tests
    from generators.jest_generator import generate_jest_tests
    from generators.junit_generator import generate_junit_tests

    GENERATOR_REGISTRY["python"]     = ("pytest", generate_pytest_tests)
    GENERATOR_REGISTRY["javascript"] = ("jest",   generate_jest_tests)
    GENERATOR_REGISTRY["typescript"] = ("jest",   generate_jest_tests)
    GENERATOR_REGISTRY["java"]       = ("junit",  generate_junit_tests)


_register_defaults()


def _function_priority(function_name: str, edge_cases: dict[str, Any]) -> tuple[str, int]:
    conditions = list(edge_cases.keys()) if isinstance(edge_cases, dict) else []
    total_cases = 0
    if isinstance(edge_cases, dict):
        for values in edge_cases.values():
            if isinstance(values, list):
                total_cases += len(values)
            elif values is not None:
                total_cases += 1
    complexity_score = int(edge_cases.get("complexity_score", 0) or 0) if isinstance(edge_cases, dict) else 0

    score = 0
    if function_name and not function_name.startswith("_"):
        score += 2
    if total_cases >= 10:
        score += 2
    elif total_cases >= 4:
        score += 1
    if conditions:
        score += min(3, len(conditions))
    if complexity_score >= 5:
        score += 2
    elif complexity_score >= 3:
        score += 1
    if total_cases >= 6:
        score += 2
    elif total_cases >= 2:
        score += 1

    if score >= 7:
        return "high", score
    if score >= 3:
        return "medium", score
    return "low", score


def _should_generate_tests(function_name: str, edge_case_entry: dict[str, Any]) -> bool:
    if function_name.startswith("test_"):
        log.info("Skipping existing test function: %s", function_name)
        return False
    if function_name.startswith("__"):
        log.info("Skipping dunder function: %s", function_name)
        return False
    if function_name.startswith("_"):
        log.info("Skipping wrapper/helper function: %s", function_name)
        return False

    total_cases = 0
    for values in edge_case_entry.get("edge_cases", {}).values():
        if isinstance(values, list):
            total_cases += len(values)
        elif values is not None:
            total_cases += 1

    priority, score = _function_priority(function_name, edge_case_entry)
    if priority == "low" or total_cases == 0:
        log.info("Skipping trivial function: %s (score=%d)", function_name, score)
        return False

    log.info("Generating tests for function: %s (priority=%s, score=%d)", function_name, priority, score)
    return True


def _max_cases_for_priority(priority: str) -> int:
    if priority == "high":
        return 6
    if priority == "medium":
        return 3
    return 0


def _trim_edge_case_entry(edge_case_entry: dict[str, Any], max_cases: int) -> dict[str, Any]:
    if max_cases <= 0:
        return {"name": edge_case_entry.get("name", ""), "edge_cases": {}}

    trimmed: dict[str, list[Any]] = {}
    remaining = max_cases
    edge_case_items = list(edge_case_entry.get("edge_cases", {}).items())
    edge_case_items.sort(
        key=lambda item: (
            0 if str(item[0]).startswith("exception:") else 1 if str(item[0]).startswith("semantic:") else 2,
            0 if ":valid" in str(item[0]) else 1 if ":invalid" in str(item[0]) else 2,
            str(item[0]),
        )
    )
    for condition, values in edge_case_items:
        if remaining <= 0:
            break
        if not isinstance(values, list):
            values = [values]
        selected = values[:remaining]
        if selected:
            trimmed[condition] = selected
            remaining -= len(selected)

    return {
        "name": edge_case_entry.get("name", ""),
        "edge_cases": trimmed,
    }


def _merge_edge_cases(base: dict[str, list[Any]], extra: dict[str, list[Any]] | None) -> dict[str, list[Any]]:
    merged: dict[str, list[Any]] = {key: list(values) for key, values in base.items()}
    if not extra:
        return merged
    for key, values in extra.items():
        if not isinstance(values, list):
            continue
        merged.setdefault(key, [])
        for value in values:
            if value not in merged[key]:
                merged[key].append(value)
    return merged


def _dedupe_generated_tests(tests: list[GeneratedTest]) -> list[GeneratedTest]:
    seen: set[tuple[Any, ...]] = set()
    deduped: list[GeneratedTest] = []
    for test in tests:
        identity = (
            test.get("function"),
            repr(test.get("case")),
            test.get("assertion_kind"),
            test.get("purpose"),
        )
        if identity in seen:
            continue
        seen.add(identity)
        deduped.append(test)
    return deduped


def generate_tests(
    edge_cases: EdgeCaseSchema,
    language: str,
    **kwargs,
) -> list[GeneratedTest]:
    """
    Generate tests for the given language.
    Extra kwargs are forwarded to the language-specific generator.
    """
    entry = GENERATOR_REGISTRY.get(language)
    if entry is None:
        log.warning("No test generator for language '%s'", language)
        return []
    framework, generator_fn = entry
    log.info(
        "Generating %s tests (%s) for %s",
        framework, language, edge_cases["source_file"],
    )
    try:
        filtered_functions = []
        for fn_entry in edge_cases.get("functions", []):
            function_name = fn_entry.get("name", "")
            if not _should_generate_tests(function_name, fn_entry):
                continue

            priority, _ = _function_priority(function_name, fn_entry)
            max_cases = _max_cases_for_priority(priority)
            trimmed = _trim_edge_case_entry(fn_entry, max_cases)
            if trimmed["edge_cases"]:
                trimmed["parameters"] = fn_entry.get("parameters", [])
                trimmed["parameter_details"] = fn_entry.get("parameter_details", [])
                trimmed["return_type"] = fn_entry.get("return_type")
                trimmed["docstring"] = fn_entry.get("docstring", "")
                trimmed["allowed_values"] = fn_entry.get("allowed_values", {})
                trimmed["exceptions_detail"] = fn_entry.get("exceptions_detail", [])
                trimmed["complexity_score"] = fn_entry.get("complexity_score", 0)

                if ai_generation_enabled():
                    function_data = {
                        "name": trimmed.get("name", ""),
                        "parameters": trimmed.get("parameters", []),
                        "parameter_details": trimmed.get("parameter_details", []),
                        "return_type": trimmed.get("return_type"),
                        "docstring": trimmed.get("docstring", ""),
                        "allowed_values": trimmed.get("allowed_values", {}),
                        "exceptions_detail": trimmed.get("exceptions_detail", []),
                    }
                    log.info("AI generation enabled | requesting enrichment for %s", function_name)
                    ai_edge_cases = generate_semantic_enrichment(function_data, language, framework)
                    if ai_edge_cases:
                        log.info("Merging AI edge cases for %s | keys=%s", function_name, list(ai_edge_cases.keys()))
                        trimmed["edge_cases"] = _merge_edge_cases(trimmed["edge_cases"], ai_edge_cases)
                    else:
                        log.info("AI returned nothing for %s — rule-based cases retained", function_name)
                filtered_functions.append(trimmed)

        filtered_edge_cases = {
            "source_file": edge_cases["source_file"],
            "functions": filtered_functions,
        }
        if not filtered_edge_cases["functions"]:
            log.warning("No high-value functions found for %s", edge_cases["source_file"])
            return []

        for fn in filtered_edge_cases["functions"]:
            function_data = {
                "name": fn.get("name", ""),
                "parameters": fn.get("parameter_details", []) or [{"name": p, "type": "unknown"} for p in fn.get("parameters", [])],
                "return_type": fn.get("return_type"),
                "docstring": fn.get("docstring", ""),
                "allowed_values": fn.get("allowed_values", {}),
                "exceptions": fn.get("exceptions_detail", []),
                "conditions": list((fn.get("edge_cases") or {}).keys()),
            }
            log.debug("Function metadata before generation: %s", json.dumps(function_data, indent=2))

        generated_tests = generator_fn(filtered_edge_cases, **kwargs)
        generated_tests = _dedupe_generated_tests(generated_tests)
        log.info("Generated %d unique tests for %s", len(generated_tests), edge_cases["source_file"])
        return generated_tests
    except Exception as exc:
        log.error("Test generation failed for %s: %s", language, exc)
        return []
