"""
Parser Engine - HTTP routes.

Simple wrapper around existing parser dispatcher.
"""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from shared.utils.logger import get_logger
from ..dispatcher import parse_file as parse_source_file


router = APIRouter(prefix="/api/parser", tags=["Parser"])
log = get_logger(__name__)


class ParseRequest(BaseModel):
    """Request to parse a file."""
    file_path: str = Field(..., description="Path to source file to parse")
    language: str = Field(default=None, description="Language hint (optional)")


class ParseResponse(BaseModel):
    """Response from parsing."""
    success: bool
    file_path: str
    language: str
    result: dict[str, Any]
    parse_time_ms: float


@router.post("/parse", response_model=ParseResponse, summary="Parse a file")
def parse_file(request: ParseRequest):
    """
    Parse a source code file.
    
    Extracts functions, classes, and conditions.
    """
    try:
        log.info("Parsing source file %s (language=%s)", request.file_path, request.language)
        start = time.time()
        result = parse_source_file(request.file_path, request.language)

        if not result:
            raise HTTPException(status_code=400, detail="Failed to parse file")

        elapsed = (time.time() - start) * 1000
        return ParseResponse(
            success=True,
            file_path=request.file_path,
            language=result.get("language", request.language or "unknown"),
            result=result,
            parse_time_ms=elapsed,
        )
    except Exception as e:
        log.error("Parse failed for %s: %s", request.file_path, e)
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
