"""
Coverage Analysis - HTTP routes.

Wraps existing coverage analyzer.
"""
from __future__ import annotations

import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.utils.logger import get_logger
from ..runner import run_coverage


router = APIRouter(prefix="/api/coverage", tags=["Coverage"])
log = get_logger(__name__)


class AnalyzeCoverageRequest(BaseModel):
    """Request to analyze coverage."""
    test_file_path: str
    source_dir: str
    language: str
    work_dir: str | None = None


class AnalyzeCoverageResponse(BaseModel):
    """Response from coverage analysis."""
    success: bool
    test_file: str
    source_dir: str
    language: str
    result: dict[str, Any]
    analysis_time_ms: float


@router.post("/analyze", response_model=AnalyzeCoverageResponse, summary="Analyze test coverage")
def analyze_coverage(request: AnalyzeCoverageRequest):
    """Analyze test coverage for a test file."""
    try:
        log.info("Analyzing coverage for %s (language=%s)", request.test_file_path, request.language)
        start = time.time()
        work_dir = Path(request.work_dir) if request.work_dir else Path(request.source_dir)
        result = run_coverage(
            test_file=Path(request.test_file_path),
            language=request.language,
            source_dir=Path(request.source_dir),
            work_dir=work_dir,
        )

        elapsed = (time.time() - start) * 1000

        return AnalyzeCoverageResponse(
            success=True,
            test_file=request.test_file_path,
            source_dir=request.source_dir,
            language=request.language,
            result=result,
            analysis_time_ms=elapsed,
        )
    except Exception as e:
        log.error("Coverage analysis failed for %s: %s", request.test_file_path, e)
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
