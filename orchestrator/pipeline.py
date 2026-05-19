"""
Orchestrator pipeline — coordinates every service end-to-end.

REFACTORED FLOW (Enhanced Production Pipeline):
  0. Analyze repository intelligence
  1. Clone repository → temp workspace
  2. Scan repository
  3. Setup execution environment & dependencies
  4. Parse each source file (language-aware) — parallel-ready
  5. Generate edge cases
  6. Generate tests
  7. Persist artifacts & checkpoints
  8. Write test files
  9. Execute tests (multi-language aware)
  10. Run coverage
  11. Run risk analysis
  12. Build unified report
  13. Persist final artifacts
  14. Cleanup temp workspace
  15. Return PipelineResponse

New Features:
- Repository intelligence & dependency detection
- Parallel parsing architecture
- Failure recovery with checkpoints
- Artifact persistence
- Multi-language execution handling
- Enhanced execution tracking
- Structured workspace management
"""
from __future__ import annotations

import shutil
import sys
import tempfile
import time
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

# Import new modules for refactoring
from workspace_manager import WorkspaceManager
from error_recovery import ExecutionTracker
from dependency_manager import DependencyManager
from pipeline_stages import (
    analyze_repository_intelligence,
    parse_files_parallel,
    setup_execution_environment,
    persist_pipeline_artifacts,
)

log = get_logger(__name__)



# ── service imports (after bootstrap) ────────────────────────────────────────
# Imported at function call time to avoid circular path issues at module load.

