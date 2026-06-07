"""
Stateless orchestration pipeline for mounted repositories.

The pipeline coordinates parsing, edge-case generation, test generation,
test execution, coverage analysis, risk analysis, and report assembly.
It never clones repositories, creates host temp workspaces, or manages
persistent infrastructure.
"""
from __future__ import annotations

import importlib
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from bootstrap import bootstrap
bootstrap()

from orchestrator.error_recovery import ExecutionTracker
from orchestrator.pipeline_stages import analyze_repository_intelligence, parse_files_parallel
from orchestrator.workspace_manager import build_workspace_layout
from shared.schemas.models import (
    CoverageSchema,
    ExecutionResult,
    GeneratedTest,
    ParsedFileSchema,
    PipelineResponse,
    RiskAnalysisSchema,
    ScanResult,
)
from shared.utils.logger import get_logger

log = get_logger(__name__)


def _require_callable(module_name: str, attr_name: str):
    """Import a callable and fail loudly if it cannot be loaded."""
    log.info("Loading service callable %s.%s", module_name, attr_name)
    try:
        module = importlib.import_module(module_name)
    except Exception as exc:
        log.error("Failed to import service module %s: %s", module_name, exc, exc_info=True)
        raise ImportError(f"Failed to import service module {module_name}: {exc}") from exc

    try:
        value = getattr(module, attr_name)
    except AttributeError as exc:
        log.error("Module %s does not export %s", module_name, attr_name, exc_info=True)
        raise ImportError(f"Module {module_name} does not export {attr_name}") from exc

    if not callable(value):
        raise TypeError(f"Export {module_name}.{attr_name} is not callable")
    return value


def _services():
    """Return all service callables required by the pipeline."""
    from repository_scanner.scanner import scan_repository

    return {
        "scan": scan_repository,
        "parse_file": _require_callable("parser_engine.dispatcher", "parse_file"),
        "edge_cases": _require_callable("edge_case_engine.generator", "generate_edge_cases_for_file"),
        "gen_tests": _require_callable("test_generation.dispatcher", "generate_tests"),
        "write_tests": _require_callable("test_execution.test_writer", "write_test_file"),
        "exec_tests": _require_callable("test_execution.runner", "execute_tests"),
        "coverage": _require_callable("coverage_analysis.runner", "run_coverage"),
        "risk": _require_callable("risk_analysis.analyzer", "analyze_risk"),
        "report": _require_callable("report_generator.builder", "build_report"),
    }


def _empty_execution() -> ExecutionResult:
    return ExecutionResult(passed=0, failed=0, errors=[], logs=[], duration_seconds=0.0)


def _empty_coverage() -> CoverageSchema:
    return CoverageSchema(
        coverage_percent=0.0,
        covered_functions=[],
        uncovered_functions=[],
        covered_functions_count=0,
        uncovered_functions_count=0,
        uncovered_branches=[],
        missing_lines=[],
        recommendation="Coverage not run",
    )


def _empty_risk() -> RiskAnalysisSchema:
    return RiskAnalysisSchema(functions=[])


def _aggregate_execution_results(results: list[ExecutionResult]) -> ExecutionResult:
    """Combine execution results from multiple languages."""
    return ExecutionResult(
        passed=sum(result["passed"] for result in results),
        failed=sum(result["failed"] for result in results),
        errors=[error for result in results for error in result["errors"]],
        logs=[line for result in results for line in result["logs"]],
        duration_seconds=round(sum(result["duration_seconds"] for result in results), 3),
    )


def _collect_all_functions(parsed_files: list[ParsedFileSchema]) -> list[dict]:
    """Collect all functions from parsed files for risk analysis."""
    functions: list[dict] = []
    for parsed in parsed_files:
        for function in parsed.get("functions", []):
            functions.append({**function, "source_file": parsed["source_file"]})
    return functions


