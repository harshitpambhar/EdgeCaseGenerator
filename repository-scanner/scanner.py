"""
Recursive repository scanner.

- Streams files one at a time (generator) — never loads the whole repo.
- Skips ignored directories and oversized files.
- Returns ScanResult with language breakdown.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Generator

# Allow running standalone or imported
_HERE = Path(__file__).resolve().parent
_ROOT = _HERE.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.config.settings import IGNORED_DIRS, MAX_FILE_SIZE_BYTES
from shared.schemas.models import ScannedFile, ScanResult
from shared.utils.logger import get_logger

from language_detector import detect_language

log = get_logger(__name__)


def _iter_files(repo_path: Path) -> Generator[Path, None, None]:
    """Yield every non-ignored, non-oversized file under repo_path."""
    for root, dirs, files in os.walk(repo_path):
        # Prune ignored dirs in-place so os.walk won't descend into them
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        for fname in files:
            fpath = Path(root) / fname
            try:
                if fpath.stat().st_size <= MAX_FILE_SIZE_BYTES:
                    yield fpath
            except OSError:
                continue


def scan_repository(repo_path: str | Path) -> ScanResult:
    """
    Recursively scan a repository and return a ScanResult.
    Files are streamed — the full repo is never held in memory.
    """
    repo = Path(repo_path).resolve()
    if not repo.is_dir():
        raise ValueError(f"Repository path does not exist: {repo}")

    files: list[ScannedFile] = []
    lang_set: set[str] = set()

    for fpath in _iter_files(repo):
        lang = detect_language(str(fpath))
        if lang is None:
            continue  # skip non-source files

        lang_set.add(lang)
        files.append(
            ScannedFile(
                path=str(fpath),
                relative_path=str(fpath.relative_to(repo)),
                language=lang,
                size_bytes=fpath.stat().st_size,
            )
        )

    log.info(
        "Scanned %d source files across %d languages in %s",
        len(files),
        len(lang_set),
        repo,
    )

    return ScanResult(
        repo_path=str(repo),
        total_files=len(files),
        languages_detected=sorted(lang_set),
        files=files,
    )
