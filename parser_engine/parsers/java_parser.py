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

def is_valid_function_name(name: str, language: str) -> bool:
    if not name:
        return False
    if language == "python":
        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", name):
            return False
    else:
        if not re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$]*$", name):
            return False
            
    # Keywords
    keywords = {
        "if", "for", "while", "catch", "switch", "try", "except", "finally", 
        "else", "elif", "do", "break", "continue", "return", "throw", "throws", 
        "class", "interface", "enum", "function", "def", "async", "await", 
        "yield", "let", "var", "const", "new", "void", "delete", "typeof", 
        "instanceof", "in", "of", "with", "debugger", "this", "super", "import", 
        "export", "extends", "implements", "package", "default", "case", 
        "assert", "lambda", "global", "nonlocal", "del"
    }
    if name.lower() in keywords or name in keywords:
        return False
    return True


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
    return types or (["RuntimeException"] if _throws_regex(src) else [])


def _normalize_type(type_text: str | None) -> str:
    if not type_text:
        return "unknown"
    normalized = type_text.strip().lower()
    if normalized in {"string", "str"}:
        return "string"
    if normalized in {"boolean", "bool"}:
        return "boolean"
    if normalized in {"int", "float", "double", "long", "short", "byte", "number", "integer"}:
        return "number"
    if "list" in normalized or "set" in normalized or "collection" in normalized or "[]" in normalized or "array" in normalized:
        return "list"
    if "map" in normalized or "dict" in normalized or "object" in normalized or normalized.startswith("{"):
        return "object"
    return "unknown"


def _extract_java_enums(source: str) -> dict[str, list[Any]]:
    enums = {}
    pattern = re.compile(r"\benum\s+(\w+)\s*\{([^}]+)\}", re.MULTILINE)
    for match in pattern.finditer(source):
        enum_name = match.group(1)
        body = match.group(2)
        entries = []
        clean_body = re.sub(r"//.*|/\*.*?\*/", "", body, flags=re.DOTALL)
        for part in clean_body.split(","):
            part = part.strip()
            if not part:
                continue
            m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)", part)
            if m:
                entries.append(m.group(1))
        enums[enum_name] = entries
    return enums


