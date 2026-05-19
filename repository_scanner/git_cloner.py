"""
Git clone helper — shallow clone into a temp workspace.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.config.settings import GIT_CLONE_DEPTH, GIT_TIMEOUT
from shared.utils.logger import get_logger

log = get_logger(__name__)


def clone_repository(repo_url: str, target_dir: Path) -> Path:
    """
    Shallow-clone *repo_url* into *target_dir*.
    Returns the cloned directory path.
    Raises RuntimeError on failure.
    
    Note: target_dir should not exist yet. git clone will create it.
    """
    # Ensure parent directory exists but not the target
    target_dir.parent.mkdir(parents=True, exist_ok=True)
    
    # Remove target_dir if it already exists
    if target_dir.exists():
        shutil.rmtree(target_dir)
    
    cmd = [
        "git", "clone",
        "--depth", str(GIT_CLONE_DEPTH),
        "--single-branch",
        repo_url,
        str(target_dir),
    ]
    log.info("Cloning %s → %s", repo_url, target_dir)
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=GIT_TIMEOUT,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"git clone failed (exit {result.returncode}):\n{result.stderr}"
        )
    log.info("Clone complete: %s", target_dir)
    return target_dir
