"""
FastAPI entry-point for the AI pipeline service.

POST /api/analyze  →  run_pipeline()  →  PipelineResponse JSON
GET  /api/health   →  liveness probe
"""
from __future__ import annotations

import sys
from pathlib import Path

# Bootstrap paths before any service import
sys.path.insert(0, str(Path(__file__).resolve().parent))
from bootstrap import bootstrap
bootstrap()

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl

from orchestrator.pipeline import run_pipeline
from shared.utils.logger import get_logger

log = get_logger("api")
app = FastAPI(title="AI Test Case Generator", version="0.1.0")


class AnalyzeRequest(BaseModel):
    repo_url: str
    run_tests: bool = True
    run_coverage: bool = True


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    try:
        report = run_pipeline(
            req.repo_url,
            run_tests=req.run_tests,
            run_coverage_flag=req.run_coverage,
        )
        return JSONResponse(content=report)
    except Exception as exc:
        log.exception("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