def run_pipeline(
    *,
    job_id: str,
    repo_path: str | Path,
    run_tests: bool = True,
    run_coverage_flag: bool = True,
    language: str | None = None,
    enable_repo_intelligence: bool = True,
    enable_parallel_parsing: bool = True,
    max_parse_workers: int = 4,
) -> PipelineResponse:
    """
    Execute the analysis pipeline for a mounted repository path.

    The repository must already exist locally inside the container or mounted
    workspace. The pipeline only performs analysis and returns structured JSON.
    """
    repo_dir = Path(repo_path).expanduser().resolve()
    if not repo_dir.is_dir():
        raise ValueError(f"Repository path does not exist: {repo_dir}")

    layout = build_workspace_layout(repo_dir).ensure_directories()
    svc = _services()
    tracker = ExecutionTracker(job_id)

    if language:
        log.info("Requested language hint for job %s: %s", job_id, language)

    repo_intelligence = None
    all_parsed: list[ParsedFileSchema] = []
    all_tests: list[GeneratedTest] = []
    execution = _empty_execution()
    coverage = _empty_coverage()
    risk: RiskAnalysisSchema = _empty_risk()

    scan: ScanResult = tracker.execute_stage("scan", lambda: svc["scan"](repo_dir))
    if not scan:
        raise RuntimeError("Repository scan failed")

    log.info("Scan complete: %d files across %s", scan["total_files"], scan["languages_detected"])

    if enable_repo_intelligence:
        repo_intelligence = tracker.execute_stage(
            "repo_intelligence",
            lambda: analyze_repository_intelligence(repo_dir),
        )
        if repo_intelligence:
            log.info("Repository intelligence: %s", repo_intelligence)

    def stage_parse() -> list[ParsedFileSchema]:
        if enable_parallel_parsing and len(scan["files"]) > 1:
            def parse_scanned_file(scanned_file):
                try:
                    return svc["parse_file"](scanned_file["path"], scanned_file["language"])
                except Exception as exc:
                    raise RuntimeError(f"Failed to parse {scanned_file['path']}: {exc}") from exc

            parsed, errors = parse_files_parallel(
                scan["files"],
                parse_scanned_file,
                max_workers=max_parse_workers,
            )
            if errors:
                log.warning("Parse errors in %d files", len(errors))
            return parsed

        parsed_files: list[ParsedFileSchema] = []
        for scanned_file in scan["files"]:
            try:
                parsed = svc["parse_file"](scanned_file["path"], scanned_file["language"])
                if parsed is not None:
                    parsed_files.append(parsed)
            except Exception as exc:
                log.warning("Parse error for %s: %s", scanned_file["path"], exc)
        return parsed_files

    all_parsed = tracker.execute_stage("parse", stage_parse) or []
    functions_detected = sum(parsed["function_count"] for parsed in all_parsed)
    log.info("Parsed %d files with %d functions", len(all_parsed), functions_detected)

    def stage_generate_tests() -> list[GeneratedTest]:
        generated: list[GeneratedTest] = []
        for parsed in all_parsed:
            edge_cases = svc["edge_cases"](parsed)
            abs_path = parsed.get("source_file", "")
            rel_path = next((f["relative_path"] for f in scan["files"] if f["path"] == abs_path), None)
            if rel_path:
                edge_cases["relative_source"] = rel_path
            generated.extend(svc["gen_tests"](edge_cases, parsed["language"]))
        return generated

    all_tests = tracker.execute_stage("generate_tests", stage_generate_tests) or []
    log.info("Generated %d tests", len(all_tests))

    by_language: dict[str, list[GeneratedTest]] = {}
    for test in all_tests:
        by_language.setdefault(test["language"], []).append(test)

    execution_results: list[ExecutionResult] = []
    for lang, lang_tests in by_language.items():
        test_dir = layout.generated_tests_dir / lang

        test_file = tracker.execute_stage(
            f"write_tests_{lang}",
            lambda lang_tests=lang_tests, test_dir=test_dir, lang=lang: svc["write_tests"](lang_tests, test_dir, lang),
        )

        if not test_file:
            continue

        if run_tests:
            exec_result = tracker.execute_stage(
                f"exec_tests_{lang}",
                lambda test_file=test_file, lang=lang: svc["exec_tests"](test_file, lang, repo_dir),
            )
            if exec_result:
                execution_results.append(exec_result)

        if run_coverage_flag and lang == "python":
            coverage = tracker.execute_stage(
                f"coverage_{lang}",
                lambda test_file=test_file, lang=lang: svc["coverage"](
                    test_file,
                    lang,
                    repo_dir,
                    repo_dir,
                    output_dir=layout.coverage_dir,
                ),
            ) or _empty_coverage()

    if execution_results:
        execution = _aggregate_execution_results(execution_results)

    def stage_risk_analysis() -> RiskAnalysisSchema:
        if not all_parsed:
            return _empty_risk()
        merged_functions = _collect_all_functions(all_parsed)
        merged_parsed = ParsedFileSchema(
            source_file="<merged>",
            language="mixed",
            function_count=len(merged_functions),
            functions=merged_functions,
        )
        return svc["risk"](merged_parsed)

    risk = tracker.execute_stage("risk_analysis", stage_risk_analysis) or _empty_risk()

    report = tracker.execute_stage(
        "build_report",
        lambda: svc["report"](
            job_id=job_id,
            scan=scan,
            generated_tests=all_tests,
            coverage=coverage,
            risk=risk,
            execution=execution,
            functions_detected=functions_detected,
        ),
    )
    if not report:
        raise RuntimeError("Report building failed")

    # Save report for download endpoint
    report_file = layout.reports_dir / "report.json"
    import json
    report_file.write_text(json.dumps(report, indent=2))

    log.info("Pipeline complete for job %s", job_id)
    log.info("Workspace layout: %s", layout)
    return report
