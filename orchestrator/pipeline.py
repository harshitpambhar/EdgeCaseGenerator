"""
Orchestrator pipeline — coordinates every service end-to-end.

Flow:
  1. Clone repository → temp workspace
  2. Scan repository
  3. Parse each source file (language-aware)
  4. Generate edge cases
  5. Generate tests
  6. Write test files
  7. Execute tests
  8. Run coverage
  9. Run risk analysis
  10. Build unified report
  11. Cleanup temp workspace
  12. Return PipelineResponse
"""
from __future__ import annotations

import shutil
import sys
import tempfile
import uuid
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from bootstrap import bootstrap
bootstrap()

from shared.config.settings import TEMP_WORKSPACE_ROOT
from shared.schemas.models import (
    CoverageSchema,
    ExecutionResult,
    GeneratedTest,
    ParsedFileSchema,
    PipelineResponse,
    RiskAnalysisSchema,
    ScanResult,
)
from shared.utils.file_io import write_json
from shared.utils.logger import get_logger

log = get_logger(__name__)


# ── service imports (after bootstrap) ────────────────────────────────────────
# Imported at function call time to avoid circular path issues at module load.

def _services():
    """Return all service callables as a named tuple-like dict."""
    from git_cloner import clone_repository
    from scanner import scan_repository

    # parser-engine/dispatcher.py  (parse_file)
    import importlib, sys as _sys
    # Force load from parser-engine dir
    _pe = str(_ROOT / "parser-engine")
    if _pe not in _sys.path:
        _sys.path.insert(0, _pe)
    _parser_dispatcher = importlib.import_module("dispatcher")

    # edge-case-engine/generator.py
    _ece = str(_ROOT / "edge-case-engine")
    if _ece not in _sys.path:
        _sys.path.insert(0, _ece)
    _edge_gen = importlib.import_module("generator")

    # test-generation/dispatcher.py
    _tg = str(_ROOT / "test-generation")
    if _tg not in _sys.path:
        _sys.path.insert(0, _tg)
    _test_dispatcher = importlib.import_module("dispatcher")

    # test-execution
    _te = str(_ROOT / "test-execution")
    if _te not in _sys.path:
        _sys.path.insert(0, _te)
    _test_writer = importlib.import_module("test_writer")
    _test_runner = importlib.import_module("runner")

    # coverage-analysis
    _ca = str(_ROOT / "coverage-analysis")
    if _ca not in _sys.path:
        _sys.path.insert(0, _ca)
    _cov_runner = importlib.import_module("runner")

    # risk-analysis
    _ra = str(_ROOT / "risk-analysis")
    if _ra not in _sys.path:
        _sys.path.insert(0, _ra)
    _risk_analyzer = importlib.import_module("analyzer")

    # report-generator
    _rg = str(_ROOT / "report-generator")
    if _rg not in _sys.path:
        _sys.path.insert(0, _rg)
    _report_builder = importlib.import_module("builder")

    return {
        "clone":        clone_repository,
        "scan":         scan_repository,
        "parse_file":   _parser_dispatcher.parse_file,
        "edge_cases":   _edge_gen.generate_edge_cases_for_file,
        "gen_tests":    _test_dispatcher.generate_tests,
        "write_tests":  _test_writer.write_test_file,
        "exec_tests":   _test_runner.execute_tests,
        "coverage":     _cov_runner.run_coverage,
        "risk":         _risk_analyzer.analyze_risk,
        "report":       _report_builder.build_report,
    }


# ── empty result helpers ──────────────────────────────────────────────────────

def _empty_execution() -> ExecutionResult:
    return ExecutionResult(passed=0, failed=0, errors=[], logs=[], duration_seconds=0.0)


def _empty_coverage() -> CoverageSchema:
    return CoverageSchema(
        coverage_percent=0.0,
        covered_functions=[], uncovered_functions=[],
        covered_functions_count=0, uncovered_functions_count=0,
        uncovered_branches=[], missing_lines=[],
        recommendation="Coverage not run",
    )


def _empty_risk() -> RiskAnalysisSchema:
    return RiskAnalysisSchema(functions=[])


# ── main pipeline ─────────────────────────────────────────────────────────────

