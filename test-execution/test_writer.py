"""
Test file writer.

Writes one test file per source file, mirroring the uploaded project structure:

  src/auth/login.py        →  <work_dir>/src/auth/test_login.py
  src/utils/helpers.js     →  <work_dir>/src/utils/helpers.test.js
  com/example/Calc.java    →  <work_dir>/com/example/CalcTest.java

Falls back to a single flat file when a test has no source_file stamp.
"""
from __future__ import annotations

import zipfile
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

_TEST_PREFIX = {
    "python":     "test_",
    "javascript": "",
    "typescript": "",
    "java":       "",
}


def _test_filename(source_stem: str, language: str) -> str:
    ext = _EXTENSIONS.get(language, ".txt")
    prefix = _TEST_PREFIX.get(language, "test_")
    if language == "java":
        return f"{source_stem}Test.java"
    return f"{prefix}{source_stem}{ext}"


def _group_by_source(tests: list[GeneratedTest]) -> dict[str, list[GeneratedTest]]:
    """Group tests by their relative_source path.  Falls back to '__flat__'."""
    groups: dict[str, list[GeneratedTest]] = {}
    for t in tests:
        key = t.get("relative_source") or "__flat__"
        groups.setdefault(key, []).append(t)
    return groups


def write_test_file(
    tests: list[GeneratedTest],
    work_dir: Path,
    language: str,
    file_stem: str = "generated_tests",
) -> Path:
    """
    Write one test file per source file under work_dir, preserving directory
    structure.  Returns work_dir (the root of all written files) so the
    runner and zip builder know where to look.
    """
    work_dir = Path(work_dir)
    groups = _group_by_source(tests)
    written: list[Path] = []

    for relative_source, group_tests in groups.items():
        # Deduplicate code blocks within this group
        seen: set[str] = set()
        blocks: list[str] = []
        for t in group_tests:
            code = t.get("code", "")
            if code and code not in seen:
                seen.add(code)
                blocks.append(code)

        if not blocks:
            continue

        if relative_source == "__flat__":
            # No source info — write the old flat file as fallback
            ext = _EXTENSIONS.get(language, ".txt")
            out_path = work_dir / f"{file_stem}{ext}"
        else:
            src_path = Path(relative_source)
            test_name = _test_filename(src_path.stem, language)
            # Mirror the directory structure inside work_dir
            out_path = work_dir / src_path.parent / test_name

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text("\n".join(blocks), encoding="utf-8")
        log.info(
            "Wrote %d test blocks to %s  (source: %s)",
            len(blocks), out_path, relative_source,
        )
        written.append(out_path)

    if not written:
        # nothing to write — return a dummy path the runner will skip
        log.warning("No test blocks written for language=%s", language)
        return work_dir

    log.info("Total test files written: %d under %s", len(written), work_dir)
    return work_dir


def build_zip(tests_root: Path, zip_path: Path) -> Path:
    """
    Zip the entire tests_root directory into zip_path, preserving internal
    paths so the downloaded archive exactly mirrors the project structure.
    Returns zip_path.
    """
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in sorted(tests_root.rglob("*")):
            if file.is_file():
                arcname = file.relative_to(tests_root)
                zf.write(file, arcname)
                log.debug("Zipped %s → %s", file, arcname)
    log.info("ZIP created: %s  (%d bytes)", zip_path, zip_path.stat().st_size)
    return zip_path
