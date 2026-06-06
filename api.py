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
from orchestrator.workspace_manager import build_workspace_layout
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


@app.get("/api/download/{job_id}")
def download_tests(job_id: str, repo_path: str = ""):
    """
    Return a ZIP of generated test files that mirrors the project structure.
    repo_path is optional — if omitted, the endpoint discovers the workspace
    from the generated_tests directory under TEMP_WORKSPACE_ROOT.
    """
    try:
        from test_execution.test_writer import build_zip
        import os

        # Strategy 1: repo_path provided directly
        if repo_path:
            layout = build_workspace_layout(repo_path)
            tests_root = layout.generated_tests_dir
        else:
            # Strategy 2: locate workspace by job_id prefix under TEMP_WORKSPACE_ROOT
            workspace_root = Path(
                os.getenv("TEMP_WORKSPACE_ROOT", "/tmp/ecg_workspaces")
            )
            candidates = [
                d for d in workspace_root.iterdir()
                if d.is_dir() and job_id in d.name
            ] if workspace_root.exists() else []

            if not candidates:
                raise HTTPException(
                    status_code=404,
                    detail=f"No workspace found for job {job_id}. "
                           "Pass ?repo_path= if the workspace is in a custom location."
                )
            workspace_dir = candidates[0]
            tests_root = workspace_dir / "generated_tests"

        if not tests_root.exists() or not any(tests_root.rglob("*")):
            raise HTTPException(status_code=404, detail="No generated tests found for this job")

        zip_path = tests_root.parent / "reports" / f"{job_id}_tests.zip"
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        build_zip(tests_root, zip_path)
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename=f"{job_id}_tests.zip",
        )
    except HTTPException:
        raise
    except Exception as exc:
        log.exception("Download error for job %s: %s", job_id, exc)
        raise HTTPException(status_code=500, detail=str(exc))
