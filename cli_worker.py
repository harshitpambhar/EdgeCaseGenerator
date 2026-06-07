"""
Standalone CLI worker designed to be executed inside a short-lived Docker container.
It clones a given GitHub repository to a temporary directory, runs the Python orchestration
pipeline against it, and outputs the structured JSON response bounded by specific markers
so the Java backend can reliably extract it from standard output.
"""
import sys
import json
import subprocess
import tempfile
import os
import shutil
import logging
from pathlib import Path

# Setup basic logging to stdout so it gets captured by the docker logs
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("cli_worker")

# Ensure the root directory is in sys.path
_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from bootstrap import bootstrap

def main():
    if len(sys.argv) < 3:
        log.error("Usage: python cli_worker.py <job_id> <repo_url>")
        sys.exit(1)
    
    job_id = sys.argv[1]
    repo_url = sys.argv[2]
    
    log.info(f"Starting worker for job {job_id} and repo {repo_url}")
    
    # Initialize the system paths and environment
    bootstrap()
    
    # Import the pipeline after bootstrapping
    from orchestrator.pipeline import run_pipeline
    
    # Use the environment variable for workspace root if provided, otherwise fallback to /tmp
    base_tmp = os.environ.get("TEMP_WORKSPACE_ROOT", "/tmp/ecg_workspaces")
    os.makedirs(base_tmp, exist_ok=True)
    
    temp_dir = tempfile.mkdtemp(prefix=f"repo_{job_id}_", dir=base_tmp)
    try:
        log.info(f"Cloning {repo_url} into {temp_dir}")
        # Clone into a 'repo' subdirectory so git never complains about
        # an already-existing target directory (mkdtemp creates the parent).
        repo_dir = os.path.join(temp_dir, "repo")
        result = subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, repo_dir],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            log.error("git clone failed (exit %d):\nSTDOUT: %s\nSTDERR: %s",
                      result.returncode, result.stdout, result.stderr)
            raise RuntimeError(
                f"git clone failed for {repo_url}: {result.stderr.strip() or result.stdout.strip()}"
            )
        
        log.info("Running pipeline analysis...")
        result = run_pipeline(
            job_id=job_id,
            repo_path=repo_dir,
            run_tests=True,
            run_coverage_flag=True
        )
        
        
        # Ensure we output valid JSON string
        print("---RESULT_JSON_START---")
        print(json.dumps(result))
        print("---RESULT_JSON_END---")
        
    except Exception as e:
        log.error(f"Worker failed: {e}", exc_info=True)
        sys.exit(1)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main()
