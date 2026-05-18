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


def _render_jest(func_name: str, case: Any, test_name: str, import_path: str) -> str:
    arg = _js_repr(case)
    lines = []
    if import_path:
        lines.append(f'const {{ {func_name} }} = require("{import_path}");')
        lines.append("")
    lines += [
        f'test("{test_name}", () => {{',
        f"  const result = {func_name}({arg});",
        "  expect(result).toBeDefined();",
        "});",
        "",
    ]
    return "\n".join(lines)


def generate_jest_tests(
    edge_cases: EdgeCaseSchema,
    import_path: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        for condition, values in fn_entry["edge_cases"].items():
            for idx, value in enumerate(values):
                test_name = f"{func}_case_{idx}"
                code = _render_jest(func, value, test_name, import_path)
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="javascript",
                        framework="jest",
                        code=code,
                    )
                )
    return tests
