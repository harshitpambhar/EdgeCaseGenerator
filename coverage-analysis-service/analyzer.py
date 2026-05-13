import ast
from pathlib import Path
from typing import Any, Dict, List, Set


def _load_source_functions(source_path: Path) -> Dict[str, tuple[int, int]]:
    source_code = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source_code)
    function_ranges: Dict[str, tuple[int, int]] = {}

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            start_line = node.lineno
            end_line = getattr(node, "end_lineno", node.lineno)
            function_ranges[node.name] = (start_line, end_line)

    return function_ranges


def _function_is_covered(
    function_range: tuple[int, int],
    missing_lines: Set[int],
) -> bool:
    start_line, end_line = function_range
    return not any(line in missing_lines for line in range(start_line, end_line + 1))


def analyze_coverage(
    parsed_data: Dict[str, Any],
    coverage_data: Dict[str, Any],
    repo_root: Path,
) -> Dict[str, Any]:
    source_file = parsed_data.get("source_file", "")
    source_path = (repo_root / "parser-engine" / source_file).resolve()
    function_ranges = _load_source_functions(source_path)

    file_summaries = coverage_data.get("files", {})
    sample_file_key = None
    for file_key in file_summaries:
        if file_key.endswith("sample.py"):
            sample_file_key = file_key
            break

    file_summary = file_summaries.get(sample_file_key, {}) if sample_file_key else {}
    file_summary_stats = (
        file_summary.get("summary", {}) if isinstance(file_summary, dict) else {}
    )
    missing_lines = set(file_summary.get("missing_lines", []) or [])
    covered_functions: List[str] = []
    uncovered_functions: List[str] = []

    for function_name, function_range in function_ranges.items():
        if _function_is_covered(function_range, missing_lines):
            covered_functions.append(function_name)
        else:
            uncovered_functions.append(function_name)

    coverage_percent = round(
        float(file_summary_stats.get("percent_covered", 0.0) or 0.0), 2
    )
    uncovered_branches = file_summary.get("missing_branches", []) or []
    uncovered_lines = file_summary.get("missing_lines", []) or []
    branch_coverage = bool(coverage_data.get("meta", {}).get("branch_coverage", False))

    recommendation = "Coverage is healthy"
    if coverage_percent < 80:
        recommendation = "Increase test coverage for uncovered functions and branches"
    if uncovered_functions:
        recommendation = f"Function {uncovered_functions[0]} needs additional tests"
    elif branch_coverage and uncovered_branches:
        recommendation = "Add branch-focused boundary tests"

    return {
        "coverage_percent": coverage_percent,
        "covered_functions": covered_functions,
        "uncovered_functions": uncovered_functions,
        "covered_functions_count": len(covered_functions),
        "uncovered_functions_count": len(uncovered_functions),
        "uncovered_branches": uncovered_branches,
        "missing_lines": uncovered_lines,
        "recommendation": recommendation,
    }
