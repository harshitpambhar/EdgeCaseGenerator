import ast
from pathlib import Path
from typing import Any


def calculate_complexity(conditions_count, loops_count, exceptions_count):
    """
    Simplified Cyclomatic Complexity

    Formula:
    1 + decision points
    """

    return 1 + conditions_count + loops_count + exceptions_count


def _safe_literal(node: ast.AST | None) -> Any:
    if node is None:
        return None
    try:
        return ast.literal_eval(node)
    except Exception:
        try:
            return ast.unparse(node)
        except Exception:
            return None


def _annotation_to_text(node: ast.AST | None) -> str | None:
    if node is None:
        return None
    try:
        return ast.unparse(node)
    except Exception:
        return None


def _normalize_type(type_text: str | None) -> str | None:
    if not type_text:
        return None
    normalized = type_text.strip().lower()
    if normalized in {"str", "string", "text"}:
        return "string"
    if normalized in {"int", "float", "complex", "number", "decimal"}:
        return "number"
    if normalized in {"bool", "boolean"}:
        return "boolean"
    if normalized in {"list", "tuple", "set", "sequence"}:
        return "list"
    if normalized in {"dict", "mapping", "object"}:
        return "object"
    return type_text


def _extract_function_semantics(node: ast.FunctionDef) -> tuple[list[str], list[str], dict[str, list[Any]], list[Any], list[str], dict[str, Any]]:
    conditions: list[str] = []
    operators: list[str] = []
    allowed_values: dict[str, list[Any]] = {}
    literal_values: list[Any] = []
    exceptions_detail: list[str] = []
    default_values: dict[str, Any] = {}

    for sub in ast.walk(node):
        if isinstance(sub, ast.Compare):
            try:
                cond_text = ast.unparse(sub)
            except Exception:
                cond_text = ast.dump(sub)
            if cond_text not in conditions:
                conditions.append(cond_text)

            operators.extend(type(op).__name__ for op in sub.ops)

            left_name = sub.left.id if isinstance(sub.left, ast.Name) else None
            for comp in sub.comparators:
                value = _safe_literal(comp)
                if value is None:
                    continue
                literal_values.append(value)
                if left_name:
                    allowed_values.setdefault(left_name, []).append(value)

        elif isinstance(sub, ast.Constant) and sub.value is not None:
            literal_values.append(sub.value)

        elif isinstance(sub, ast.Try):
            for handler in sub.handlers:
                if handler.type is None:
                    continue
                try:
                    exception_name = ast.unparse(handler.type)
                except Exception:
                    exception_name = ast.dump(handler.type)
                if exception_name not in exceptions_detail:
                    exceptions_detail.append(exception_name)

    params = [arg.arg for arg in node.args.args]
    defaults = list(node.args.defaults or [])
    default_offset = len(params) - len(defaults)
    for index, arg in enumerate(node.args.args):
        default_index = index - default_offset
        if default_index >= 0 and default_index < len(defaults):
            default_values[arg.arg] = _safe_literal(defaults[default_index])

    operators = list(dict.fromkeys(operators))
    literal_values = list(dict.fromkeys(literal_values))
    allowed_values = {key: list(dict.fromkeys(values)) for key, values in allowed_values.items()}
    return conditions, operators, allowed_values, literal_values, exceptions_detail, default_values


def parse_python_file(file_path: str) -> dict:
    source_path = Path(file_path)
    source_code = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source_code)

    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            parameters = [arg.arg for arg in node.args.args]
            parameter_details = []
            for arg in node.args.args:
                parameter_details.append(
                    {
                        "name": arg.arg,
                        "type": _normalize_type(_annotation_to_text(arg.annotation)),
                        "default_value": None,
                    }
                )

            defaults = list(node.args.defaults or [])
            default_offset = len(parameters) - len(defaults)
            for index, detail in enumerate(parameter_details):
                default_index = index - default_offset
                if default_index >= 0 and default_index < len(defaults):
                    detail["default_value"] = _safe_literal(defaults[default_index])

            try:
                return_type = ast.unparse(node.returns) if node.returns is not None else None
            except Exception:
                return_type = None

            docstring = ast.get_docstring(node) or ""
            conditions, operators, allowed_values, literal_values, exceptions_detail, default_values = _extract_function_semantics(node)
            loop_count = 0
            exception_count = 0
            return_count = 0

            for sub in ast.walk(node):
                if isinstance(sub, ast.If):
                    try:
                        cond = ast.unparse(sub.test)
                    except Exception:
                        cond = ast.dump(sub.test)
                    if cond not in conditions:
                        conditions.append(cond)

                if isinstance(sub, (ast.For, ast.While)):
                    loop_count += 1

                if isinstance(sub, ast.Try):
                    exception_count += len(sub.handlers)

                if isinstance(sub, ast.Return):
                    return_count += 1

            complexity_score = calculate_complexity(
                len(conditions), loop_count, exception_count
            )

            functions.append(
                {
                    "name": node.name,
                    "parameters": parameters,
                    "parameter_details": parameter_details,
                    "return_type": return_type,
                    "docstring": docstring,
                    "conditions": conditions,
                    "branch_conditions": conditions,
                    "comparison_operators": operators,
                    "literal_values": literal_values,
                    "allowed_values": allowed_values,
                    "exceptions_detail": exceptions_detail,
                    "default_values": default_values,
                    "loops": loop_count,
                    "returns": return_count,
                    "exceptions": exception_count,
                    "complexity_score": complexity_score,
                }
            )

    return {
        "source_file": str(source_path),
        "function_count": len(functions),
        "functions": functions,
    }
