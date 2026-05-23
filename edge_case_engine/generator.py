"""
Extended edge-case generator.

Wraps the existing ml_service generator and adds:
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

_HERE = Path(__file__).resolve().parent   # edge_case_engine/
_ROOT = _HERE.parent                      # repo root
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.schemas.models import EdgeCaseSchema, FunctionEdgeCases, ParsedFileSchema
from shared.utils.logger import get_logger

from ml_service.edge_case_engine.generator import generate_edge_cases as _base_generate

from edge_case_engine.rules import (
    BOOLEAN_EDGE_CASES,
    COLLECTION_EDGE_CASES,
    STRING_EDGE_CASES,
)

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
    
    try:
        functions = parsed.get("functions", [])
        if not isinstance(functions, list):
            log.error(f"Expected functions to be list, got {type(functions)}: {functions}")
            functions = []
        
        for idx, fn in enumerate(functions):
            if not isinstance(fn, dict):
                log.error(f"Function {idx} is not a dict: {type(fn)} - {fn}")
                continue
            
            ec: dict[str, list[Any]] = {}
            try:
                for condition in fn.get("conditions", []):
                    ec[condition] = generate_edge_cases_extended(condition)
                function_cases.append({
                    "name": fn.get("name", f"unknown_{idx}"),
                    "edge_cases": ec
                })
            except Exception as e:
                log.error(f"Error processing function {idx}: {e}")
                log.error(f"Function data: {fn}")
        
        return {
            "source_file": parsed.get("source_file", "unknown"),
            "functions": function_cases,
        }
    except Exception as e:
        log.error(f"Error in generate_edge_cases_for_file: {e}")
        log.error(f"Parsed data: {parsed}")
        raise
