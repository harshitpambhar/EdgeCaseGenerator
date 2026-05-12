import ast
from pathlib import Path


def calculate_complexity(conditions_count, loops_count, exceptions_count):
    """
    Simplified Cyclomatic Complexity

    Formula:
    1 + decision points
    """

    return 1 + conditions_count + loops_count + exceptions_count


def parse_python_file(file_path: str) -> dict:
    source_path = Path(file_path)
    source_code = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source_code)

    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            conditions = []
            loop_count = 0
            exception_count = 0
            return_count = 0

            for sub in ast.walk(node):
                if isinstance(sub, ast.If):
                    try:
                        cond = ast.unparse(sub.test)
                    except Exception:
                        cond = ast.dump(sub.test)
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
                    "conditions": conditions,
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
