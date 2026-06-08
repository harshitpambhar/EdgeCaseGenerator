import ast
import re
from pathlib import Path
from typing import Any
from shared.utils.logger import get_logger

log = get_logger(__name__)


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
        return "unknown"
    normalized = type_text.strip().lower()
    if normalized in {"str", "string", "text"}:
        return "string"
    if normalized in {"int", "float", "complex", "number", "decimal", "double"}:
        return "number"
    if normalized in {"bool", "boolean"}:
        return "boolean"
    if normalized in {"list", "tuple", "set", "sequence", "array"} or "[]" in normalized:
        return "list"
    if normalized in {"dict", "mapping", "object"} or normalized.startswith("dict[") or "map" in normalized:
        return "object"
    return "unknown"


def _extract_function_semantics(node: ast.AST) -> tuple[list[str], list[str], dict[str, list[Any]], list[Any], list[str], dict[str, Any]]:
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

        elif isinstance(sub, ast.Raise):
            exc_name = None
            if sub.exc is not None:
                if isinstance(sub.exc, ast.Name):
                    exc_name = sub.exc.id
                elif isinstance(sub.exc, ast.Call):
                    if isinstance(sub.exc.func, ast.Name):
                        exc_name = sub.exc.func.id
                    elif isinstance(sub.exc.func, ast.Attribute):
                        exc_name = sub.exc.func.attr
            if exc_name and exc_name not in exceptions_detail:
                exceptions_detail.append(exc_name)

    # Calculate default values
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
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


def _extract_python_enums(tree: ast.AST) -> dict[str, list[Any]]:
    enums = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            is_enum = False
            for base in node.bases:
                if isinstance(base, ast.Name) and base.id == "Enum":
                    is_enum = True
                elif isinstance(base, ast.Attribute) and base.attr == "Enum":
                    is_enum = True
            if is_enum or node.name.endswith("Enum"):
                enum_values = []
                for sub in node.body:
                    if isinstance(sub, ast.Assign):
                        for target in sub.targets:
                            if isinstance(target, ast.Name):
                                val = _safe_literal(sub.value)
                                if val is not None:
                                    enum_values.append(val)
                                else:
                                    enum_values.append(target.id)
                enums[node.name] = enum_values
    return enums


def parse_python_file(file_path: str) -> dict:
    source_path = Path(file_path)
    source_code = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source_code)
    file_enums = _extract_python_enums(tree)

    functions = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            name = node.name
            if not is_valid_function_name(name, "python"):
                continue

            # Build parameter details
            all_arg_nodes = getattr(node.args, "posonlyargs", []) + node.args.args + getattr(node.args, "kwonlyargs", [])
            num_pos_args = len(getattr(node.args, "posonlyargs", [])) + len(node.args.args)
            
            defaults = list(node.args.defaults or [])
            default_offset = num_pos_args - len(defaults)
            kw_defaults = list(getattr(node.args, "kw_defaults", []) or [])

            parameter_details = []
            parameters_meta = []
            default_values = {}

            for index, arg_node in enumerate(all_arg_nodes):
                arg_name = arg_node.arg
                ptype = _normalize_type(_annotation_to_text(arg_node.annotation))
                
                has_default = False
                default_val = None
                
                if index < num_pos_args:
                    default_index = index - default_offset
                    if default_index >= 0 and default_index < len(defaults):
                        has_default = True
                        default_val = _safe_literal(defaults[default_index])
                else:
                    kw_index = index - num_pos_args
                    if kw_index >= 0 and kw_index < len(kw_defaults):
                        if kw_defaults[kw_index] is not None:
                            has_default = True
                            default_val = _safe_literal(kw_defaults[kw_index])
                            
                required = not has_default
                
                parameter_details.append({
                    "name": arg_name,
                    "type": ptype,
                    "default_value": default_val
                })
                
                parameters_meta.append({
                    "name": arg_name,
                    "type": ptype,
                    "required": required
                })
                
                if has_default:
                    default_values[arg_name] = default_val

            try:
                raw_return_type = ast.unparse(node.returns) if node.returns is not None else None
                return_type = _normalize_type(raw_return_type)
            except Exception:
                return_type = "unknown"

            docstring = ast.get_docstring(node) or ""
            conditions, operators, allowed_values, literal_values, exceptions_list, semantics_defaults = _extract_function_semantics(node)
            
            # Map enum values to parameters if type matches enum
            for detail in parameter_details:
                pname = detail["name"]
                ptype = detail["type"]
                for enum_name, enum_vals in file_enums.items():
                    if (ptype and ptype.lower() == enum_name.lower()) or (pname and enum_name.lower() in pname.lower()):
                        allowed_values.setdefault(pname, []).extend(enum_vals)

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

            # Deduplicate allowed_values
            allowed_values = {k: list(dict.fromkeys(v)) for k, v in allowed_values.items()}

            # Log exactly as requested
            log.info("Extracted Function:\n%s", name)
            log.info("Parameters:\n%s", parameters_meta)
            log.info("Return Type:\n%s", return_type)
            log.info("Allowed Values:\n%s", allowed_values)
            log.info("Exceptions:\n%s", exceptions_list)

            functions.append(
                {
                    "name": name,
                    "parameters": parameters_meta,  # store rich metadata list under parameters
                    "parameter_details": parameter_details,
                    "return_type": return_type,
                    "docstring": docstring,
                    "conditions": conditions,
                    "branch_conditions": conditions,
                    "comparison_operators": operators,
                    "literal_values": literal_values,
                    "allowed_values": allowed_values,
                    "exceptions_detail": exceptions_list,
                    "default_values": default_values,
                    "loops": loop_count,
                    "returns": return_count,
                    "exceptions": exceptions_list,  # exceptions is the list of strings
                    "complexity_score": complexity_score,
                }
            )

    return {
        "source_file": str(source_path),
        "function_count": len(functions),
        "functions": functions,
    }
