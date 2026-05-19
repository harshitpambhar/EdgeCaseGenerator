"""
Edge Case Engine - HTTP routes.

Wraps existing generator.py with FastAPI endpoints.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Import existing generator
from generator import generate_edge_cases


router = APIRouter(prefix="/api/edge-cases", tags=["Edge Cases"])


class EdgeCaseRequest(BaseModel):
    """Request to generate edge cases."""
    condition: str = Field(..., description="Condition string (e.g., 'age >= 18')")
    data_type: str = Field(default=None, description="Data type hint")


class EdgeCaseResponse(BaseModel):
    """Response with generated edge cases."""
    success: bool
    condition: str
    edge_cases: list
    count: int
    generation_time_ms: float


@router.post("/generate", response_model=EdgeCaseResponse, summary="Generate edge cases")
def generate_edge_cases_endpoint(request: EdgeCaseRequest):
    """
    Generate edge cases for a condition.
    
    Supports conditions like: age >= 18, name != '', etc.
    """
    try:
        start = time.time()
        
        # Use existing generator
        edge_cases = generate_edge_cases(request.condition)
        
        if not isinstance(edge_cases, list):
            edge_cases = [edge_cases]
        
        elapsed = (time.time() - start) * 1000
        
        return EdgeCaseResponse(
            success=True,
            condition=request.condition,
            edge_cases=edge_cases,
            count=len(edge_cases),
            generation_time_ms=elapsed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")


@router.post("/batch", summary="Generate edge cases for multiple conditions")
def generate_batch_edge_cases(conditions: list[str]):
    """Generate edge cases for multiple conditions."""
    results = []
    errors = []
    
    for condition in conditions:
        try:
            start = time.time()
            edge_cases = generate_edge_cases(condition)
            elapsed = (time.time() - start) * 1000
            
            results.append({
                "condition": condition,
                "edge_cases": edge_cases if isinstance(edge_cases, list) else [edge_cases],
                "count": len(edge_cases) if isinstance(edge_cases, list) else 1,
                "time_ms": elapsed,
            })
        except Exception as e:
            errors.append({"condition": condition, "error": str(e)})
    
    return {
        "success": len(errors) == 0,
        "total": len(conditions),
        "results": results,
        "errors": errors,
    }
