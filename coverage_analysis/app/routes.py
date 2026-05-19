"""
Coverage Analysis - HTTP routes.

Wraps existing coverage analyzer.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from runner import run_coverage_analysis  # Existing coverage runner


router = APIRouter(prefix="/api/coverage", tags=["Coverage"])


class AnalyzeCoverageRequest(BaseModel):
    """Request to analyze coverage."""
    test_file_path: str
    source_dir: str
    language: str


@router.post("/analyze", summary="Analyze test coverage")
def analyze_coverage(request: AnalyzeCoverageRequest):
    """Analyze test coverage for a test file."""
    try:
        start = time.time()
        
        # Use existing analyzer
        result = run_coverage_analysis(
            test_file=Path(request.test_file_path),
            source_dir=Path(request.source_dir),
            language=request.language,
        )
        
        elapsed = (time.time() - start) * 1000
        
        return {
            "success": True,
            "test_file": request.test_file_path,
            "language": request.language,
            "overall_coverage": result.get("coverage", 0),
            "files": result.get("files", []),
            "analysis_time_ms": elapsed,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
