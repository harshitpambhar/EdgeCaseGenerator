from pathlib import Path

from analyzer import analyze_coverage
from coverage_runner import ensure_pytest_cov_available, run_coverage
from utils import read_json, write_json


def run_coverage_analysis() -> None:
    service_root = Path(__file__).resolve().parent
    repo_root = service_root.parent

    parser_output_path = repo_root / "parser-engine" / "output" / "parsed_output.json"
    generated_tests_path = repo_root / "ml-service" / "output" / "generated_tests.py"
    coverage_json_path = service_root / "output" / "coverage_report.json"

    missing_dependency_message = ensure_pytest_cov_available()
    if missing_dependency_message:
        raise RuntimeError(missing_dependency_message)

    completed = run_coverage(repo_root, generated_tests_path, coverage_json_path)
    if completed.returncode not in (0, 1):
        raise RuntimeError(
            "Coverage run failed:\n"
            f"STDOUT:\n{completed.stdout}\nSTDERR:\n{completed.stderr}"
        )

    if not coverage_json_path.exists():
        raise FileNotFoundError(
            f"Coverage JSON report was not created at {coverage_json_path}"
        )

    parsed_data = read_json(parser_output_path)
    coverage_data = read_json(coverage_json_path)
    summary = analyze_coverage(parsed_data, coverage_data, repo_root)
    write_json(coverage_json_path, summary)


if __name__ == "__main__":
    run_coverage_analysis()
