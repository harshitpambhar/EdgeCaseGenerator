"""
pytest test generator.

Wraps the existing ml-service/test_generation/generator.py logic and
extends it to produce the canonical GeneratedTest schema.
The original generator is NOT modified.
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


def _safe_repr(value: Any) -> str:
    try:
        r = repr(value)
        # Avoid repr of objects that can't round-trip
        if r.startswith("<"):
            return "None"
        return r
    except Exception:
        return "None"


def _normalize_return_type(return_type: Any) -> str:
    if not return_type:
        return "unknown"
    text = str(return_type).strip().lower()
    if any(token in text for token in ("list", "tuple", "set")):
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


def _assertion_lines(return_type: Any) -> tuple[list[str], str]:
    normalized = _normalize_return_type(return_type)
    if normalized == "list":
        return (["    assert isinstance(result, list)"], "semantic:list")
    if normalized == "object":
        return (["    assert isinstance(result, dict)"], "semantic:object")
    if normalized == "boolean":
        return (["    assert isinstance(result, bool)"], "semantic:boolean")
    if normalized == "string":
        return (["    assert isinstance(result, str)"], "semantic:string")
    if normalized == "number":
        return (["    assert isinstance(result, (int, float))"], "semantic:number")
    return (["    assert result is not None"], "fallback:not_none")


def _render_exception_pytest(func_name: str, case: Any, test_name: str, module_import: str, exception_type: str) -> str:
    args = (
        ", ".join(_safe_repr(v) for v in case)
        if isinstance(case, (list, tuple))
        else (
            ", ".join(f"{k}={_safe_repr(v)}" for k, v in case.items())
            if isinstance(case, dict)
            else _safe_repr(case)
        )
    )
    lines = ["import pytest"]
    if module_import:
        lines.append(module_import)
    lines += [
        "",
        f"def {test_name}():",
        f"    with pytest.raises({exception_type}):",
        f"        {func_name}({args})",
        "",
    ]
    return "\n".join(lines)


def _render_pytest(func_name: str, case: Any, test_name: str, module_import: str, return_type: Any) -> str:
    args = (
        ", ".join(_safe_repr(v) for v in case)
        if isinstance(case, (list, tuple))
        else (
            ", ".join(f"{k}={_safe_repr(v)}" for k, v in case.items())
            if isinstance(case, dict)
            else _safe_repr(case)
        )
    )
    assertion_lines, assertion_kind = _assertion_lines(return_type)
    lines = [
        "import pytest",
    ]
    if module_import:
        lines.append(module_import)
    lines += [
        "",
        f"def {test_name}():",
        f"    result = {func_name}({args})",
    ]
    lines.extend(assertion_lines)
    lines.append("")
    return "\n".join(lines)


def generate_pytest_tests(
    edge_cases: EdgeCaseSchema,
    module_import: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        return_type = fn_entry.get("return_type")
        exception_types = fn_entry.get("exceptions_detail", []) or []
        parameter_details = fn_entry.get("parameter_details", []) or []
        for condition, values in fn_entry["edge_cases"].items():
            is_exception_case = isinstance(condition, str) and condition.startswith("exception:")
            exception_type = condition.split(":", 1)[1] if is_exception_case and ":" in condition else (exception_types[0] if exception_types else "Exception")
            for idx, value in enumerate(values):
                test_name = f"test_{func}_{idx}"
                if is_exception_case:
                    code = _render_exception_pytest(func, value, test_name, module_import, exception_type)
                    assertion_kind = f"exception:{exception_type}"
                    purpose = f"raise:{exception_type}"
                else:
                    code = _render_pytest(func, value, test_name, module_import, return_type)
                    assertion_kind = _assertion_lines(return_type)[1]
                    purpose = f"semantic:{condition}"
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="python",
                        framework="pytest",
                        code=code,
                        assertion_kind=assertion_kind,
                        exception_type=exception_type if is_exception_case else None,
                        quality_score=90 if is_exception_case else (80 if assertion_kind.startswith("semantic") else 50),
                        purpose=purpose,
                    )
                )
                log.info("Generated pytest test %s for %s (%s)", test_name, func, assertion_kind)
    return tests