def _services():
    """Return all service callables as a named tuple-like dict."""
    from git_cloner import clone_repository
    from scanner import scan_repository

    import importlib.util
    import sys as _sys
    
    # Helper to load module from file path
    def _load_module(name, file_path):
        if not Path(file_path).exists():
            return None
        spec = importlib.util.spec_from_file_location(name, file_path)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module
        return None

    # parser-engine/dispatcher.py  (parse_file)
    _parser_dispatcher = _load_module(
        "_parser_dispatcher",
        str(_ROOT / "parser-engine" / "dispatcher.py")
    )

    # edge-case-engine/generator.py
    _edge_gen = _load_module(
        "_edge_gen",
        str(_ROOT / "edge-case-engine" / "generator.py")
    )

    # test-generation/dispatcher.py
    _test_dispatcher = _load_module(
        "_test_dispatcher",
        str(_ROOT / "test-generation" / "dispatcher.py")
    )

    # test-execution
    _test_writer = _load_module(
        "_test_writer",
        str(_ROOT / "test-execution" / "test_writer.py")
    )
    _test_runner = _load_module(
        "_test_runner",
        str(_ROOT / "test-execution" / "runner.py")
    )

    # coverage-analysis
    _cov_runner = _load_module(
        "_cov_runner",
        str(_ROOT / "coverage-analysis" / "runner.py")
    )

    # risk-analysis
    _risk_analyzer = _load_module(
        "_risk_analyzer",
        str(_ROOT / "risk-analysis" / "analyzer.py")
    )

    # report-generator
    _report_builder = _load_module(
        "_report_builder",
        str(_ROOT / "report-generator" / "builder.py")
    )

    return {
        "clone":        clone_repository,
        "scan":         scan_repository,
        "parse_file":   _parser_dispatcher.parse_file if _parser_dispatcher else lambda *a, **k: None,
        "edge_cases":   _edge_gen.generate_edge_cases_for_file if _edge_gen else lambda *a, **k: None,
        "gen_tests":    _test_dispatcher.generate_tests if _test_dispatcher else lambda *a, **k: None,
        "write_tests":  _test_writer.write_test_file if _test_writer else lambda *a, **k: None,
        "exec_tests":   _test_runner.execute_tests if _test_runner else lambda *a, **k: None,
        "coverage":     _cov_runner.run_coverage if _cov_runner else lambda *a, **k: None,
        "risk":         _risk_analyzer.analyze_risk if _risk_analyzer else lambda *a, **k: None,
        "report":       _report_builder.build_report if _report_builder else lambda *a, **k: None,
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


# ── helper: aggregate results across languages ────────────────────────────────

def _aggregate_execution_results(results: list[ExecutionResult]) -> ExecutionResult:
    """Combine execution results from multiple languages/stages."""
    return ExecutionResult(
        passed=sum(r["passed"] for r in results),
        failed=sum(r["failed"] for r in results),
        errors=[e for r in results for e in r["errors"]],
        logs=[l for r in results for l in r["logs"]],
        duration_seconds=round(sum(r["duration_seconds"] for r in results), 3),
    )


# ── helper: collect parsed functions ──────────────────────────────────────────

def _collect_all_functions(parsed_files: list[ParsedFileSchema]) -> list[dict]:
    """Collect all functions from parsed files for risk analysis."""
    functions = []
    for parsed in parsed_files:
        for func in parsed.get("functions", []):
            # Add source file reference
            func_with_source = {**func, "source_file": parsed["source_file"]}
            functions.append(func_with_source)
    return functions


# ── main pipeline ─────────────────────────────────────────────────────────────

def run_pipeline(
    repo_url: str,
    *,
    run_tests: bool = True,
    run_coverage_flag: bool = True,
    output_dir: Path | None = None,
    enable_repo_intelligence: bool = True,
    enable_parallel_parsing: bool = True,
    max_parse_workers: int = 4,
) -> PipelineResponse:
    """
    Execute the full analysis pipeline for a GitHub repository.

    Parameters
    ----------
    repo_url                    : GitHub (or any git) repository URL.
    run_tests                   : Whether to execute generated tests.
    run_coverage_flag           : Whether to run coverage analysis.
    output_dir                  : Optional directory to persist the final report JSON.
    enable_repo_intelligence    : Analyze repository for project type & dependencies.
    enable_parallel_parsing     : Use parallel parsing for faster processing.
    max_parse_workers           : Number of concurrent parse workers.

    Returns
    -------
    PipelineResponse (dict)
    
    Notes
    -----
    - New stages inserted incrementally while preserving existing flow
    - Uses checkpoint/recovery system for failure resilience
    - Artifacts persisted for audit trail and recovery
    - Multi-language execution awareness
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
    
    # Initialize workspace and error tracking
    ws_mgr = WorkspaceManager(workspace, job_id)
    ws_mgr.initialize()
    
    tracker = ExecutionTracker(job_id)
    dep_mgr = None
    
    repo_intelligence = None
    all_parsed:  list[ParsedFileSchema] = []
    all_tests:   list[GeneratedTest]    = []
    functions_detected = 0

    try:
        # ── STAGE 0 (NEW): Repository Intelligence ─────────────────────────
        if enable_repo_intelligence:
            # This stage runs AFTER clone so we can analyze the repo
            pass  # Will run after clone
        
        # ── STAGE 1: Clone ─────────────────────────────────────────────────
        def stage_clone():
            svc["clone"](repo_url, repo_dir)
        tracker.execute_stage("clone", stage_clone)
        ws_mgr.save_checkpoint("clone", {"repo_dir": str(repo_dir)})
        
        # ── STAGE 0 (MOVED): Repository Intelligence ──────────────────────
        if enable_repo_intelligence:
            def stage_repo_intelligence():
                return analyze_repository_intelligence(repo_dir)
            repo_intelligence = tracker.execute_stage(
                "repo_intelligence", stage_repo_intelligence
            )
            if repo_intelligence:
                ws_mgr.save_checkpoint("repo_intelligence", repo_intelligence)
                log.info("Repository intelligence: %s", repo_intelligence)
        
        # ── STAGE 2: Scan ─────────────────────────────────────────────────
        def stage_scan():
            return svc["scan"](repo_dir)
        
        scan: ScanResult = tracker.execute_stage("scan", stage_scan)
        if not scan:
            raise RuntimeError("Repository scan failed")
        
        log.info("Scan: %d files, languages=%s", scan["total_files"], 
                scan["languages_detected"])
        ws_mgr.save_checkpoint("scan", scan)
        
        # ── STAGE 3 (NEW): Environment Setup ──────────────────────────────
        if enable_repo_intelligence and repo_intelligence:
            def stage_env_setup():
                dep_mgr = DependencyManager(repo_dir)
                langs = repo_intelligence.get("project_types", [])
                return setup_execution_environment(workspace, langs, dep_mgr)
            
            env_setup_results = tracker.execute_stage("env_setup", stage_env_setup)
            if env_setup_results:
                log.info("Environment setup results: %s", env_setup_results)
        
        # ── STAGE 4: Parse (with optional parallelization) ────────────────
        def stage_parse():
            if enable_parallel_parsing and len(scan["files"]) > 1:
                # Parallel parsing - wrap parse_file to handle scanned file dicts
                def parse_scanned_file(scanned_file):
                    """Parse a scanned file dict."""
                    try:
                        result = svc["parse_file"](scanned_file["path"], 
                                                 scanned_file["language"])
                        return result
                    except Exception as e:
                        raise RuntimeError(f"Failed to parse {scanned_file['path']}: {e}")
                
                parsed, errors = parse_files_parallel(
                    scan["files"],
                    parse_scanned_file,
                    max_workers=max_parse_workers
                )
                if errors:
                    log.warning("Parse errors in %d files: %s", len(errors), 
                              errors[:5])
                return parsed
            else:
                # Sequential parsing (original behavior)
                parsed = []
                for scanned_file in scan["files"]:
                    try:
                        p = svc["parse_file"](scanned_file["path"], 
                                           scanned_file["language"])
                        if p is not None:
                            parsed.append(p)
                    except Exception as e:
                        log.warning("Parse error for %s: %s", 
                                  scanned_file["path"], e)
                return parsed
        
        all_parsed = tracker.execute_stage("parse", stage_parse)
        if not all_parsed:
            all_parsed = []
        
        ws_mgr.save_checkpoint("parse", {"count": len(all_parsed)})
        functions_detected = sum(p["function_count"] for p in all_parsed)
        log.info("Parsed files: %d | Functions: %d", len(all_parsed), 
                functions_detected)
        
        # ── STAGE 5 → 7: Edge Cases → Tests → Artifacts ─────────────────
        def stage_edge_cases_and_tests():
            tests = []
            for parsed in all_parsed:
                edge_cases = svc["edge_cases"](parsed)
                lang_tests = svc["gen_tests"](
                    edge_cases, parsed["language"]
                )
                tests.extend(lang_tests)
            return tests
        
        all_tests = tracker.execute_stage(
            "edge_cases_and_tests", stage_edge_cases_and_tests
        )
        if not all_tests:
            all_tests = []
        
        log.info("Generated tests: %d", len(all_tests))
        ws_mgr.save_checkpoint("generated_tests", {"count": len(all_tests)})
        
        # ── STAGE 7: Artifact Persistence (moved to end of pipeline) ──────
        # Note: This is now done at the end after execution, coverage, and risk
        # analysis are complete
        
        # ── STAGE 8 & 9: Write + Execute (per language) ─────────────────
        execution: ExecutionResult = _empty_execution()
        coverage:  CoverageSchema  = _empty_coverage()

        by_language: dict[str, list[GeneratedTest]] = {}
        for t in all_tests:
            by_language.setdefault(t["language"], []).append(t)

        execution_results = []
        
        for lang, lang_tests in by_language.items():
            # Write tests
            def stage_write_tests():
                return svc["write_tests"](lang_tests, workspace / "tests", lang)
            
            test_file = tracker.execute_stage(
                f"write_tests_{lang}", stage_write_tests
            )
            
            if test_file:
                # Execute tests
                if run_tests:
                    def stage_exec_tests():
                        return svc["exec_tests"](test_file, lang, workspace)
                    
                    exec_result = tracker.execute_stage(
                        f"exec_tests_{lang}", stage_exec_tests
                    )
                    if exec_result:
                        execution_results.append(exec_result)
                
                # Coverage (Python only)
                if run_coverage_flag and lang == "python":
                    def stage_coverage():
                        return svc["coverage"](test_file, lang, repo_dir, 
                                            workspace)
                    
                    coverage = tracker.execute_stage(
                        f"coverage_{lang}", stage_coverage
                    ) or _empty_coverage()
        
        # Aggregate execution results
        if execution_results:
            execution = _aggregate_execution_results(execution_results)
        
        log.info("Execution: passed=%d, failed=%d, errors=%d, duration=%.2fs",
                execution["passed"], execution["failed"], 
                len(execution["errors"]), execution["duration_seconds"])
        
        # ── STAGE 10: Risk Analysis ───────────────────────────────────────
        risk: RiskAnalysisSchema = _empty_risk()
        
        def stage_risk_analysis():
            if not all_parsed:
                return _empty_risk()
            
            # Collect all functions for risk analysis
            merged_functions = _collect_all_functions(all_parsed)
            merged_parsed = ParsedFileSchema(
                source_file="<merged>",
                language="mixed",
                function_count=len(merged_functions),
                functions=merged_functions,
            )
            return svc["risk"](merged_parsed)
        
        risk = tracker.execute_stage("risk_analysis", stage_risk_analysis) or _empty_risk()
        log.info("Risk analysis: %d functions analyzed", 
                len(risk.get("functions", [])))
        
        # ── STAGE 11: Build Report ────────────────────────────────────────
        def stage_build_report():
            return svc["report"](
                job_id=job_id,
                repo_url=repo_url,
                scan=scan,
                generated_tests=all_tests,
                coverage=coverage,
                risk=risk,
                execution=execution,
                functions_detected=functions_detected,
            )
        
        report = tracker.execute_stage("build_report", stage_build_report)
        if not report:
            report = PipelineResponse(
                job_id=job_id,
                status="failed",
                error="Report building failed",
            )

        # ── STAGE 12: Persist Final Artifacts ──────────────────────────────
        def stage_persist_report():
            if output_dir:
                out = Path(output_dir)
                out.mkdir(parents=True, exist_ok=True)
                write_json(out / f"{job_id}.json", report)
                log.info("Report saved → %s/%s.json", output_dir, job_id)
            
            # Also save in workspace artifacts
            ws_mgr.save_artifact("final_report", report)
            return output_dir
        
        tracker.execute_stage("persist_report", stage_persist_report)
        
        # ── Execution Summary ──────────────────────────────────────────────
        execution_summary = tracker.summary()
        log.info("=== Pipeline DONE (job=%s) ===", job_id)
        log.info("Execution summary: %s", execution_summary)
        log.info("Workspace summary: %s", ws_mgr.summary())
        
        return report

    except Exception as exc:
        log.exception("Pipeline failed for job=%s: %s", job_id, exc)
        
        # Attempt to save error context
        try:
            error_context = {
                "error": str(exc),
                "execution_summary": tracker.summary() if tracker else None,
                "workspace_summary": ws_mgr.summary() if ws_mgr else None,
            }
            ws_mgr.save_artifact("error_context", error_context)
        except Exception as e:
            log.warning("Could not save error context: %s", e)
        
        raise
    
    finally:
        try:
            shutil.rmtree(workspace, ignore_errors=True)
            log.info("Workspace cleaned: %s", workspace)
        except Exception as e:
            log.warning("Could not clean workspace: %s", e)
