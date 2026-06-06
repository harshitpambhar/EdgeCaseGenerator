"""
JUnit 5 (Java) test generator.
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


def _java_repr(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value) + "L" if abs(value) > 2**31 else str(value)
    if isinstance(value, float):
        if value == float("inf"):
            return "Double.POSITIVE_INFINITY"
        if value == float("-inf"):
            return "Double.NEGATIVE_INFINITY"
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    if isinstance(value, list):
        if not value:
            return "new Object[]{}"
        return "new Object[]{" + ", ".join(_java_repr(v) for v in value) + "}"
    return "null"


def _render_junit(func_name: str, case: Any, test_name: str, class_name: str) -> str:
    arg = _java_repr(case)
    lines = [
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        f"class {class_name}Test {{",
        "",
        "    @Test",
        f"    void {test_name}() {{",
        f"        var result = {class_name}.{func_name}({arg});",
        "        assertNotNull(result);",
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def generate_junit_tests(
    edge_cases: EdgeCaseSchema,
    class_name: str = "Subject",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    source_file = edge_cases.get("source_file", "unknown")
    
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        for condition, values in fn_entry["edge_cases"].items():
            for idx, value in enumerate(values):
                test_name = f"test_{func}_{idx}"
                code = _render_junit(func, value, test_name, class_name)
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="java",
                        framework="junit",
                        code=code,
                        source_file=source_file,
                    )
                )
    return tests
