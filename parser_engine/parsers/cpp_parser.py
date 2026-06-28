"""
C / C++ parser using tree-sitter-cpp.
Falls back to regex when tree-sitter is not installed.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.schemas.models import FunctionSchema, ParsedFileSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)

try:
    import tree_sitter_cpp as tscpp
    from tree_sitter import Language, Parser as TSParser
    CPP_LANGUAGE = Language(tscpp.language())
    _TS_AVAILABLE = True
except Exception:
    _TS_AVAILABLE = False
    log.warning("tree-sitter-cpp not available — using regex fallback for C/C++")


# ── helpers ───────────────────────────────────────────────────────────────────

def _count_nesting(src: str) -> int:
    max_d = d = 0
    for ch in src:
        if ch == "{":
            d += 1
            max_d = max(max_d, d)
        elif ch == "}":
            d = max(d - 1, 0)
    return max_d


def _conditions(src: str) -> list[str]:
    return re.findall(r"if\s*\(([^)]+)\)", src)


def _loops(src: str) -> int:
    return len(re.findall(r"\b(for|while|do)\b", src))


def _returns(src: str) -> int:
    return len(re.findall(r"\breturn\b", src))


def _throws(src: str) -> int:
    return len(re.findall(r"\bthrow\b", src))


# ── tree-sitter ───────────────────────────────────────────────────────────────

def _walk(node, src_bytes: bytes, results: list[FunctionSchema]) -> None:
    if node.type == "function_definition":
        name = ""
        params: list[str] = []
        for child in node.children:
            if child.type == "function_declarator":
                for sub in child.children:
                    if sub.type == "identifier":
                        name = src_bytes[sub.start_byte:sub.end_byte].decode()
                    elif sub.type == "parameter_list":
                        for p in sub.children:
                            if p.type == "parameter_declaration":
                                params.append(
                                    src_bytes[p.start_byte:p.end_byte].decode().strip()
                                )
        if name:
            body = src_bytes[node.start_byte:node.end_byte].decode(errors="replace")
            conds = _conditions(body)
            results.append(
                FunctionSchema(
                    name=name,
                    parameters=params,
                    conditions=conds,
                    loops=_loops(body),
                    returns=_returns(body),
                    exceptions=_throws(body),
                    operators=[],
                    nesting_depth=_count_nesting(body),
                    complexity_score=1 + len(conds) + _loops(body),
                    apis=[],
                    imports=[],
                )
            )
    for child in node.children:
        _walk(child, src_bytes, results)


def _parse_tree_sitter(source_code: str) -> list[FunctionSchema]:
    parser = TSParser(CPP_LANGUAGE)
    src_bytes = source_code.encode()
    tree = parser.parse(src_bytes)
    results: list[FunctionSchema] = []
    _walk(tree.root_node, src_bytes, results)
    return results


# ── regex fallback ────────────────────────────────────────────────────────────

_FUNC_RE = re.compile(
    r"[\w:*&<>]+\s+(\w+)\s*\(([^)]*)\)\s*(?:const\s*)?\{",
    re.MULTILINE,
)


def _parse_regex(source_code: str) -> list[FunctionSchema]:
    functions: list[FunctionSchema] = []
    for m in _FUNC_RE.finditer(source_code):
        name = m.group(1)
        raw_params = m.group(2) or ""
        params = [p.strip() for p in raw_params.split(",") if p.strip()]
        body = source_code[m.start() : m.start() + 2000]
        conds = _conditions(body)
        functions.append(
            FunctionSchema(
                name=name,
                parameters=params,
                conditions=conds,
                loops=_loops(body),
                returns=_returns(body),
                exceptions=_throws(body),
                operators=[],
                nesting_depth=_count_nesting(body),
                complexity_score=1 + len(conds) + _loops(body),
                apis=[],
                imports=[],
            )
        )
    return functions


# ── public API ────────────────────────────────────────────────────────────────

def parse_cpp_file(file_path: str) -> ParsedFileSchema:
    source = Path(file_path).read_text(encoding="utf-8", errors="replace")
    functions = _parse_tree_sitter(source) if _TS_AVAILABLE else _parse_regex(source)
    return ParsedFileSchema(
        source_file=file_path,
        language="cpp",
        function_count=len(functions),
        functions=functions,
    )
