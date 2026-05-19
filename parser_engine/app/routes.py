"""
Parser Engine - HTTP routes.

Simple wrapper around existing parser dispatcher.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import sys

# Setup paths
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from dispatcher import dispatch_parse  # Existing parser dispatcher


router = APIRouter(prefix="/api/parser", tags=["Parser"])


class ParseRequest(BaseModel):
    """Request to parse a file."""
    file_path: str = Field(..., description="Path to source file to parse")
    language: str = Field(default=None, description="Language hint (optional)")


class ParseResponse(BaseModel):
    """Response from parsing."""
    success: bool
    file_path: str
    language: str
    function_count: int
    class_count: int
    total_lines: int
    total_conditions: int


@router.post("/parse", response_model=ParseResponse, summary="Parse a file")
def parse_file(request: ParseRequest):
    """
    Parse a source code file.
    
    Extracts functions, classes, and conditions.
    """
    try:
        # Use existing dispatcher
        result = dispatch_parse(request.file_path, request.language)
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to parse file")
        
        return ParseResponse(
            success=True,
            file_path=request.file_path,
            language=result.get("language", request.language or "unknown"),
            function_count=len(result.get("functions", [])),
            class_count=len(result.get("classes", [])),
            total_lines=result.get("total_lines", 0),
            total_conditions=sum(
                len(f.get("conditions", [])) for f in result.get("functions", [])
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")


@router.get("/supported-languages", summary="Get supported languages")
def get_languages():
    """Get list of supported programming languages."""
    return {
        "languages": [
            "python", "javascript", "typescript", "java", 
            "cpp", "csharp", "go", "rust"
        ]
    }
