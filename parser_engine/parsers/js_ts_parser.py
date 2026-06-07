"""
JavaScript / TypeScript parser using tree-sitter.

Falls back to a lightweight regex-based extractor when tree-sitter is not
installed so the service degrades gracefully in minimal environments.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parents[2]  # repo root (parsers/ → parser-engine/ → root)
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.schemas.models import FunctionSchema, ParsedFileSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)

# ── tree-sitter (optional) ────────────────────────────────────────────────────
try:
    import tree_sitter_javascript as tsjs
    import tree_sitter_typescript as tsts
    from tree_sitter import Language, Parser as TSParser

    JS_LANGUAGE  = Language(tsjs.language())
    TS_LANGUAGE  = Language(tsts.language_typescript())
    _TS_AVAILABLE = True
except Exception:
    _TS_AVAILABLE = False
    log.warning("tree-sitter not available — using regex fallback for JS/TS")


# ── helpers ───────────────────────────────────────────────────────────────────

def _count_nesting(source: str) -> int:
    max_depth = depth = 0
    for ch in source:
        if ch == "{":
            depth += 1
            max_depth = max(max_depth, depth)
        elif ch == "}":
            depth = max(depth - 1, 0)
    return max_depth


def _extract_conditions_regex(source: str) -> list[str]:
    return re.findall(r"if\s*\(([^)]+)\)", source)


def _extract_loops_regex(source: str) -> int:
    return len(re.findall(r"\b(for|while|do)\b", source))


def _extract_returns_regex(source: str) -> int:
    return len(re.findall(r"\breturn\b", source))


def _extract_throws_regex(source: str) -> int:
    return len(re.findall(r"\bthrow\b", source))


def _extract_thrown_types(source: str) -> list[str]:
    """Extract class names from 'throw new X(...)' expressions."""
    types: list[str] = []
    for m in re.finditer(r"throw\s+new\s+([A-Za-z_][A-Za-z0-9_]*)", source):
        name = m.group(1)
        if name not in types:
            types.append(name)
    return types or (["Error"] if _extract_throws_regex(source) else [])

def _extract_literal_metadata(source: str) -> tuple[list[str], dict[str, list[Any]], list[Any], list[str], dict[str, Any], list[dict[str, Any]], str | None]:
    allowed_values: dict[str, list[Any]] = {}
    literals: list[Any] = []
    conditions: list[str] = []
    operators: list[str] = []
    default_values: dict[str, Any] = {}
    parameter_details: list[dict[str, Any]] = []
    return_type: str | None = None

    compare_patterns = [
        re.compile(r"([A-Za-z_][A-Za-z0-9_]*)\s*(===|==|!==|!=|>=|<=|>|<)\s*(['\"])(.*?)\3"),
        re.compile(r"([A-Za-z_][A-Za-z0-9_]*)\s*(===|==|!==|!=|>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)"),
        re.compile(r"([A-Za-z_][A-Za-z0-9_]*)\s*(===|==|!==|!=)\s*(true|false|null)", re.IGNORECASE),
    ]
    for pattern in compare_patterns:
        for match in pattern.finditer(source):
            name = match.group(1)
            op = match.group(2)
            raw_value = match.group(match.lastindex)
            if raw_value is None:
                continue
            value: Any
            if isinstance(raw_value, str) and raw_value.lower() in {"true", "false"}:
                value = raw_value.lower() == "true"
            elif isinstance(raw_value, str) and raw_value.lower() == "null" or raw_value == "None":
                value = None
            else:
                try:
                    value = int(raw_value)
                except Exception:
                    try:
                        value = float(raw_value)
                    except Exception:
                        value = raw_value
            allowed_values.setdefault(name, []).append(value)
            literals.append(value)
            conditions.append(match.group(0))
            operators.append(op)

    parameter_matches = re.finditer(
        r"([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_<>,\[\]\| ]+)(?:\s*=\s*([^,\)]+))?",
        source,
    )
    for match in parameter_matches:
        default_raw = match.group(3)
        default_value = default_raw.strip() if default_raw else None
        parameter_details.append(
            {
                "name": match.group(1),
                "type": match.group(2).strip(),
                "default_value": default_value,
            }
        )
        if default_value is not None:
            default_values[match.group(1)] = default_value

    # Return-type: handle TS annotation ): Type {, arrow => Type {, and plain ) {
    return_type_match = re.search(
        r"\)\s*:\s*([A-Za-z_][A-Za-z0-9_<>,\[\]\| .]+?)\s*(?:\{|=>|$)",
        source,
        re.MULTILINE,
    )
    if return_type_match:
        return_type = return_type_match.group(1).strip()

    conditions = list(dict.fromkeys(conditions))
    operators = list(dict.fromkeys(operators))
    literals = list(dict.fromkeys(literals))
    allowed_values = {key: list(dict.fromkeys(values)) for key, values in allowed_values.items()}
    return conditions, allowed_values, literals, operators, default_values, parameter_details, return_type


# ── regex-based fallback ──────────────────────────────────────────────────────

_FUNC_RE = re.compile(
    r"(?:function\s+(\w+)\s*\(([^)]*)\)|"
    r"(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>|"
    r"(\w+)\s*\(([^)]*)\)\s*\{)",
    re.MULTILINE,
)


def _parse_regex(source_code: str, language: str) -> list[FunctionSchema]:
    functions: list[FunctionSchema] = []
    for m in _FUNC_RE.finditer(source_code):
        name = m.group(1) or m.group(3) or m.group(5)
        raw_params = m.group(2) or m.group(4) or m.group(6) or ""
        if not name:
            continue
        params = [p.strip() for p in raw_params.split(",") if p.strip()]
        # Grab a rough body slice for metrics
        start = m.start()
        body = source_code[start : start + 2000]
        conditions = _extract_conditions_regex(body)
        semantic_conditions, allowed_values, literals, operators, default_values, parameter_details, return_type = _extract_literal_metadata(body)
        merged_conditions = list(dict.fromkeys(conditions + semantic_conditions))
        param_details = parameter_details or [{"name": p, "type": None, "default_value": None} for p in params]
        functions.append(
            FunctionSchema(
                name=name,
                parameters=params,
            parameter_details=param_details,
            return_type=return_type,
            conditions=merged_conditions,
            branch_conditions=merged_conditions,
            comparison_operators=operators,
            literal_values=literals,
            allowed_values=allowed_values,
            default_values=default_values,
            exceptions_detail=_extract_thrown_types(body),
                loops=_extract_loops_regex(body),
                returns=_extract_returns_regex(body),
                exceptions=_extract_throws_regex(body),
                operators=[],
                nesting_depth=_count_nesting(body),
                complexity_score=1 + len(conditions) + _extract_loops_regex(body),
                apis=[],
                imports=[],
            )
        )
    return functions


# ── tree-sitter parser ────────────────────────────────────────────────────────

def _parse_ts_node(node, source_bytes: bytes) -> FunctionSchema | None:
    """Extract a FunctionSchema from a function_declaration / method_definition node."""
    name = ""
    params: list[str] = []

    for child in node.children:
        if child.type == "identifier":
            name = source_bytes[child.start_byte:child.end_byte].decode()
        elif child.type in ("formal_parameters", "parameter_list"):
            for p in child.children:
                if p.type in ("identifier", "required_parameter", "optional_parameter"):
                    params.append(source_bytes[p.start_byte:p.end_byte].decode())

    if not name:
        return None

    body_text = source_bytes[node.start_byte:node.end_byte].decode(errors="replace")
    conditions = _extract_conditions_regex(body_text)
    semantic_conditions, allowed_values, literals, operators, default_values, parameter_details, return_type = _extract_literal_metadata(body_text)
    loops = _extract_loops_regex(body_text)
    returns = _extract_returns_regex(body_text)
    throws = _extract_throws_regex(body_text)

    return FunctionSchema(
        name=name,
        parameters=params,
        parameter_details=parameter_details or [{"name": p, "type": None, "default_value": None} for p in params],
        return_type=return_type,
        conditions=list(dict.fromkeys(conditions + semantic_conditions)),
        branch_conditions=list(dict.fromkeys(conditions + semantic_conditions)),
        comparison_operators=operators,
        literal_values=literals,
        allowed_values=allowed_values,
        default_values=default_values,
        exceptions_detail=_extract_thrown_types(body_text),
        loops=loops,
        returns=returns,
        exceptions=throws,
        operators=[],
        nesting_depth=_count_nesting(body_text),
        complexity_score=1 + len(conditions) + loops,
        apis=[],
        imports=[],
    )


def _walk_ts(node, source_bytes: bytes, results: list[FunctionSchema]) -> None:
    if node.type in (
        "function_declaration",
        "function_expression",
        "arrow_function",
        "method_definition",
    ):
        fn = _parse_ts_node(node, source_bytes)
        if fn:
            results.append(fn)
    for child in node.children:
        _walk_ts(child, source_bytes, results)


def _parse_tree_sitter(source_code: str, language: str) -> list[FunctionSchema]:
    lang = TS_LANGUAGE if language == "typescript" else JS_LANGUAGE
    parser = TSParser(lang)
    source_bytes = source_code.encode()
    tree = parser.parse(source_bytes)
    results: list[FunctionSchema] = []
    _walk_ts(tree.root_node, source_bytes, results)
    return results


# ── public API ────────────────────────────────────────────────────────────────

def parse_js_ts_file(file_path: str, language: str = "javascript") -> ParsedFileSchema:
    source = Path(file_path).read_text(encoding="utf-8", errors="replace")
    if _TS_AVAILABLE:
        functions = _parse_tree_sitter(source, language)
    else:
        functions = _parse_regex(source, language)

    return ParsedFileSchema(
        source_file=file_path,
        language=language,
        function_count=len(functions),
        functions=functions,
    )
