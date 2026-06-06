"""
Extended edge-case generator.

Wraps the existing ml-service generator and adds:
  - null/None cases
  - string edge cases
  - boolean combinations
  - collection edge cases
  - type confusion
  - overflow values
  - AND/OR compound condition splitting
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

_HERE = Path(__file__).resolve().parent   # edge-case-engine/
_ROOT = _HERE.parent                      # repo root

# Add repo root (for shared/) and ml-service (for existing generator)
for _p in (str(_ROOT), str(_ROOT / "ml-service")):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Reuse existing boundary logic from ml-service (unchanged)
from edge_case_engine.generator import generate_edge_cases as _base_generate

# Import extended rules from this package's rules.py
from rules import (
    BOOLEAN_EDGE_CASES,
    COLLECTION_EDGE_CASES,
    STRING_EDGE_CASES,
)

from shared.schemas.models import EdgeCaseSchema, FunctionEdgeCases, ParsedFileSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)

_NUMERIC_PATTERN = re.compile(
    r"^\s*[A-Za-z_]\w*\s*(>=|<=|==|!=|>|<)\s*(-?\d+)\s*$"
)
_STRING_PATTERN = re.compile(
    r"""^\s*[A-Za-z_]\w*\s*==\s*["'](.*)["']\s*$"""
)
_BOOL_PATTERN = re.compile(
    r"^\s*(?:not\s+)?[A-Za-z_]\w*\s*(?:is\s+(?:True|False|None))?\s*$",
    re.IGNORECASE,
)
_LIST_PATTERN = re.compile(
    r"^\s*[A-Za-z_]\w*\s*(?:\[0\]|\.length|len\s*\()",
    re.IGNORECASE,
)


def _dedupe(values: list[Any]) -> list[Any]:
    seen: list[Any] = []
    for value in values:
        if value not in seen:
            seen.append(value)
    return seen


def _is_known_list_type(type_text: str | None) -> bool:
    return bool(type_text and type_text.lower() in {"list", "array", "sequence", "tuple", "set"})


def _is_known_bool_type(type_text: str | None) -> bool:
    return bool(type_text and type_text.lower() in {"bool", "boolean"})


def _is_known_number_type(type_text: str | None) -> bool:
    return bool(type_text and type_text.lower() in {"int", "float", "number", "decimal", "long"})


def _semantic_invalid_cases(param_name: str, param_type: str | None) -> list[Any]:
    if _is_known_bool_type(param_type):
        return [None, 0, 1, "true", "false"]
    if _is_known_number_type(param_type):
        return [None, "", -1, 0, 1, 2**31 - 1, -(2**31)]
    if _is_known_list_type(param_type):
        return [None, [], [None], [0], {}]
    return [None, "", " ", "__invalid__", 0, False, [], {}]


def _make_case_value(param_name: str, value: Any, parameter_details: list[dict[str, Any]], defaults: dict[str, Any]) -> Any:
    if len(parameter_details) <= 1:
        return value

    case: dict[str, Any] = {}
    for detail in parameter_details:
        name = str(detail.get("name", ""))
        if not name:
            continue
        if name == param_name:
            case[name] = value
        elif name in defaults:
            case[name] = defaults[name]
        else:
            case[name] = None
    return case if case else value


