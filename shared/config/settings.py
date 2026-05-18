"""
Shared configuration — reads from environment variables with safe defaults.
All services import from here; no service hardcodes config values.
"""
import os
from pathlib import Path

# ── Workspace ────────────────────────────────────────────────────────────────
TEMP_WORKSPACE_ROOT: Path = Path(
    os.getenv("TEMP_WORKSPACE_ROOT", "/tmp/ecg_workspaces")
)

# ── Repository scanner ────────────────────────────────────────────────────────
IGNORED_DIRS: frozenset[str] = frozenset(
    os.getenv(
        "IGNORED_DIRS",
        "node_modules,venv,.venv,build,dist,.git,target,__pycache__,.pytest_cache",
    ).split(",")
)

MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(1 * 1024 * 1024)))  # 1 MB

# ── Test execution ────────────────────────────────────────────────────────────
TEST_EXECUTION_TIMEOUT: int = int(os.getenv("TEST_EXECUTION_TIMEOUT", "120"))

# ── Git ───────────────────────────────────────────────────────────────────────
GIT_CLONE_DEPTH: int = int(os.getenv("GIT_CLONE_DEPTH", "1"))
GIT_TIMEOUT: int = int(os.getenv("GIT_TIMEOUT", "120"))

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
