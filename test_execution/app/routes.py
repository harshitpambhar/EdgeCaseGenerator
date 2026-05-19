"""
Test Execution - HTTP routes.

Wraps existing test runner.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from runner import run_tests  # Existing runner


router = APIRouter(prefix="/api/execution", tags=["Execution"])


class ExecuteTestRequest(BaseModel):
    """Request to execute tests."""
    test_file_path: str
    language: str
    timeout_seconds: int = 30


@router.post("/execute", summary="Execute a test file")
def execute_tests(request: ExecuteTestRequest):
    """Execute tests from a file."""
    try:
        start = time.time()
        
        # Use existing runner
        result = run_tests(
            test_file=Path(request.test_file_path),
            language=request.language,
            timeout=request.timeout_seconds,
        )
        
        elapsed = (time.time() - start) * 1000
        
        return {
            "success": True,
            "test_file": request.test_file_path,
            "language": request.language,
            "total_tests": result.get("total", 0),
            "passed": result.get("passed", 0),
            "failed": result.get("failed", 0),
            "results": result.get("tests", []),
            "execution_time_ms": elapsed,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")
