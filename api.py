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
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from orchestrator.pipeline import run_pipeline
from orchestrator.workspace_manager import build_workspace_layout
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


@app.get("/api/download/{job_id}")
def download_tests(job_id: str):
    """Download generated tests as a structured ZIP archive."""
    from pathlib import Path
    from test_generation.download_service import create_download_archive
    from orchestrator.workspace_manager import build_workspace_layout
    
    try:
        # Attempt to locate workspace by job_id
        workspace_base = Path("/workspace") if Path("/workspace").exists() else Path.cwd()
        
        # Try common paths
        candidate_paths = [
            workspace_base / job_id,
            workspace_base / "repos" / job_id,
        ]
        
        repo_path = None
        for candidate in candidate_paths:
            if candidate.exists() and candidate.is_dir():
                repo_path = candidate
                break
        
        if not repo_path:
            raise HTTPException(
                status_code=404,
                detail=f"Workspace not found for job {job_id}. Possible causes: "
                       f"job may not exist, workspace may have been cleaned, or job may have failed."
            )
        
        layout = build_workspace_layout(repo_path)
        
        # Check if tests were generated
        if not layout.generated_tests_dir.exists():
            raise HTTPException(
                status_code=404,
                detail=f"No generated tests found for job {job_id}. "
                       f"Tests may not have been generated or workspace was cleared."
            )
        
        # Load generated test metadata from reports if available
        report_file = layout.reports_dir / "report.json"
        tests = []
        files_parsed = 0
        
        if report_file.exists():
            import json
            try:
                report_data = json.loads(report_file.read_text())
                tests = report_data.get("generated_tests", [])
                files_parsed = report_data.get("functions_detected", 0)
            except Exception as e:
                log.warning("Failed to read report file: %s", e)
        
        # If no report, scan generated_tests directory
        if not tests:
            log.info("No report found, creating archive from generated test files")
            # Create minimal test entries from files
            for lang_dir in layout.generated_tests_dir.iterdir():
                if lang_dir.is_dir():
                    for test_file in lang_dir.rglob("*.py"):
                        tests.append({
                            "function": test_file.stem,
                            "test_name": test_file.stem,
                            "language": lang_dir.name,
                            "framework": "pytest" if lang_dir.name == "python" else "unknown",
                            "code": test_file.read_text(),
                            "source_file": str(test_file.relative_to(layout.generated_tests_dir)),
                        })
        
        # Create ZIP archive
        zip_path = layout.workspace_root / f"{job_id}_tests.zip"
        create_download_archive(
            tests=tests,
            output_path=zip_path,
            repo_path=repo_path,
            files_parsed=files_parsed,
        )
        
        return FileResponse(
            path=str(zip_path),
            filename=f"{job_id}_tests.zip",
            media_type="application/zip",
        )
    
    except HTTPException:
        raise
    except Exception as exc:
        log.exception("Download error for job %s: %s", job_id, exc)
        raise HTTPException(status_code=500, detail=f"Download failed: {str(exc)}")
