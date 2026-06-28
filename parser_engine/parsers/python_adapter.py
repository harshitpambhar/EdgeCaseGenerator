"""
Thin adapter that wraps the existing python_parser and returns ParsedFileSchema.
The original python_parser.py is NOT modified.
"""
from __future__ import annotations

import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent   # parser-engine/parsers/
_ROOT = _HERE.parents[1]                  # repo root
for _p in (str(_ROOT), str(_HERE.parent)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from shared.schemas.models import FunctionSchema, ParsedFileSchema
from parsers.python_parser import parse_python_file as _orig_parse


def parse_python_file(file_path: str) -> ParsedFileSchema:
    raw = _orig_parse(file_path)
    functions: list[FunctionSchema] = []
    for fn in raw.get("functions", []):
        functions.append(
            FunctionSchema(
                name=fn.get("name", ""),
                parameters=fn.get("parameters", []),
                parameter_details=fn.get("parameter_details", []),
                return_type=fn.get("return_type"),
                docstring=fn.get("docstring", ""),
                conditions=fn.get("conditions", []),
                branch_conditions=fn.get("branch_conditions", []),
                comparison_operators=fn.get("comparison_operators", []),
                literal_values=fn.get("literal_values", []),
                allowed_values=fn.get("allowed_values", {}),
                default_values=fn.get("default_values", {}),
                exceptions_detail=fn.get("exceptions_detail", []),
                loops=fn.get("loops", 0),
                returns=fn.get("returns", 0),
                exceptions=fn.get("exceptions", 0),
                operators=fn.get("operators", []),
                nesting_depth=fn.get("nesting_depth", 0),
                complexity_score=fn.get("complexity_score", 0),
                apis=fn.get("apis", []),
                imports=fn.get("imports", []),
            )
        )
    return ParsedFileSchema(
        source_file=file_path,
        language="python",
        function_count=len(functions),
        functions=functions,
    )
