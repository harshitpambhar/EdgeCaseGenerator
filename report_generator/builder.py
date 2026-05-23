"""
Report generator — assembles the unified PipelineResponse JSON.

Accepts all intermediate outputs and produces the final structured report.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.schemas.models import (
    CoverageSchema,
    ExecutionResult,
    GeneratedTest,
    PipelineResponse,
    RiskAnalysisSchema,
    ScanResult,
)
from shared.utils.logger import get_logger

log = get_logger(__name__)


def _collect_recommendations(
    risk: RiskAnalysisSchema,
    coverage: CoverageSchema,
) -> list[str]:
    recs: list[str] = []
    for fn in risk.get("functions", []):
        if fn["risk_level"] in ("HIGH", "MEDIUM"):
            recs.append(f"[{fn['risk_level']}] {fn['name']}: {fn['recommendation']}")
    if coverage["coverage_percent"] < 80:
        recs.append(coverage["recommendation"])
    return recs


def build_report(
    job_id: str,
    scan: ScanResult,
    generated_tests: list[GeneratedTest],
    coverage: CoverageSchema,
    risk: RiskAnalysisSchema,
    execution: ExecutionResult,
    functions_detected: int,
) -> PipelineResponse:
    recommendations = _collect_recommendations(risk, coverage)
    report = PipelineResponse(
        job_id=job_id,
        languages_detected=scan["languages_detected"],
        functions_detected=functions_detected,
        generated_tests=generated_tests,
        coverage=coverage,
        risk_analysis=risk["functions"],
        recommendations=recommendations,
        execution_results=execution,
    )
    log.info(
        "Report built — job=%s functions=%d tests=%d coverage=%.1f%%",
        job_id, functions_detected, len(generated_tests), coverage["coverage_percent"],
    )
    return report
