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


def _assertion_lines(return_type: Any) -> tuple[list[str], str]:
    normalized = _normalize_return_type(return_type)
    if normalized == "list":
        return (["        assertTrue(result instanceof java.util.List);"], "semantic:list")
    if normalized == "object":
        return (["        assertTrue(result instanceof java.util.Map);"], "semantic:object")
    if normalized == "boolean":
        return (["        assertTrue(result || !result);"], "semantic:boolean")
    if normalized == "string":
        return (["        assertTrue(result instanceof String);"], "semantic:string")
    if normalized == "number":
        return (["        assertTrue(result == result);"], "semantic:number")
    return (["        assertNotNull(result);"], "fallback:not_null")


def _exception_class_name(exception_type: str) -> str:
    simple = exception_type.split(".")[-1]
    mapping = {
        "ValueError": "IllegalArgumentException",
        "TypeError": "IllegalStateException",
        "IndexError": "IndexOutOfBoundsException",
        "RuntimeError": "RuntimeException",
        "AssertionError": "AssertionError",
    }
    if simple in mapping:
        return mapping[simple]
    if simple.endswith("Exception") or simple.endswith("Error"):
        return simple
    return "RuntimeException"


def _render_exception_junit(func_name: str, case: Any, test_name: str, class_name: str, exception_type: str) -> str:
    arg = _java_repr(case)
    exception_class = _exception_class_name(exception_type)
    lines = [
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        f"class {class_name}Test {{",
        "",
        "    @Test",
        f"    void {test_name}() {{",
        f"        assertThrows({exception_class}.class, () -> {class_name}.{func_name}({arg}));",
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def _render_junit(func_name: str, case: Any, test_name: str, class_name: str, return_type: Any) -> tuple[str, str]:
    arg = _java_repr(case)
    assertion_lines, assertion_kind = _assertion_lines(return_type)
    lines = [
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        f"class {class_name}Test {{",
        "",
        "    @Test",
        f"    void {test_name}() {{",
        f"        var result = {class_name}.{func_name}({arg});",
    ]
    lines.extend(assertion_lines)
    lines += [
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines), assertion_kind


def generate_junit_tests(
    edge_cases: EdgeCaseSchema,
    class_name: str = "Subject",
) -> list[GeneratedTest]:
    tests: list[GeneratedTest] = []
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        return_type = fn_entry.get("return_type")
        exception_types = fn_entry.get("exceptions_detail", []) or []
        for condition, values in fn_entry["edge_cases"].items():
            is_exception_case = isinstance(condition, str) and condition.startswith("exception:")
            exception_type = condition.split(":", 1)[1] if is_exception_case and ":" in condition else (exception_types[0] if exception_types else "RuntimeException")
            for idx, value in enumerate(values):
                test_name = f"test_{func}_{idx}"
                if is_exception_case:
                    code = _render_exception_junit(func, value, test_name, class_name, exception_type)
                    assertion_kind = f"exception:{exception_type}"
                    purpose = f"raise:{exception_type}"
                else:
                    code, assertion_kind = _render_junit(func, value, test_name, class_name, return_type)
                    purpose = f"semantic:{condition}"
                tests.append(
                    GeneratedTest(
                        function=func,
                        test_name=test_name,
                        condition=condition,
                        case=value if not callable(value) else None,
                        language="java",
                        framework="junit",
                        code=code,
                        assertion_kind=assertion_kind,
                        exception_type=exception_type if is_exception_case else None,
                        quality_score=90 if is_exception_case else (80 if assertion_kind.startswith("semantic") else 50),
                        purpose=purpose,
                    )
                )
                log.info("Generated junit test %s for %s (%s)", test_name, func, assertion_kind)
    return tests
