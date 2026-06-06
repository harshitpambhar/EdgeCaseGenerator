"""
Download service - creates structured ZIP archives of generated tests.
"""
from __future__ import annotations

import json
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any

from shared.schemas.models import GeneratedTest
from shared.utils.logger import get_logger
from .structure_mapper import compute_test_path

log = get_logger(__name__)


def _group_tests_by_source(tests: list[GeneratedTest]) -> dict[str, list[GeneratedTest]]:
    """Group tests by their source file."""
    grouped: dict[str, list[GeneratedTest]] = {}
    for test in tests:
        source = test.get("function", "unknown")
        # Extract source file from metadata if available
        source_file = test.get("source_file", f"{source}.{test['language']}")
        grouped.setdefault(source_file, []).append(test)
    return grouped


def _generate_manifest(test_files: dict[str, str]) -> dict[str, Any]:
    """Generate manifest mapping source files to test files."""
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_test_files": len(test_files),
        "files": [
            {"source": source, "test": test_path}
            for source, test_path in test_files.items()
        ]
    }


def _generate_summary(tests: list[GeneratedTest], files_parsed: int = 0) -> str:
    """Generate markdown summary of test generation."""
    functions = {t["function"] for t in tests}
    by_language = {}
    for test in tests:
        lang = test["language"]
        by_language[lang] = by_language.get(lang, 0) + 1
    
    lines = [
        "# Test Generation Summary",
        "",
        f"**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "",
        "## Statistics",
        f"- Files Analyzed: {files_parsed}",
        f"- Functions: {len(functions)}",
        f"- Tests Generated: {len(tests)}",
        "",
        "## By Language",
    ]
    for lang, count in sorted(by_language.items()):
        framework = next((t["framework"] for t in tests if t["language"] == lang), "N/A")
        lines.append(f"- {lang.title()}: {count} tests ({framework})")
    
    lines.extend(["", "## Usage", "", "Extract this archive into your project root.", "", "The tests are organized according to your project structure."])
    return "\n".join(lines)


def create_download_archive(
    tests: list[GeneratedTest],
    output_path: Path,
    repo_path: Path | None = None,
    files_parsed: int = 0,
) -> Path:
    """
    Create a ZIP archive with structured test files.
    
    Args:
        tests: Generated test objects
        output_path: Where to save the ZIP file
        repo_path: Original repository path for relative path computation
        files_parsed: Number of files parsed (for summary)
    
    Returns:
        Path to created ZIP file
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Group tests by source and language
    by_source: dict[str, list[GeneratedTest]] = {}
    for test in tests:
        source_file = test.get("source_file") or f"{test['function']}.{test['language']}"
        by_source.setdefault(source_file, []).append(test)
    
    test_files: dict[str, str] = {}
    
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for source_file, source_tests in by_source.items():
            if not source_tests:
                continue
            
            language = source_tests[0]["language"]
            test_path = compute_test_path(source_file, language)
            
            # Combine test code
            code_blocks = []
            for test in source_tests:
                code = test.get("code", "")
                if code and code not in code_blocks:
                    code_blocks.append(code)
            
            combined_code = "\n\n".join(code_blocks)
            
            # Add to ZIP under generated_tests/
            archive_path = f"generated_tests/{test_path}"
            zf.writestr(archive_path, combined_code)
            test_files[source_file] = test_path
            
            log.debug("Added %s -> %s", source_file, archive_path)
        
        # Add manifest
        manifest = _generate_manifest(test_files)
        zf.writestr("test_manifest.json", json.dumps(manifest, indent=2))
        
        # Add summary
        summary = _generate_summary(tests, files_parsed)
        zf.writestr("generation_summary.md", summary)
    
    log.info("Created test archive at %s with %d test files", output_path, len(test_files))
    return output_path