def run_pipeline(
    repo_url: str,
    *,
    run_tests: bool = True,
    run_coverage_flag: bool = True,
    output_dir: Path | None = None,
) -> PipelineResponse:
    """
    Execute the full analysis pipeline for a GitHub repository.

    Parameters
    ----------
    repo_url          : GitHub (or any git) repository URL.
    run_tests         : Whether to execute generated tests.
    run_coverage_flag : Whether to run coverage analysis.
    output_dir        : Optional directory to persist the final report JSON.

    Returns
    -------
    PipelineResponse (dict)
    """
    svc = _services()
    job_id = str(uuid.uuid4())
    log.info("=== Pipeline START  job=%s  repo=%s ===", job_id, repo_url)

    tmp_root = TEMP_WORKSPACE_ROOT
    try:
        tmp_root.mkdir(parents=True, exist_ok=True)
    except Exception:
        tmp_root = None

    workspace = Path(tempfile.mkdtemp(
        prefix=f"ecg_{job_id[:8]}_",
        dir=str(tmp_root) if tmp_root else None,
    ))
    repo_dir = workspace / "repo"

    try:
        # ── 1. Clone ──────────────────────────────────────────────────────────
        svc["clone"](repo_url, repo_dir)

        # ── 2. Scan ───────────────────────────────────────────────────────────
        scan: ScanResult = svc["scan"](repo_dir)
        log.info("Scan: %d files, languages=%s", scan["total_files"], scan["languages_detected"])

        # ── 3 → 5. Parse → Edge Cases → Tests ────────────────────────────────
        all_parsed:  list[ParsedFileSchema] = []
        all_tests:   list[GeneratedTest]    = []
        functions_detected = 0

        for scanned_file in scan["files"]:
            parsed = svc["parse_file"](scanned_file["path"], scanned_file["language"])
            if parsed is None:
                continue
            all_parsed.append(parsed)
            functions_detected += parsed["function_count"]

            edge_cases = svc["edge_cases"](parsed)
            tests = svc["gen_tests"](edge_cases, scanned_file["language"])
            all_tests.extend(tests)

        log.info("Functions: %d | Tests generated: %d", functions_detected, len(all_tests))

        # ── 6 & 7. Write + Execute (per language) ─────────────────────────────
        execution: ExecutionResult = _empty_execution()
        coverage:  CoverageSchema  = _empty_coverage()

        by_language: dict[str, list[GeneratedTest]] = {}
        for t in all_tests:
            by_language.setdefault(t["language"], []).append(t)

        for lang, lang_tests in by_language.items():
            test_file = svc["write_tests"](lang_tests, workspace / "tests", lang)

            if run_tests:
                exec_result = svc["exec_tests"](test_file, lang, workspace)
                execution = ExecutionResult(
                    passed=execution["passed"] + exec_result["passed"],
                    failed=execution["failed"] + exec_result["failed"],
                    errors=execution["errors"] + exec_result["errors"],
                    logs=execution["logs"] + exec_result["logs"],
                    duration_seconds=round(
                        execution["duration_seconds"] + exec_result["duration_seconds"], 3
                    ),
                )

            if run_coverage_flag and lang == "python":
                coverage = svc["coverage"](test_file, lang, repo_dir, workspace)

        # ── 8. Risk analysis ──────────────────────────────────────────────────
        risk: RiskAnalysisSchema = _empty_risk()
        if all_parsed:
            merged_functions = [fn for p in all_parsed for fn in p["functions"]]
            merged_parsed = ParsedFileSchema(
                source_file="<merged>",
                language="mixed",
                function_count=len(merged_functions),
                functions=merged_functions,
            )
            risk = svc["risk"](merged_parsed)

        # ── 9. Build report ───────────────────────────────────────────────────
        report = svc["report"](
            job_id=job_id,
            repo_url=repo_url,
            scan=scan,
            generated_tests=all_tests,
            coverage=coverage,
            risk=risk,
            execution=execution,
            functions_detected=functions_detected,
        )

        # ── 10. Persist (optional) ────────────────────────────────────────────
        if output_dir:
            out = Path(output_dir)
            out.mkdir(parents=True, exist_ok=True)
            write_json(out / f"{job_id}.json", report)
            log.info("Report saved → %s/%s.json", output_dir, job_id)

        log.info("=== Pipeline DONE  job=%s ===", job_id)
        return report

    except Exception as exc:
        log.exception("Pipeline failed for job=%s: %s", job_id, exc)
        raise
    finally:
        shutil.rmtree(workspace, ignore_errors=True)
        log.info("Workspace cleaned: %s", workspace)
