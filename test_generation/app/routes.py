"""
Test Generation - HTTP routes.

Wraps existing test generator dispatcher.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from dispatcher import generate_tests  # Existing dispatcher


router = APIRouter(prefix="/api/tests", tags=["Test Generation"])


class GenerateTestRequest(BaseModel):
    """Request to generate tests."""
    edge_cases: dict
    language: str
    function_name: str


@router.post("/generate", summary="Generate tests for a function")
def generate_tests_endpoint(request: GenerateTestRequest):
    """Generate test cases for a function based on edge cases."""
    try:
        start = time.time()
        
        # Use existing generator
        tests = generate_tests(
            edge_cases=request.edge_cases,
            language=request.language,
        )
        
        elapsed = (time.time() - start) * 1000
        
        return {
            "success": True,
            "function": request.function_name,
            "language": request.language,
            "tests": tests if isinstance(tests, list) else [tests],
            "count": len(tests) if isinstance(tests, list) else 1,
            "generation_time_ms": elapsed,
        }
    except Exception as e:
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
