"""
Isolated test execution engine.

Runs generated test files in a subprocess with:
  - configurable timeout
  - stdout/stderr capture
  - structured result parsing
  - no shared state between runs
"""
from __future__ import annotations

import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.config.settings import TEST_EXECUTION_TIMEOUT
from shared.schemas.models import ExecutionResult
from shared.utils.logger import get_logger

log = get_logger(__name__)


# ── language → runner command ─────────────────────────────────────────────────

def _pytest_cmd(test_file: Path, work_dir: Path) -> list[str]:
    return [sys.executable, "-m", "pytest", str(test_file), "-v", "--tb=short", "--no-header"]


def _jest_cmd(test_file: Path, work_dir: Path) -> list[str]:
    return ["npx", "jest", str(test_file), "--no-coverage"]


RUNNER_REGISTRY: dict[str, Any] = {
    "python":     _pytest_cmd,
    "javascript": _jest_cmd,
    "typescript": _jest_cmd,
}


# ── result parsing ────────────────────────────────────────────────────────────

_PYTEST_SUMMARY = re.compile(
    r"(\d+) passed(?:,\s*(\d+) failed)?(?:,\s*(\d+) error)?"
)


def _parse_pytest_output(stdout: str, stderr: str) -> tuple[int, int, list[str]]:
    passed = failed = 0
    errors: list[str] = []
    for line in stdout.splitlines():
        m = _PYTEST_SUMMARY.search(line)
        if m:
            passed = int(m.group(1) or 0)
            failed = int(m.group(2) or 0)
    if stderr.strip():
        errors.append(stderr.strip()[:2000])
    return passed, failed, errors


def _parse_jest_output(stdout: str, stderr: str) -> tuple[int, int, list[str]]:
    passed = failed = 0
    errors: list[str] = []
    for line in stdout.splitlines():
        if "Tests:" in line:
            p = re.search(r"(\d+) passed", line)
            f = re.search(r"(\d+) failed", line)
            if p:
                passed = int(p.group(1))
            if f:
                failed = int(f.group(1))
    if stderr.strip():
        errors.append(stderr.strip()[:2000])
    return passed, failed, errors


_PARSERS = {
    "python":     _parse_pytest_output,
    "javascript": _parse_jest_output,
    "typescript": _parse_jest_output,
}


# ── public API ────────────────────────────────────────────────────────────────

def execute_tests(
    test_file: Path,
    language: str,
    work_dir: Path,
    timeout: int = TEST_EXECUTION_TIMEOUT,
) -> ExecutionResult:
    """
    Run *test_file* in an isolated subprocess and return structured results.
    Never raises — errors are captured in the result.
    """
    cmd_factory = RUNNER_REGISTRY.get(language)
    if cmd_factory is None:
        log.warning("No runner for language '%s'", language)
        return ExecutionResult(
            passed=0, failed=0, errors=[f"No runner for {language}"],
            logs=[], duration_seconds=0.0,
        )

    cmd = cmd_factory(test_file, work_dir)
    log.info("Executing: %s", " ".join(cmd))
    start = time.monotonic()
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        duration = time.monotonic() - start
        stdout, stderr = proc.stdout, proc.stderr
    except subprocess.TimeoutExpired:
        duration = timeout
        log.error("Test execution timed out after %ds", timeout)
        return ExecutionResult(
            passed=0, failed=0,
            errors=[f"Execution timed out after {timeout}s"],
            logs=[], duration_seconds=float(timeout),
        )
    except Exception as exc:
        duration = time.monotonic() - start
        log.error("Execution error: %s", exc)
        return ExecutionResult(
            passed=0, failed=0, errors=[str(exc)],
            logs=[], duration_seconds=round(duration, 3),
        )

    parser = _PARSERS.get(language, _parse_pytest_output)
    passed, failed, errors = parser(stdout, stderr)

    return ExecutionResult(
        passed=passed,
        failed=failed,
        errors=errors,
        logs=[],  # Don't store logs
        duration_seconds=round(duration, 3),
    )
