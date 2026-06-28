"""
Shared configuration settings for all services.
Loads from environment variables with sensible defaults.
"""
import os
from pathlib import Path

# Execution Timeouts
TEST_EXECUTION_TIMEOUT = int(os.getenv("TEST_EXECUTION_TIMEOUT", "120"))  # seconds
GIT_TIMEOUT = int(os.getenv("GIT_TIMEOUT", "300"))  # seconds

# Git Configuration
GIT_CLONE_DEPTH = int(os.getenv("GIT_CLONE_DEPTH", "1"))

# File Size Limits
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_BYTES", "1048576"))  # 1MB

# Directories to Ignore During Scanning
IGNORED_DIRS = [
    ".git", ".svn", ".hg",
    "node_modules", "__pycache__", ".pytest_cache", ".venv", "venv", "env",
    ".idea", ".vscode", ".DS_Store",
    "dist", "build", "*.egg-info",
    "target", "out", ".gradle",
]

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
