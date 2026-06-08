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

from fastapi import FastAPI, HTTPException, Response
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


class DownloadRequest(BaseModel):
    tests: list[dict]
    files_parsed: int = 0
    functions_parsed: int = 0


@app.get("/api/health")
def health():
    return {"status": "ok"}


def register_job(job_id: str, repo_path: str):
    import json
    import os
    from datetime import datetime
    workspace_base = Path(os.environ.get("TEMP_WORKSPACE_ROOT", "/tmp/ecg_workspaces"))
    workspace_base.mkdir(parents=True, exist_ok=True)
    registry_path = workspace_base / "job_registry.json"
    
    repo_dir = Path(repo_path).expanduser().resolve()
    workspace_root = repo_dir.parent
    
    try:
        registry = {}
        if registry_path.exists():
            with open(registry_path, "r") as f:
                registry = json.load(f)
        registry[job_id] = {
            "repo_path": str(repo_dir),
            "workspace_root": str(workspace_root),
            "generated_tests_dir": str(workspace_root / "generated_tests"),
            "reports_dir": str(workspace_root / "reports"),
            "timestamp": datetime.utcnow().isoformat()
        }
        with open(registry_path, "w") as f:
            json.dump(registry, f, indent=2)
    except Exception as e:
        log.warning("Failed to write to job registry: %s", e)


def recover_workspace_paths(job_id: str) -> tuple[Path, Path, Path, Path]:
    import os
    import json
    
    errors_tried = []
    workspace_base = Path(os.environ.get("TEMP_WORKSPACE_ROOT", "/tmp/ecg_workspaces"))
    
    # 1. Try workspace lookup by job_id directory glob in base directory
    log.info("Workspace Recovery: Stage 1 - Looking up directory matching job_id %s in %s", job_id, workspace_base)
    matching_dirs = []
    if workspace_base.exists() and workspace_base.is_dir():
        matching_dirs = [d for d in workspace_base.iterdir() if d.is_dir() and job_id in d.name]
    
    for d in matching_dirs:
        repo_path = d / "repo"
        generated_tests_dir = d / "generated_tests"
        reports_dir = d / "reports"
        
        if generated_tests_dir.exists() and generated_tests_dir.is_dir():
            log.info("Workspace Recovery: Stage 1 Success - Found workspace matching job_id at %s", d)
            return d, repo_path, generated_tests_dir, reports_dir
        else:
            errors_tried.append(f"Directory {d} matches job_id but generated_tests subfolder does not exist")
            
    # Check alternate base paths like /workspace and current working directory
    for alt_base in [Path("/workspace"), Path.cwd()]:
        if alt_base.exists() and alt_base.is_dir():
            for sub in [alt_base / job_id, alt_base / "repos" / job_id]:
                if sub.exists() and sub.is_dir():
                    gen_dir = sub / "generated_tests"
                    if gen_dir.exists() and gen_dir.is_dir():
                        log.info("Workspace Recovery: Stage 1 Success - Found workspace at %s", sub)
                        return sub, sub / "repo", gen_dir, sub / "reports"
                    errors_tried.append(f"Directory {sub} matches job_id but generated_tests subfolder does not exist")

    # 2. Try stored repository path (Registry lookup)
    log.info("Workspace Recovery: Stage 2 - Looking up stored registry for job_id %s", job_id)
    registry_path = workspace_base / "job_registry.json"
    if registry_path.exists():
        try:
            with open(registry_path, "r") as f:
                registry = json.load(f)
            if job_id in registry:
                job_info = registry[job_id]
                stored_repo = Path(job_info.get("repo_path", ""))
                stored_root = Path(job_info.get("workspace_root", ""))
                stored_gen = Path(job_info.get("generated_tests_dir", ""))
                stored_reports = Path(job_info.get("reports_dir", ""))
                
                if stored_gen.exists() and stored_gen.is_dir():
                    log.info("Workspace Recovery: Stage 2 Success - Found paths in registry: workspace=%s", stored_root)
                    return stored_root, stored_repo, stored_gen, stored_reports
                else:
                    errors_tried.append(
                        f"Stored registry entry found with workspace {stored_root}, but generated_tests directory "
                        f"at {stored_gen} does not exist on filesystem"
                    )
            else:
                errors_tried.append(f"Job ID {job_id} not found in stored job registry JSON")
        except Exception as e:
            errors_tried.append(f"Failed to read stored job registry JSON at {registry_path}: {e}")
    else:
        errors_tried.append(f"Stored job registry JSON does not exist at {registry_path}")

    # 3. Try generated test output path directly
    log.info("Workspace Recovery: Stage 3 - Looking up generated test output paths directly")
    direct_candidates = [
        workspace_base / f"repo_{job_id}" / "generated_tests",
        workspace_base / job_id / "generated_tests",
        workspace_base / "generated_tests" / job_id,
        Path("/tmp/ecg_workspaces") / f"repo_{job_id}" / "generated_tests",
    ]
    for candidate in direct_candidates:
        if candidate.exists() and candidate.is_dir():
            parent = candidate.parent
            log.info("Workspace Recovery: Stage 3 Success - Found generated tests directory directly at %s", candidate)
            return parent, parent / "repo", candidate, parent / "reports"
        else:
            errors_tried.append(f"Direct candidate path {candidate} does not exist or is not a directory")

    # 4. Return a meaningful error if recovery fails
    detailed_msg = (
        f"Workspace recovery failed for Job ID '{job_id}'. We attempted several lookup methods:\n"
        + "\n".join(f"- {err}" for err in errors_tried)
        + "\n\nPlease ensure that the analysis job successfully finished and the shared volume mount (/tmp/ecg_workspaces) is active."
    )
    log.error("Workspace Recovery Failed for job %s: %s", job_id, detailed_msg)
    raise HTTPException(status_code=404, detail=detailed_msg)


