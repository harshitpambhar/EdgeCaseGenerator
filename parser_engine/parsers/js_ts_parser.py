"""
JavaScript / TypeScript parser using tree-sitter.

Falls back to a lightweight regex-based extractor when tree-sitter is not
installed so the service degrades gracefully in minimal environments.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

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
        functions.append(
            FunctionSchema(
                name=name,
                parameters=params,
                conditions=conditions,
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
    loops = _extract_loops_regex(body_text)
    returns = _extract_returns_regex(body_text)
    throws = _extract_throws_regex(body_text)

    return FunctionSchema(
        name=name,
        parameters=params,
        conditions=conditions,
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
