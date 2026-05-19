"""
Java parser using javalang (pure-Python).
Falls back to regex when javalang is not installed.
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
    import javalang
    _JAVALANG_AVAILABLE = True
except ImportError:
    _JAVALANG_AVAILABLE = False
    log.warning("javalang not installed — using regex fallback for Java")


# ── helpers ───────────────────────────────────────────────────────────────────

def _count_nesting(source: str) -> int:
    max_d = d = 0
    for ch in source:
        if ch == "{":
            d += 1
            max_d = max(max_d, d)
        elif ch == "}":
            d = max(d - 1, 0)
    return max_d


def _conditions_regex(src: str) -> list[str]:
    return re.findall(r"if\s*\(([^)]+)\)", src)


def _loops_regex(src: str) -> int:
    return len(re.findall(r"\b(for|while|do)\b", src))


def _returns_regex(src: str) -> int:
    return len(re.findall(r"\breturn\b", src))


def _throws_regex(src: str) -> int:
    return len(re.findall(r"\bthrow\b", src))


# ── javalang parser ───────────────────────────────────────────────────────────

def _parse_javalang(source_code: str) -> list[FunctionSchema]:
    try:
        tree = javalang.parse.parse(source_code)
    except Exception as exc:
        log.warning("javalang parse error: %s", exc)
        return []

    functions: list[FunctionSchema] = []
    for _, node in tree.filter(javalang.tree.MethodDeclaration):
        params = [p.name for p in (node.parameters or [])]
        body_src = source_code  # javalang doesn't give byte offsets easily
        conditions = _conditions_regex(body_src)
        functions.append(
            FunctionSchema(
                name=node.name,
                parameters=params,
                conditions=conditions,
                loops=_loops_regex(body_src),
                returns=_returns_regex(body_src),
                exceptions=len(node.throws or []),
                operators=[],
                nesting_depth=_count_nesting(body_src),
                complexity_score=1 + len(conditions) + _loops_regex(body_src),
                apis=[],
                imports=[],
            )
        )
    return functions


# ── regex fallback ────────────────────────────────────────────────────────────

_METHOD_RE = re.compile(
    r"(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{",
    re.MULTILINE,
)


def _parse_regex(source_code: str) -> list[FunctionSchema]:
    functions: list[FunctionSchema] = []
    for m in _METHOD_RE.finditer(source_code):
        name = m.group(1)
        raw_params = m.group(2) or ""
        params = [p.strip().split()[-1] for p in raw_params.split(",") if p.strip()]
        body = source_code[m.start() : m.start() + 2000]
        conditions = _conditions_regex(body)
        functions.append(
            FunctionSchema(
                name=name,
                parameters=params,
                conditions=conditions,
                loops=_loops_regex(body),
                returns=_returns_regex(body),
                exceptions=_throws_regex(body),
                operators=[],
                nesting_depth=_count_nesting(body),
                complexity_score=1 + len(conditions) + _loops_regex(body),
                apis=[],
                imports=[],
            )
        )
    return functions


# ── public API ────────────────────────────────────────────────────────────────

def parse_java_file(file_path: str) -> ParsedFileSchema:
    source = Path(file_path).read_text(encoding="utf-8", errors="replace")
    functions = _parse_javalang(source) if _JAVALANG_AVAILABLE else _parse_regex(source)
    return ParsedFileSchema(
        source_file=file_path,
        language="java",
        function_count=len(functions),
        functions=functions,
    )