def _build_semantic_edge_cases(fn: dict[str, Any]) -> dict[str, list[Any]]:
    semantic: dict[str, list[Any]] = {}
    parameter_details = fn.get("parameter_details", []) or []
    defaults = fn.get("default_values", {}) or {}
    allowed_values = fn.get("allowed_values", {}) or {}
    exception_types = fn.get("exceptions_detail", []) or []
    return_type = fn.get("return_type")
    literal_values = fn.get("literal_values", []) or []

    for param_name, values in allowed_values.items():
        detail = next((item for item in parameter_details if item.get("name") == param_name), {})
        param_type = detail.get("type") if isinstance(detail, dict) else None
        valid_key = f"semantic:{param_name}:valid"
        invalid_key = f"semantic:{param_name}:invalid"
        semantic[valid_key] = [_make_case_value(param_name, value, parameter_details, defaults) for value in values]
        semantic[invalid_key] = [
            _make_case_value(param_name, value, parameter_details, defaults)
            for value in _semantic_invalid_cases(param_name, param_type)
        ]

    # When no allowed_values, synthesise valid cases from literal_values per parameter
    if not semantic and literal_values and parameter_details:
        for detail in parameter_details:
            param_name = str(detail.get("name", ""))
            if not param_name:
                continue
            semantic[f"semantic:{param_name}:valid"] = [
                _make_case_value(param_name, v, parameter_details, defaults)
                for v in literal_values[:5]  # cap at 5 literals per param
            ]

    if not semantic and parameter_details:
        for detail in parameter_details:
            param_name = str(detail.get("name", ""))
            if not param_name:
                continue
            param_type = detail.get("type")
            semantic[f"semantic:{param_name}:invalid"] = [
                _make_case_value(param_name, value, parameter_details, defaults)
                for value in _semantic_invalid_cases(param_name, param_type)
            ]

    for exc in exception_types:
        semantic[f"exception:{exc}"] = [
            _make_case_value(
                parameter_details[0].get("name", "arg") if parameter_details else "arg",
                value,
                parameter_details,
                defaults,
            )
            for value in [None, "", "__invalid__", False, 0]
        ]

    if return_type:
        semantic.setdefault(f"return_type:{return_type}", [])

    return {key: _dedupe(values) for key, values in semantic.items() if values}


def _priority_for_function(fn: dict[str, Any]) -> str:
    score = 0
    name = str(fn.get("name", ""))
    if name and not name.startswith("_"):
        score += 2
    if fn.get("exceptions_detail"):
        score += 2
    if len(fn.get("conditions", []) or []) >= 2:
        score += 2
    if len(fn.get("allowed_values", {}) or {}) >= 1:
        score += 2
    if int(fn.get("complexity_score", 0) or 0) >= 5:
        score += 2
    elif int(fn.get("complexity_score", 0) or 0) >= 3:
        score += 1
    if score >= 7:
        return "high"
    if score >= 3:
        return "medium"
    return "low"


def _split_compound(condition: str) -> list[str]:
    """Split AND/OR compound conditions into individual sub-conditions."""
    parts = re.split(r"\s+(?:and|or|&&|\|\|)\s+", condition, flags=re.IGNORECASE)
    return [p.strip() for p in parts if p.strip()]


def generate_edge_cases_extended(condition: str) -> list[Any]:
    """
    Generate a rich set of edge cases for a single condition string.
    Delegates numeric boundary logic to the existing base generator.
    """
    sub_conditions = _split_compound(condition)
    cases: list[Any] = []

    for sub in sub_conditions:
        if _NUMERIC_PATTERN.match(sub):
            cases.extend(_base_generate(sub))
        elif _STRING_PATTERN.match(sub):
            cases.extend(STRING_EDGE_CASES)
        elif _BOOL_PATTERN.match(sub):
            cases.extend(BOOLEAN_EDGE_CASES)
        elif _LIST_PATTERN.match(sub):
            cases.extend(COLLECTION_EDGE_CASES)
        else:
            cases.extend([None, "", 0, False, [], {}])

    # Deduplicate while preserving order (None/unhashable safe)
    seen: list[Any] = []
    for c in cases:
        if c not in seen:
            seen.append(c)
    return seen


def generate_edge_cases_for_file(parsed: ParsedFileSchema) -> EdgeCaseSchema:
    """Generate edge cases for every function in a ParsedFileSchema."""
    function_cases: list[FunctionEdgeCases] = []
    for fn in parsed["functions"]:
        ec: dict[str, list[Any]] = {}
        for condition in fn.get("conditions", []):
            ec[condition] = generate_edge_cases_extended(condition)
        function_cases.append(
            FunctionEdgeCases(name=fn["name"], edge_cases=ec)
        )
    return EdgeCaseSchema(
        source_file=parsed["source_file"],
        functions=function_cases,
    )
