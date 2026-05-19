import json
from pathlib import Path
from typing import Any

try:
    from . import templates
    from . import utils
except ImportError:
    import templates
    import utils


def load_edge_cases(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def normalize_entries(data):
    """Normalize supported payload shapes into a function-entry list."""
    if isinstance(data, dict):
        if "functions" in data and isinstance(data["functions"], list):
            return data["functions"]
        if "function" in data and "edge_cases" in data:
            return [data]
    if isinstance(data, list):
        return data
    return []


def extract_source_import(source_file: str | None) -> str | None:
    if not source_file:
        return None
    module_path = Path(source_file).with_suffix("")
    module_name = ".".join(module_path.parts)
    function_names = []
    return (
        f"from {module_name} import {', '.join(function_names)}"
        if function_names
        else None
    )


def collect_cases(edge_cases):
    cases = []
    if isinstance(edge_cases, dict):
        for condition, values in edge_cases.items():
            if isinstance(values, list):
                for value in values:
                    cases.append({"condition": condition, "value": value})
            else:
                cases.append({"condition": condition, "value": values})
    elif isinstance(edge_cases, list):
        for value in edge_cases:
            cases.append({"condition": None, "value": value})
    return cases


def generate_tests_from_edge_cases(
    edge_cases_path: str,
    output_py_path: str,
    output_json_path: str,
):
    edge_cases_path = Path(edge_cases_path)
    output_py_path = Path(output_py_path)
    output_json_path = Path(output_json_path)

    data = load_edge_cases(edge_cases_path)
    entries = normalize_entries(data)

    source_file = data.get("source_file") if isinstance(data, dict) else None
    import_lines = []
    source_dirs = []

    if source_file:
        # Extract the source directory (everything except the .py file)
        source_path = Path(source_file)
        parts = source_path.parts[:-1]  # Remove the file name

        # Check if any part has a hyphen (invalid module name)
        has_hyphen = any("-" in part for part in parts)

        if has_hyphen:
            # Add the immediate parent directory to sys.path
            # E.g., for "parser-engine/sample_code/sample.py", add "parser-engine/sample_code"
            src_dir = "/".join(parts)
            source_dirs.append(src_dir)
            # Import just the module name
            module_name = source_path.stem
            exported_names = [
                entry.get("name") for entry in entries if entry.get("name")
            ]
            exported_names = [name for name in exported_names if name]
            if exported_names:
                import_lines.append(
                    f"from {module_name} import {', '.join(exported_names)}"
                )
        else:
            # Use the full module path
            module_path = source_path.with_suffix("")
            module_name = ".".join(module_path.parts)
            exported_names = [
                entry.get("name") for entry in entries if entry.get("name")
            ]
            exported_names = [name for name in exported_names if name]
            if exported_names:
                import_lines.append(
                    f"from {module_name} import {', '.join(exported_names)}"
                )

    module_parts = [templates.module_header(import_lines, source_dirs)]
    generated_meta = []

    for entry in entries:
        func = entry.get("function") or entry.get("name")
        if not func:
            continue

        cases = collect_cases(entry.get("edge_cases") or [])
        if not cases:
            continue

        for idx, case in enumerate(cases):
            value = case["value"]
            test_name = f"test_{utils.sanitize_name(func)}_{idx}"
            test_src = templates.render_test_function(func, value, test_name)
            module_parts.append(test_src)
            generated_meta.append(
                {
                    "function": func,
                    "case": value,
                    "condition": case["condition"],
                    "test_name": test_name,
                }
            )

    output_code = "\n".join(module_parts)
    utils.write_file(output_py_path, output_code)
    utils.save_json(output_json_path, {"generated": generated_meta})


if __name__ == "__main__":
    base = Path(__file__).resolve().parents[1] / "output"
    edge_cases_file = base / "edge_cases.json"
    output_py = base / "generated_tests.py"
    output_json = base / "generated_tests.json"

    generate_tests_from_edge_cases(
        str(edge_cases_file), str(output_py), str(output_json)
    )
