"""
Test Generation - HTTP routes.

Wraps existing test generator dispatcher.
"""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.utils.logger import get_logger
from ..dispatcher import generate_tests


router = APIRouter(prefix="/api/tests", tags=["Test Generation"])
log = get_logger(__name__)


class GenerateTestRequest(BaseModel):
    """Request to generate tests."""
    edge_cases: dict[str, Any]
    language: str
    function_name: str


class GenerateTestResponse(BaseModel):
    """Response from test generation."""
    success: bool
    function: str
    language: str
    tests: list[dict[str, Any]]
    count: int
    generation_time_ms: float


@router.post("/generate", response_model=GenerateTestResponse, summary="Generate tests for a function")
def generate_tests_endpoint(request: GenerateTestRequest):
    """Generate test cases for a function based on edge cases."""
    try:
        log.info("Generating tests for %s (language=%s)", request.function_name, request.language)
        start = time.time()
        tests = generate_tests(
            edge_cases=request.edge_cases,
            language=request.language,
        )

        elapsed = (time.time() - start) * 1000

        test_list = tests if isinstance(tests, list) else [tests]

        return GenerateTestResponse(
            success=True,
            function=request.function_name,
            language=request.language,
            tests=test_list,
            count=len(test_list),
            generation_time_ms=elapsed,
        )
    except Exception as e:
        log.error("Test generation failed for %s: %s", request.function_name, e)
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")


@router.get("/supported-languages", summary="Get supported languages")
def get_languages():
    """Get list of supported languages for test generation."""
    return {
        "languages": [
            {"name": "python", "framework": "pytest"},
            {"name": "javascript", "framework": "jest"},
            {"name": "typescript", "framework": "jest"},
            {"name": "java", "framework": "junit"},
        ]
    }
