"""
JUnit 5 (Java) test generator.
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


def _assertion_lines(return_type: Any, expected_value: Any, classification: str) -> list[str]:
    normalized = _normalize_return_type(return_type)
    
    if expected_value is True:
        return ["        assertTrue(result);"]
    if expected_value is False:
        return ["        assertFalse(result);"]
        
    if normalized == "list":
        return ["        assertTrue(result instanceof java.util.List);"]
    if normalized == "object":
        return ["        assertTrue(result instanceof java.util.Map);"]
    if normalized == "boolean":
        return ["        assertTrue(result || !result);"]
    if normalized == "string":
        return ["        assertTrue(result instanceof String);"]
    if normalized == "number":
        lines = ["        assertTrue(result instanceof Number);"]
        if classification == "Calculation":
            lines.append("        assertTrue(((Number) result).doubleValue() >= 0);")
        return lines
        
    return ["        assertNotNull(result);"]


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


def _get_java_package(relative_source: str | None) -> str:
    if not relative_source:
        return ""
    path_str = relative_source.replace("\\", "/")
    for prefix in ["src/main/java/", "src/test/java/"]:
        if prefix in path_str:
            parts = path_str.split(prefix)[1].split("/")[:-1]
            if parts:
                return f"package {'.'.join(parts)};\n\n"
            return ""
            
    parts = path_str.split("/")[:-1]
    if parts:
        return f"package {'.'.join(parts)};\n\n"
    return ""


def _render_exception_junit(
    func_name: str,
    args_str: str,
    test_name: str,
    class_name: str,
    exception_type: str,
    package_stmt: str
) -> str:
    exception_class = _exception_class_name(exception_type)
    lines = [
        package_stmt,
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        f"class {class_name}Test {{",
        "",
        "    @Test",
        f"    void {test_name}() {{",
        f"        assertThrows({exception_class}.class, () -> {class_name}.{func_name}({args_str}));",
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def _render_junit(
    func_name: str,
    args_str: str,
    test_name: str,
    class_name: str,
    return_type: Any,
    expected_value: Any,
    classification: str,
    package_stmt: str
) -> str:
    assertion_lines = _assertion_lines(return_type, expected_value, classification)
    lines = [
        package_stmt,
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        f"class {class_name}Test {{",
        "",
        "    @Test",
        f"    void {test_name}() {{",
        f"        var result = {class_name}.{func_name}({args_str});",
    ]
    lines.extend(assertion_lines)
    lines += [
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
    relative_source = edge_cases.get("relative_source")
    
    # Extract package statement and class name dynamically
    package_stmt = _get_java_package(relative_source)
    if relative_source and relative_source.endswith(".java"):
        class_name = Path(relative_source).stem
        
    for fn_entry in edge_cases["functions"]:
        func = fn_entry["name"]
        
        plans = generate_behavior_test_plans(fn_entry, "java")
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
                    
            args_str = ", ".join(_java_repr(v) for v in args_list)
            
            if expected_behavior == "raises":
                code = _render_exception_junit(func, args_str, test_name, class_name, expected_val, package_stmt)
            else:
                code = _render_junit(
                    func, args_str, test_name, class_name,
                    fn_entry.get("return_type"), expected_val, plan["classification"], package_stmt
                )
                
            tests.append(
                GeneratedTest(
                    function=func,
                    test_name=test_name,
                    condition=plan["condition_source"],
                    case=inputs,
                    language="java",
                    framework="junit",
                    code=code,
                    source_file=source_file,
                    relative_source=relative_source,
                )
            )
            log.info("Generated junit test %s for %s (score=%d)", test_name, func, plan["quality_score"])
            
    return tests
