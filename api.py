"""
FastAPI entry-point for the AI pipeline service.

POST /ml/analyze   →  run_pipeline()  →  PipelineResponse JSON
GET  /api/health   →  liveness probe
"""
from __future__ import annotations

import sys

# Bootstrap paths before any service import
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bootstrap import bootstrap
bootstrap()

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from orchestrator.pipeline import run_pipeline
from shared.utils.logger import get_logger

log = get_logger("api")
app = FastAPI(title="Stateless ML Engine", version="0.1.0")


class AnalyzeRequest(BaseModel):
    job_id: str
    repo_path: str
    run_tests: bool = True
    run_coverage: bool = True
    language: str | None = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/ml/analyze")
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    try:
        report = run_pipeline(
            job_id=req.job_id,
            repo_path=req.repo_path,
            run_tests=req.run_tests,
            run_coverage_flag=req.run_coverage,
            language=req.language,
        )
        return JSONResponse(content=report)
    except Exception as exc:
        log.exception("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
