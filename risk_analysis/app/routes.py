"""
Risk Analysis - HTTP routes.

Wraps existing analyzer.
"""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.utils.logger import get_logger
from ..analyzer import analyze_risk


router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])
log = get_logger(__name__)


class AnalyzeRiskRequest(BaseModel):
    """Request to analyze risk."""
    parsed_file: dict[str, Any]


class AnalyzeRiskResponse(BaseModel):
    """Response from risk analysis."""
    success: bool
    file: str
    result: dict[str, Any]
    analysis_time_ms: float


@router.post("/analyze", response_model=AnalyzeRiskResponse, summary="Analyze code risk")
def analyze_risk_endpoint(request: AnalyzeRiskRequest):
    """Analyze risk and complexity of parsed code."""
    try:
        log.info("Analyzing risk for %s", request.parsed_file.get("source_file", "unknown"))
        start = time.time()
        result = analyze_risk(request.parsed_file)

        elapsed = (time.time() - start) * 1000

        return AnalyzeRiskResponse(
            success=True,
            file=request.parsed_file.get("source_file", "unknown"),
            result=result,
            analysis_time_ms=elapsed,
        )
    except Exception as e:
        log.error("Risk analysis failed for %s: %s", request.parsed_file.get("source_file", "unknown"), e)
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