@app.post("/ml/analyze")
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    try:
        # Register the job paths first for reliability
        register_job(req.job_id, req.repo_path)
        
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
    
    try:
        # Step 1-3: Recover workspace root, repo path and directories using robust recovery helper
        workspace_root, repo_path, generated_tests_dir, reports_dir = recover_workspace_paths(job_id)
        
        # Load generated test metadata from reports if available
        report_file = reports_dir / "report.json"
        tests = []
        files_parsed = 0
        functions_parsed = 0
        
        if report_file.exists():
            import json
            try:
                report_data = json.loads(report_file.read_text())
                tests = report_data.get("generated_tests", [])
                functions_parsed = report_data.get("functions_detected", 0)
                # Count unique files in generated tests as files parsed
                files_parsed = len({t.get("relative_source") or t.get("source_file") for t in tests if t.get("relative_source") or t.get("source_file")})
            except Exception as e:
                log.warning("Failed to read report file: %s", e)
        
        # If no report, scan generated_tests directory
        if not tests:
            log.info("No report found, creating archive from generated test files")
            # Create minimal test entries from files under generated_tests_dir
            for lang_dir in generated_tests_dir.iterdir():
                if lang_dir.is_dir():
                    # Scan for test files of all supported languages
                    for ext, lang in [("*.py", "python"), ("*.js", "javascript"), ("*.ts", "typescript"), ("*.java", "java")]:
                        for test_file in lang_dir.rglob(ext):
                            rel_src = str(test_file.relative_to(generated_tests_dir))
                            tests.append({
                                "function": test_file.stem,
                                "test_name": test_file.stem,
                                "language": lang,
                                "framework": "pytest" if lang == "python" else "jest" if lang in ("javascript", "typescript") else "junit",
                                "code": test_file.read_text(),
                                "relative_source": rel_src,
                                "source_file": str(test_file),
                            })
            files_parsed = len({t.get("relative_source") for t in tests if t.get("relative_source")})
            functions_parsed = len(tests)
        
        # Create ZIP archive
        zip_path = workspace_root / f"{job_id}_tests.zip"
        create_download_archive(
            tests=tests,
            output_path=zip_path,
            repo_path=repo_path,
            files_parsed=files_parsed,
            functions_parsed=functions_parsed,
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


@app.post("/api/download")
def download_tests_post(req: DownloadRequest):
    """Statelessly generate and download tests ZIP archive from a JSON payload."""
    import tempfile
    from pathlib import Path
    from test_generation.download_service import create_download_archive

    try:
        # Create ZIP archive in a temporary directory
        with tempfile.TemporaryDirectory() as tmp_dir:
            zip_path = Path(tmp_dir) / "test_archive.zip"
            
            # Since we are stateless, we don't have the original repo_path. Pass None.
            create_download_archive(
                tests=req.tests,
                output_path=zip_path,
                repo_path=None,
                files_parsed=req.files_parsed,
                functions_parsed=req.functions_parsed,
            )
            
            # Read ZIP into memory to return
            zip_content = zip_path.read_bytes()
            
        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=tests.zip"
            }
        )
    except Exception as exc:
        log.exception("Post download error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Download generation failed: {str(exc)}")
