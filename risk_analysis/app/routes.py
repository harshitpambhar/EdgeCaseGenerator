"""
Risk Analysis - HTTP routes.

Wraps existing analyzer.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from analyzer import analyze_risk  # Existing analyzer


router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])


class AnalyzeRiskRequest(BaseModel):
    """Request to analyze risk."""
    parsed_file: dict


@router.post("/analyze", summary="Analyze code risk")
def analyze_risk_endpoint(request: AnalyzeRiskRequest):
    """Analyze risk and complexity of parsed code."""
    try:
        start = time.time()
        
        # Use existing analyzer
        result = analyze_risk(request.parsed_file)
        
        elapsed = (time.time() - start) * 1000
        
        return {
            "success": True,
            "file": request.parsed_file.get("source_file", "unknown"),
            "risk_analysis": result,
            "analysis_time_ms": elapsed,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
