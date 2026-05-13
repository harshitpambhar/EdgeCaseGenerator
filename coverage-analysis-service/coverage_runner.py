import subprocess
from pathlib import Path
from typing import List, Optional


def run_coverage(
    repo_root: Path,
    generated_tests_path: Path,
    coverage_json_path: Path,
) -> subprocess.CompletedProcess:
    command: List[str] = [
        "pytest",
        str(generated_tests_path),
        "--cov=sample",
        f"--cov-report=json:{coverage_json_path}",
        "--cov-report=term-missing",
    ]
    return subprocess.run(
        command,
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        check=False,
    )


def ensure_pytest_cov_available() -> Optional[str]:
    try:
        completed = subprocess.run(
            ["python", "-m", "pip", "show", "pytest-cov"],
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError as exc:
        return f"Unable to check pytest-cov availability: {exc}"

    if completed.returncode != 0 or "Name: pytest-cov" not in completed.stdout:
        return "pytest-cov is not installed"
    return None