def _extract_switch_cases(body: str) -> dict[str, list[Any]]:
    switch_cases = {}
    switch_matches = re.finditer(r"switch\s*\(([^)]+)\)\s*\{", body)
    for sm in switch_matches:
        var_name = sm.group(1).strip()
        start = sm.end()
        case_pattern = re.compile(r"case\s+(?:['\"]([^'\"]+)['\"]|(-?\d+)|(true|false)|([A-Za-z_][A-Za-z0-9_]*))\s*:")
        for cm in case_pattern.finditer(body, pos=start):
            val = cm.group(1) or cm.group(2) or cm.group(3) or cm.group(4)
            if val is not None:
                if cm.group(2):
                    parsed_val = int(val)
                elif cm.group(3):
                    parsed_val = val.lower() == "true"
                else:
                    parsed_val = val
                switch_cases.setdefault(var_name, []).append(parsed_val)
    return switch_cases


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
        return_type = _normalize_type(method_match.group(1).strip())
        raw_params = method_match.group(3)
        for param in raw_params.split(","):
            param = param.strip()
            if not param:
                continue
            pieces = param.split()
            if len(pieces) >= 2:
                parameter_details.append({
                    "name": pieces[-1],
                    "type": _normalize_type(" ".join(pieces[:-1])),
                    "default_value": None
                })

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
    try:
        start_line = node.position.line - 1
        lines = source_code.splitlines()
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
    file_enums = {}
    for _, node in tree.filter(javalang.tree.EnumDeclaration):
        file_enums[node.name] = [entry.name for entry in (node.entries or [])]

    for _, node in tree.filter(javalang.tree.MethodDeclaration):
        name = node.name
        if not is_valid_function_name(name, "java"):
            continue

        parameter_details = []
        parameters_meta = []
        for p in (node.parameters or []):
            ptype = _normalize_type(str(getattr(p.type, "name", p.type)))
            parameter_details.append({
                "name": p.name,
                "type": ptype,
                "default_value": None
            })
            parameters_meta.append({
                "name": p.name,
                "type": ptype,
                "required": True
            })

        body_src = _method_body_src(source_code, node)
        conditions = _conditions_regex(body_src)
        semantic_conditions, allowed_values, literals, operators, semantic_params, _rt = _extract_literal_metadata(body_src)
        return_type = _normalize_type(str(getattr(node.return_type, "name", node.return_type)) if node.return_type else None)
        
        declared_throws = []
        for exc in (node.throws or []):
            exc_name = getattr(exc, "name", None) or str(exc)
            if exc_name and exc_name not in declared_throws:
                declared_throws.append(exc_name)
        body_thrown = _extract_thrown_types(body_src)
        exceptions_list = list(dict.fromkeys(declared_throws + [t for t in body_thrown if t not in declared_throws]))
        if not exceptions_list and _throws_regex(body_src):
            exceptions_list = ["RuntimeException"]

        # Map enum values to parameters if type matches enum
        for detail in parameter_details:
            pname = detail["name"]
            ptype = detail["type"]
            for enum_name, enum_vals in file_enums.items():
                if (ptype and ptype.lower() == enum_name.lower()) or (pname and enum_name.lower() in pname.lower()):
                    allowed_values.setdefault(pname, []).extend(enum_vals)

        # Extract switch cases
        switches = _extract_switch_cases(body_src)
        for var_name, vals in switches.items():
            for detail in parameter_details:
                pname = detail["name"]
                if pname == var_name:
                    allowed_values.setdefault(pname, []).extend(vals)

        allowed_values = {k: list(dict.fromkeys(v)) for k, v in allowed_values.items()}

        # Log exactly as requested
        log.info("Extracted Function:\n%s", name)
        log.info("Parameters:\n%s", parameters_meta)
        log.info("Return Type:\n%s", return_type)
        log.info("Allowed Values:\n%s", allowed_values)
        log.info("Exceptions:\n%s", exceptions_list)

        functions.append(
            FunctionSchema(
                name=name,
                parameters=parameters_meta,
                parameter_details=parameter_details,
                return_type=return_type,
                conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                branch_conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                comparison_operators=operators,
                literal_values=literals,
                allowed_values=allowed_values,
                default_values={},
                exceptions_detail=exceptions_list,
                loops=_loops_regex(body_src),
                returns=_returns_regex(body_src),
                exceptions=exceptions_list,
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
    file_enums = _extract_java_enums(source_code)

    for m in _METHOD_RE.finditer(source_code):
        name = m.group(1)
        if not name or not is_valid_function_name(name, "java"):
            continue

        raw_params = m.group(2) or ""
        parameter_details = []
        parameters_meta = []
        for param in raw_params.split(","):
            param = param.strip()
            if not param:
                continue
            pieces = param.split()
            if len(pieces) >= 2:
                pname = pieces[-1]
                ptype = _normalize_type(" ".join(pieces[:-1]))
                parameter_details.append({
                    "name": pname,
                    "type": ptype,
                    "default_value": None
                })
                parameters_meta.append({
                    "name": pname,
                    "type": ptype,
                    "required": True
                })

        body = source_code[m.start() : m.start() + 2000]
        conditions = _conditions_regex(body)
        semantic_conditions, allowed_values, literals, operators, semantic_params, return_type = _extract_literal_metadata(body)
        exceptions_list = _extract_thrown_types(body)

        # Map enum values to parameters if type matches enum
        for detail in parameter_details:
            pname = detail["name"]
            ptype = detail["type"]
            for enum_name, enum_vals in file_enums.items():
                if (ptype and ptype.lower() == enum_name.lower()) or (pname and enum_name.lower() in pname.lower()):
                    allowed_values.setdefault(pname, []).extend(enum_vals)

        # Extract switch cases
        switches = _extract_switch_cases(body)
        for var_name, vals in switches.items():
            for detail in parameter_details:
                pname = detail["name"]
                if pname == var_name:
                    allowed_values.setdefault(pname, []).extend(vals)

        allowed_values = {k: list(dict.fromkeys(v)) for k, v in allowed_values.items()}

        # Log exactly as requested
        log.info("Extracted Function:\n%s", name)
        log.info("Parameters:\n%s", parameters_meta)
        log.info("Return Type:\n%s", return_type)
        log.info("Allowed Values:\n%s", allowed_values)
        log.info("Exceptions:\n%s", exceptions_list)

        functions.append(
            FunctionSchema(
                name=name,
                parameters=parameters_meta,
                parameter_details=parameter_details,
                return_type=return_type,
                conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                branch_conditions=list(dict.fromkeys(conditions + semantic_conditions)),
                comparison_operators=operators,
                literal_values=literals,
                allowed_values=allowed_values,
                default_values={},
                exceptions_detail=exceptions_list,
                loops=_loops_regex(body),
                returns=_returns_regex(body),
                exceptions=exceptions_list,
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
