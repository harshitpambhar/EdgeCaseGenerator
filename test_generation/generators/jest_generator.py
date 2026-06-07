"""
Jest (JavaScript/TypeScript) test generator.
Uses the language-agnostic behavior analyzer to generate behavior-driven assertions.
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
from test_generation.behavior_analyzer import generate_behavior_test_plans, _normalize_return_type

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


def _assertion_snippet(return_type: Any, expected_value: Any, classification: str) -> str:
    normalized = _normalize_return_type(return_type)
    
    if expected_value is True:
        return "expect(result).toBe(true);"
    if expected_value is False:
        return "expect(result).toBe(false);"
        
    if normalized == "list":
        return "expect(Array.isArray(result)).toBe(true);\n  expect(result.length).toBeGreaterThanOrEqual(0);"
    if normalized == "object":
        return 'expect(typeof result).toBe("object");\n  expect(result).not.toBeNull();'
    if normalized == "boolean":
        return 'expect(typeof result).toBe("boolean");'
    if normalized == "string":
        return 'expect(typeof result).toBe("string");'
    if normalized == "number":
        snippet = 'expect(typeof result).toBe("number");'
        if classification == "Calculation":
            snippet += "\n  expect(result).toBeGreaterThanOrEqual(0);"
        return snippet
        
    return "expect(result).not.toBeNull();"


def _render_exception_jest(func_name: str, args_str: str, test_name: str, import_path: str) -> str:
    lines = []
    if import_path:
        lines.append(f'const {{ {func_name} }} = require("{import_path}");')
        lines.append("")
    lines += [
        f'test("{test_name}", () => {{',
        f"  expect(() => {func_name}({args_str})).toThrow();",
        "});",
        "",
    ]
    return "\n".join(lines)


def _render_jest(
    func_name: str,
    args_str: str,
    test_name: str,
    import_path: str,
    return_type: Any,
    expected_value: Any,
    classification: str
) -> str:
    assertion_line = _assertion_snippet(return_type, expected_value, classification)
    lines = []
    if import_path:
        lines.append(f'const {{ {func_name} }} = require("{import_path}");')
        lines.append("")
    lines += [
        f'test("{test_name}", () => {{',
        f"  const result = {func_name}({args_str});",
        f"  {assertion_line}",
        "});",
        "",
    ]
    return "\n".join(lines)


def generate_jest_tests(
    edge_cases: EdgeCaseSchema,
    import_path: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    source_file = edge_cases.get("source_file", "unknown")
    relative_source = edge_cases.get("relative_source")
    
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        
        # Determine local import path
        current_import = import_path
        if not current_import and relative_source:
            stem = Path(relative_source).stem
            current_import = f"../{stem}"
            
        plans = generate_behavior_test_plans(fn_entry, "javascript")
        for plan in plans:
            test_name = plan["test_name"]
            inputs = plan["inputs"]
            expected_behavior = plan["expected_behavior"]
            expected_val = plan["expected_value"]
            
            # Map dictionary inputs to positional arguments based on parameter list
            args_list = []
            for p in fn_entry.get("parameters", []):
                if p in inputs:
                    args_list.append(inputs[p])
                elif fn_entry.get("default_values", {}).get(p) is not None:
                    args_list.append(fn_entry["default_values"][p])
                else:
                    args_list.append(None)
                    
            args_str = ", ".join(_js_repr(v) for v in args_list)
            
            if expected_behavior == "raises":
                code = _render_exception_jest(func, args_str, test_name, current_import)
            else:
                code = _render_jest(
                    func, args_str, test_name, current_import,
                    fn_entry.get("return_type"), expected_val, plan["classification"]
                )
                
            tests.append(
                GeneratedTest(
                    function=func,
                    test_name=test_name,
                    condition=plan["condition_source"],
                    case=inputs,
                    language=edge_cases.get("language", "javascript"),
                    framework="jest",
                    code=code,
                    source_file=source_file,
                    relative_source=relative_source,
                )
            )
            log.info("Generated jest test %s for %s (score=%d)", test_name, func, plan["quality_score"])
            
    return tests
