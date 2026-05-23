"""
Coverage runner — language-aware wrapper.

Python  → pytest-cov (coverage.py)
JS/TS   → jest --coverage
Java    → JaCoCo (future)

Returns CoverageSchema.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.config.settings import TEST_EXECUTION_TIMEOUT
from shared.schemas.models import CoverageSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)


# ── Python / pytest-cov ───────────────────────────────────────────────────────

def _run_pytest_coverage(
    test_file: Path,
    source_dir: Path,
    work_dir: Path,
    coverage_json: Path,
) -> dict[str, Any]:
    cmd = [
        sys.executable, "-m", "pytest",
        str(test_file),
        f"--cov={source_dir}",
        f"--cov-report=json:{coverage_json}",
        "--cov-report=term-missing",
        "--tb=no", "-q",
    ]
    subprocess.run(
        cmd, cwd=str(work_dir),
        capture_output=True, text=True,
        timeout=TEST_EXECUTION_TIMEOUT, check=False,
    )
    if coverage_json.exists():
        with coverage_json.open() as fh:
            return json.load(fh)
    return {}


def _parse_coverage_json(raw: dict[str, Any], source_dir: Path) -> CoverageSchema:
    """Convert coverage.py JSON output → CoverageSchema."""
    totals = raw.get("totals", {})
    percent = round(float(totals.get("percent_covered", 0.0)), 2)

    covered: list[str] = []
    uncovered: list[str] = []
    missing_lines: list[int] = []
    uncovered_branches: list[Any] = []

    for file_key, file_data in raw.get("files", {}).items():
        summary = file_data.get("summary", {})
        missing = file_data.get("missing_lines", []) or []
        missing_lines.extend(missing)
        if summary.get("percent_covered", 0) >= 80:
            covered.append(file_key)
        else:
            uncovered.append(file_key)
        uncovered_branches.extend(file_data.get("missing_branches", []) or [])

    recommendation = "Coverage is healthy"
    if percent < 80:
        recommendation = "Increase test coverage — below 80%"
    if uncovered:
        recommendation = f"{len(uncovered)} file(s) need additional tests"

    return CoverageSchema(
        coverage_percent=percent,
        covered_functions=covered,
        uncovered_functions=uncovered,
        covered_functions_count=len(covered),
        uncovered_functions_count=len(uncovered),
        uncovered_branches=uncovered_branches,
        missing_lines=missing_lines,
        recommendation=recommendation,
    )


# ── JS/TS / jest --coverage ───────────────────────────────────────────────────

def _run_jest_coverage(
    test_file: Path,
    work_dir: Path,
    coverage_dir: Path,
) -> CoverageSchema:
    cmd = [
        "npx", "jest", str(test_file),
        "--coverage",
        f"--coverageDirectory={coverage_dir}",
        "--coverageReporters=json-summary",
        "--no-cache",
    ]
    subprocess.run(
        cmd, cwd=str(work_dir),
        capture_output=True, text=True,
        timeout=TEST_EXECUTION_TIMEOUT, check=False,
    )
    summary_file = coverage_dir / "coverage-summary.json"
    if not summary_file.exists():
        return _empty_coverage()

    with summary_file.open() as fh:
        raw = json.load(fh)

    total = raw.get("total", {})
    percent = round(float(total.get("lines", {}).get("pct", 0.0)), 2)
    return CoverageSchema(
        coverage_percent=percent,
        covered_functions=[],
        uncovered_functions=[],
        covered_functions_count=0,
        uncovered_functions_count=0,
        uncovered_branches=[],
        missing_lines=[],
        recommendation="Coverage is healthy" if percent >= 80 else "Increase JS/TS test coverage",
    )


def _empty_coverage() -> CoverageSchema:
    return CoverageSchema(
        coverage_percent=0.0,
        covered_functions=[],
        uncovered_functions=[],
        covered_functions_count=0,
        uncovered_functions_count=0,
        uncovered_branches=[],
        missing_lines=[],
        recommendation="Coverage data unavailable",
    )


# ── public API ────────────────────────────────────────────────────────────────

def run_coverage(
    test_file: Path,
    language: str,
    source_dir: Path,
    work_dir: Path,
    output_dir: Path | None = None,
) -> CoverageSchema:
    """
    Run coverage analysis for the given test file and language.
    Returns CoverageSchema. Never raises.
    """
    try:
        artifact_dir = output_dir or work_dir
        artifact_dir.mkdir(parents=True, exist_ok=True)
        if language == "python":
            coverage_json = artifact_dir / "coverage.json"
            raw = _run_pytest_coverage(test_file, source_dir, work_dir, coverage_json)
            return _parse_coverage_json(raw, source_dir)
        elif language in ("javascript", "typescript"):
            coverage_dir = artifact_dir
            return _run_jest_coverage(test_file, work_dir, coverage_dir)
        else:
            log.warning("Coverage not implemented for '%s'", language)
            return _empty_coverage()
    except Exception as exc:
        log.error("Coverage run failed: %s", exc)
        return _empty_coverage()
