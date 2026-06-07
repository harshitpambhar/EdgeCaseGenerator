"""
pytest test generator.
Uses the language-agnostic behavior analyzer to generate behavior-driven assertions and mocks.
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


def _safe_repr(value: Any) -> str:
    try:
        r = repr(value)
        if r.startswith("<"):
            return "None"
        return r
    except Exception:
        return "None"


def _render_exception_pytest(func_name: str, inputs: dict[str, Any], test_name: str, module_import: str, exception_type: str) -> str:
    args_str = ", ".join(f"{k}={_safe_repr(v)}" for k, v in inputs.items())
    lines = ["import pytest"]
    if module_import:
        lines.append(module_import)
    lines += [
        "",
        f"def {test_name}():",
        f"    with pytest.raises({exception_type}):",
        f"        {func_name}({args_str})",
        "",
    ]
    return "\n".join(lines)


def _render_pytest(
    func_name: str,
    inputs: dict[str, Any],
    test_name: str,
    module_import: str,
    return_type: Any,
    expected_value: Any,
    classification: str
) -> str:
    args_str = ", ".join(f"{k}={_safe_repr(v)}" for k, v in inputs.items())
    assertion_lines = []
    normalized = _normalize_return_type(return_type)
    
    if expected_value is True:
        assertion_lines.append("    assert result is True")
    elif expected_value is False:
        assertion_lines.append("    assert result is False")
    elif normalized == "list":
        assertion_lines.append("    assert isinstance(result, list)")
        assertion_lines.append("    assert len(result) >= 0")
    elif normalized == "object":
        assertion_lines.append("    assert isinstance(result, dict)")
    elif normalized == "boolean":
        assertion_lines.append("    assert isinstance(result, bool)")
    elif normalized == "string":
        assertion_lines.append("    assert isinstance(result, str)")
        assertion_lines.append("    assert len(result) >= 0")
    elif normalized == "number":
        assertion_lines.append("    assert isinstance(result, (int, float))")
        if classification == "Calculation":
            assertion_lines.append("    assert result >= 0")
    else:
        assertion_lines.append("    assert result is not None")
        
    lines = ["import pytest"]
    if module_import:
        lines.append(module_import)
    lines += [
        "",
        f"def {test_name}():",
        f"    result = {func_name}({args_str})",
    ]
    for line in assertion_lines:
        lines.append(line)
    lines.append("")
    return "\n".join(lines)


def generate_pytest_tests(
    edge_cases: EdgeCaseSchema,
    module_import: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    source_file = edge_cases.get("source_file", "unknown")
    relative_source = edge_cases.get("relative_source")
    
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        
        # Dynamically generate import line if not provided
        current_import = module_import
        if not current_import and relative_source and relative_source.endswith(".py"):
            stem = Path(relative_source).stem
            parts = list(Path(relative_source).parent.parts)
            # Remove leading standard prefixes
            if parts and parts[0] in ("src", "app"):
                parts = parts[1:]
            if parts:
                module_path = ".".join(parts) + f".{stem}"
            else:
                module_path = stem
            module_path = module_path.lstrip(".")
            if module_path:
                current_import = f"from {module_path} import {func}"
            
        plans = generate_behavior_test_plans(fn_entry, "python")
        for plan in plans:
            test_name = plan["test_name"]
            inputs = plan["inputs"]
            expected_behavior = plan["expected_behavior"]
            expected_val = plan["expected_value"]
            
            if expected_behavior == "raises":
                code = _render_exception_pytest(func, inputs, test_name, current_import, expected_val)
            else:
                code = _render_pytest(func, inputs, test_name, current_import, fn_entry.get("return_type"), expected_val, plan["classification"])
                
            tests.append(
                GeneratedTest(
                    function=func,
                    test_name=test_name,
                    condition=plan["condition_source"],
                    case=inputs,
                    language="python",
                    framework="pytest",
                    code=code,
                    source_file=source_file,
                    relative_source=relative_source,
                )
            )
            log.info("Generated pytest test %s for %s (score=%d)", test_name, func, plan["quality_score"])
            
    return tests
