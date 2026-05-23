"""
Report Generator - HTTP routes.

Wraps existing report builder.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from builder import build_report  # Existing builder


router = APIRouter(prefix="/api/reports", tags=["Reports"])


class BuildReportRequest(BaseModel):
    """Request to build a report."""
    job_id: str
    repo_path: str
    scan: dict
    tests: list = []
    coverage: dict = {}
    risk_analysis: dict = {}
    execution: dict = {}


@router.post("/build", summary="Build unified report")
def build_report_endpoint(request: BuildReportRequest):
    """Build a unified QA report from analysis results."""
    try:
        report = build_report(
            job_id=request.job_id,
            scan=request.scan,
            generated_tests=request.tests,
            coverage=request.coverage,
            risk=request.risk_analysis,
            execution=request.execution,
            functions_detected=request.scan.get("functions_count", 0),
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")
