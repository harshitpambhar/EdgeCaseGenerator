"""
Java parser using javalang (pure-Python).
Falls back to regex when javalang is not installed.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

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


def _extract_thrown_types(src: str) -> list[str]:
    """Extract exception class names from throw new X(...) and throws clauses."""
    types: list[str] = []
    for m in re.finditer(r"throw\s+new\s+([A-Za-z_][A-Za-z0-9_]*)", src):
        name = m.group(1)
        if name not in types:
            types.append(name)
    for m in re.finditer(r"throws\s+([A-Za-z_][A-Za-z0-9_,\s]+)(?:\s*\{)", src):
        for part in m.group(1).split(","):
            name = part.strip()
            if name and name not in types:
                types.append(name)
    return types or (["Throwable"] if _throws_regex(src) else [])


def _extract_literal_metadata(source: str) -> tuple[list[str], dict[str, list[Any]], list[Any], list[str], list[dict[str, Any]], str | None]:
    conditions: list[str] = []
    allowed_values: dict[str, list[Any]] = {}
    literals: list[Any] = []
    operators: list[str] = []
    parameter_details: list[dict[str, Any]] = []
    return_type: str | None = None

    method_match = re.search(
        r"(?:public|private|protected|static|final|synchronized|native|abstract|\s)+([\w<>,\[\] ?]+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)",
        source,
    )
    if method_match:
        return_type = method_match.group(1).strip()
        raw_params = method_match.group(3)
        for param in raw_params.split(","):
            param = param.strip()
            if not param:
                continue
            pieces = param.split()
            if len(pieces) >= 2:
                parameter_details.append({"name": pieces[-1], "type": " ".join(pieces[:-1]), "default_value": None})

    for match in re.finditer(r"([A-Za-z_][A-Za-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(\"[^\"]*\"|'[^']*'|-?\d+(?:\.\d+)?|true|false|null)", source, re.IGNORECASE):
        name, op, raw_value = match.groups()
        value: Any
        if raw_value.lower() in {"true", "false"}:
            value = raw_value.lower() == "true"
        elif raw_value.lower() == "null":
            value = None
        elif raw_value.startswith(("\"", "'")):
            value = raw_value[1:-1]
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

    conditions = list(dict.fromkeys(conditions))
    operators = list(dict.fromkeys(operators))
    literals = list(dict.fromkeys(literals))
    allowed_values = {key: list(dict.fromkeys(values)) for key, values in allowed_values.items()}
    return conditions, allowed_values, literals, operators, parameter_details, return_type


# ── javalang parser ───────────────────────────────────────────────────────────

def _method_body_src(source_code: str, node) -> str:
    """Best-effort extraction of a method body using line positions from javalang."""
    try:
        start_line = node.position.line - 1  # javalang lines are 1-based
        lines = source_code.splitlines()
        # collect from the method declaration line; grab up to 200 lines
        body_lines = lines[start_line : start_line + 200]
        return "\n".join(body_lines)
    except Exception:
        return source_code


def _parse_javalang(source_code: str) -> list[FunctionSchema]:
    try:
        tree = javalang.parse.parse(source_code)
    except Exception as exc:
        log.warning("javalang parse error: %s", exc)
        return []

    functions: list[FunctionSchema] = []
    for _, node in tree.filter(javalang.tree.MethodDeclaration):
        params = [p.name for p in (node.parameters or [])]
        parameter_details = [
            {"name": p.name, "type": str(getattr(p.type, "name", p.type)), "default_value": None}
            for p in (node.parameters or [])
        ]
        body_src = _method_body_src(source_code, node)
        conditions = _conditions_regex(body_src)
        semantic_conditions, allowed_values, literals, operators, semantic_params, _rt = _extract_literal_metadata(body_src)
        # javalang gives us the declared return type reliably
        return_type = str(getattr(node.return_type, "name", node.return_type)) if node.return_type else None
        # javalang throws list contains ReferenceType objects — extract .name
        declared_throws = []
        for exc in (node.throws or []):
            name = getattr(exc, "name", None) or str(exc)
            if name and name not in declared_throws:
                declared_throws.append(name)
        # also catch throw-new inside body
        body_thrown = _extract_thrown_types(body_src)
        exceptions_detail = list(dict.fromkeys(declared_throws + [t for t in body_thrown if t not in declared_throws]))
        if not exceptions_detail and _throws_regex(body_src):
            exceptions_detail = ["RuntimeException"]
        log.debug(
            "javalang parsed method %s: params=%s return=%s throws=%s conditions=%d literals=%d",
            node.name, params, return_type, exceptions_detail, len(conditions), len(literals),
        )
        functions.append(
            FunctionSchema(
                name=node.name,
                parameters=params,
                parameter_details=parameter_details or semantic_params,
                return_type=return_type,
                conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                branch_conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                comparison_operators=operators,
                literal_values=literals,
                allowed_values=allowed_values,
                default_values={},
                exceptions_detail=exceptions_detail,
                loops=_loops_regex(body_src),
                returns=_returns_regex(body_src),
                exceptions=len(exceptions_detail),
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
        semantic_conditions, allowed_values, literals, operators, parameter_details, return_type = _extract_literal_metadata(body)
        thrown_types = _extract_thrown_types(body)
        # also capture throws clause on this method signature line
        sig_throws_match = re.search(r"throws\s+([A-Za-z_][A-Za-z0-9_,\s]+)(?:\s*\{)", body)
        if sig_throws_match:
            for part in sig_throws_match.group(1).split(","):
                t = part.strip()
                if t and t not in thrown_types:
                    thrown_types.append(t)
        log.debug(
            "regex parsed method %s: params=%s return=%s throws=%s",
            name, params, return_type, thrown_types,
        )
        functions.append(
            FunctionSchema(
                name=name,
                parameters=params,
                parameter_details=parameter_details or [{"name": p, "type": None, "default_value": None} for p in params],
                return_type=return_type,
                conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                branch_conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                comparison_operators=operators,
                literal_values=literals,
                allowed_values=allowed_values,
                default_values={},
                exceptions_detail=thrown_types,
                loops=_loops_regex(body),
                returns=_returns_regex(body),
                exceptions=len(thrown_types),
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
