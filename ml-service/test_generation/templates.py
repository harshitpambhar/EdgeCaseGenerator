def module_header(import_lines=None, source_dirs=None) -> str:
    lines = []
    if import_lines or source_dirs:
        lines.extend(
            [
                "import sys",
                "from pathlib import Path",
                "ROOT_DIR = Path(__file__).resolve().parents[2]",
                "if str(ROOT_DIR) not in sys.path:",
                "    sys.path.insert(0, str(ROOT_DIR))",
            ]
        )
        for src_dir in source_dirs or []:
            lines.append(f"SRC_DIR = ROOT_DIR / {repr(src_dir)}")
            lines.append("if str(SRC_DIR) not in sys.path:")
            lines.append("    sys.path.insert(0, str(SRC_DIR))")
        lines.append("")
    lines.append("import pytest")
    for import_line in import_lines or []:
        if import_line and import_line not in lines:
            lines.append(import_line)
    return "\n".join(lines) + "\n\n"


def render_test_function(function_name: str, case, test_name: str) -> str:
    args = _format_case_args(case)
    return f"def {test_name}():\n    assert {function_name}({args})\n\n"


def _format_case_args(case) -> str:
    # positional
    if isinstance(case, (list, tuple)):
        return ", ".join(repr(c) for c in case)
    # keyword args
    if isinstance(case, dict):
        parts = []
        for k, v in case.items():
            parts.append(f"{k}={repr(v)}")
        return ", ".join(parts)
    # single value
    return repr(case)
