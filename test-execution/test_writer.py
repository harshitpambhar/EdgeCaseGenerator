"""
Test file writer — persists generated test code to a temp workspace file.
"""
from __future__ import annotations

from pathlib import Path

from shared.schemas.models import GeneratedTest
from shared.utils.logger import get_logger

log = get_logger(__name__)

_EXTENSIONS = {
    "python":     ".py",
    "javascript": ".test.js",
    "typescript": ".test.ts",
    "java":       "Test.java",
}


def write_test_file(
    tests: list[GeneratedTest],
    work_dir: Path,
    language: str,
    file_stem: str = "generated_tests",
) -> Path:
    """
    Concatenate all test code blocks and write to a single file.
    Returns the path to the written file.
    """
    ext = _EXTENSIONS.get(language, ".txt")
    out_path = work_dir / f"{file_stem}{ext}"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Deduplicate identical code blocks
    seen: set[str] = set()
    blocks: list[str] = []
    for t in tests:
        code = t.get("code", "")
        if code and code not in seen:
            seen.add(code)
            blocks.append(code)

    out_path.write_text("\n".join(blocks), encoding="utf-8")
    log.info("Wrote %d test blocks to %s", len(blocks), out_path)
    return out_path
