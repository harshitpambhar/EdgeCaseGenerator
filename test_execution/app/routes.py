"""
Test Execution - HTTP routes.

Wraps existing test runner.
"""
from __future__ import annotations

import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from shared.utils.logger import get_logger
from ..runner import execute_tests


router = APIRouter(prefix="/api/execution", tags=["Execution"])
log = get_logger(__name__)


class ExecuteTestRequest(BaseModel):
    """Request to execute tests."""
    test_file_path: str
    language: str
    timeout_seconds: int = Field(default=30, gt=0)
    work_dir: str | None = None


class ExecuteTestResponse(BaseModel):
    """Response from test execution."""
    success: bool
    test_file: str
    language: str
    result: dict[str, Any]
    execution_time_ms: float


@router.post("/execute", response_model=ExecuteTestResponse, summary="Execute a test file")
def execute_tests_endpoint(request: ExecuteTestRequest):
    """Execute tests from a file."""
    try:
        log.info("Executing tests from %s (language=%s)", request.test_file_path, request.language)
        start = time.time()
        work_dir = Path(request.work_dir) if request.work_dir else Path(request.test_file_path).parent
        result = execute_tests(
            test_file=Path(request.test_file_path),
            language=request.language,
            work_dir=work_dir,
            timeout=request.timeout_seconds,
        )

        elapsed = (time.time() - start) * 1000

        return ExecuteTestResponse(
            success=True,
            test_file=request.test_file_path,
            language=request.language,
            result=result,
            execution_time_ms=elapsed,
        )
    except Exception as e:
        log.error("Execution failed for %s: %s", request.test_file_path, e)
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")
