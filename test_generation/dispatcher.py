"""
Test generation dispatcher.

Maps language → (framework, generator_callable).
To add a new language/framework, register it in GENERATOR_REGISTRY.
"""
from __future__ import annotations

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
    conditions = list(edge_cases.get("edge_cases", {}).keys()) if isinstance(edge_cases, dict) else []
    total_cases = 0
    if isinstance(edge_cases, dict):
        for values in edge_cases.get("edge_cases", {}).values():
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
    trimmed: dict[str, list[Any]] = {}
    if max_cases > 0:
        remaining = max_cases
        for condition, values in edge_case_entry.get("edge_cases", {}).items():
            if remaining <= 0:
                break
            if not isinstance(values, list):
                values = [values]
            selected = values[:remaining]
            if selected:
                trimmed[condition] = selected
                remaining -= len(selected)

    result = dict(edge_case_entry)
    result["edge_cases"] = trimmed
    return result


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
                filtered_functions.append(trimmed)

        filtered_edge_cases = {
            "source_file": edge_cases["source_file"],
            "relative_source": edge_cases.get("relative_source"),
            "functions": filtered_functions,
        }
        if not filtered_edge_cases["functions"]:
            log.warning("No high-value functions found for %s", edge_cases["source_file"])
            return []
        return generator_fn(filtered_edge_cases, **kwargs)
    except Exception as exc:
        log.error("Test generation failed for %s: %s", language, exc)
        return []
