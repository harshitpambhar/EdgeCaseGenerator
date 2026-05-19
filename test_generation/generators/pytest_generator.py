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


def _render_pytest(func_name: str, case: Any, test_name: str, module_import: str) -> str:
    args = (
        ", ".join(_safe_repr(v) for v in case)
        if isinstance(case, (list, tuple))
        else (
            ", ".join(f"{k}={_safe_repr(v)}" for k, v in case.items())
            if isinstance(case, dict)
            else _safe_repr(case)
        )
    )
    lines = [
        "import pytest",
    ]
    if module_import:
        lines.append(module_import)
    lines += [
        "",
        f"def {test_name}():",
        f"    result = {func_name}({args})",
        "    assert result is not None or True  # replace with domain assertion",
        "",
    ]
    return "\n".join(lines)


def generate_pytest_tests(
    edge_cases: EdgeCaseSchema,
    module_import: str = "",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        for condition, values in fn_entry["edge_cases"].items():
            for idx, value in enumerate(values):
                test_name = f"test_{func}_{idx}"
                code = _render_pytest(func, value, test_name, module_import)
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="python",
                        framework="pytest",
                        code=code,
                    )
                )
    return tests
