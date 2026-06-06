"""
Jest (JavaScript/TypeScript) test generator.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parents[3]  # repo root
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.schemas.models import EdgeCaseSchema, GeneratedTest
from shared.utils.logger import get_logger

log = get_logger(__name__)


def _js_repr(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        if value == float("inf"):
            return "Infinity"
        if value == float("-inf"):
            return "-Infinity"
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    if isinstance(value, list):
        return "[" + ", ".join(_js_repr(v) for v in value) + "]"
    if isinstance(value, dict):
        pairs = ", ".join(f'"{k}": {_js_repr(v)}' for k, v in value.items())
        return "{" + pairs + "}"
    return "null"


def _normalize_return_type(return_type: Any) -> str:
    if not return_type:
        return "unknown"
    text = str(return_type).strip().lower()
    if any(token in text for token in ("list", "array", "tuple", "set")):
        return "list"
    if any(token in text for token in ("dict", "map", "object", "json")):
        return "object"
    if "bool" in text:
        return "boolean"
    if any(token in text for token in ("str", "string", "text")):
        return "string"
    if any(token in text for token in ("int", "float", "number", "decimal", "long")):
        return "number"
    return "unknown"


def _assertion_snippet(return_type: Any) -> tuple[str, str]:
    normalized = _normalize_return_type(return_type)
    if normalized == "list":
        return ("expect(Array.isArray(result)).toBe(true);", "semantic:list")
    if normalized == "object":
        return ("expect(result).toEqual(expect.any(Object));", "semantic:object")
    if normalized == "boolean":
        return ("expect(typeof result).toBe(\"boolean\");", "semantic:boolean")
    if normalized == "string":
        return ("expect(typeof result).toBe(\"string\");", "semantic:string")
    if normalized == "number":
        return ("expect(typeof result).toBe(\"number\");", "semantic:number")
    return ("expect(result).not.toBeNull();", "fallback:not_null")


def _render_exception_jest(func_name: str, case: Any, test_name: str, import_path: str, exception_type: str) -> str:
    arg = _js_repr(case)
    lines = []
    if import_path:
        lines.append(f'const {{ {func_name} }} = require("{import_path}");')
        lines.append("")
    lines += [
        f'test("{test_name}", () => {{',
        f"  expect(() => {func_name}({arg})).toThrow();",
        "});",
        "",
    ]
    return "\n".join(lines)


def _render_jest(func_name: str, case: Any, test_name: str, import_path: str, return_type: Any) -> tuple[str, str]:
    arg = _js_repr(case)
    assertion_line, assertion_kind = _assertion_snippet(return_type)
    lines = []
    if import_path:
        lines.append(f'const {{ {func_name} }} = require("{import_path}");')
        lines.append("")
    lines += [
        f'test("{test_name}", () => {{',
        f"  const result = {func_name}({arg});",
        f"  {assertion_line}",
        "});",
        "",
    ]
    return "\n".join(lines), assertion_kind


def generate_jest_tests(
    edge_cases: EdgeCaseSchema,
    import_path: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        return_type = fn_entry.get("return_type")
        exception_types = fn_entry.get("exceptions_detail", []) or []
        for condition, values in fn_entry["edge_cases"].items():
            is_exception_case = isinstance(condition, str) and condition.startswith("exception:")
            exception_type = condition.split(":", 1)[1] if is_exception_case and ":" in condition else (exception_types[0] if exception_types else "Error")
            for idx, value in enumerate(values):
                test_name = f"{func}_case_{idx}"
                if is_exception_case:
                    code = _render_exception_jest(func, value, test_name, import_path, exception_type)
                    assertion_kind = f"exception:{exception_type}"
                    purpose = f"raise:{exception_type}"
                else:
                    code, assertion_kind = _render_jest(func, value, test_name, import_path, return_type)
                    purpose = f"semantic:{condition}"
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="javascript",
                        framework="jest",
                        code=code,
                        assertion_kind=assertion_kind,
                        exception_type=exception_type if is_exception_case else None,
                        quality_score=90 if is_exception_case else (80 if assertion_kind.startswith("semantic") else 50),
                        purpose=purpose,
                    )
                )
                log.info("Generated jest test %s for %s (%s)", test_name, func, assertion_kind)
    return tests
