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


def _generate_manifest(test_files: dict[str, str], repo_path: Path | None = None) -> dict[str, Any]:
    """Generate manifest mapping source files to test files."""
    generated_files = []
    for source, test_path in test_files.items():
        # Clean up absolute path for manifest if needed
        source_path = Path(source)
        if repo_path and source_path.is_absolute():
            try:
                source_rel = str(source_path.relative_to(repo_path))
            except ValueError:
                source_rel = source
        else:
            source_rel = source
        
        # Ensure path format is normalized with forward slashes (POSIX style)
        source_rel = Path(source_rel).as_posix()
        test_path_norm = Path(test_path).as_posix()
        
        generated_files.append({
            "source": source_rel,
            "test": test_path_norm
        })
        
    return {
        "generated_files": generated_files
    }


def _generate_summary(tests: list[GeneratedTest], files_parsed: int = 0, functions_parsed: int = 0) -> str:
    """Generate markdown summary of test generation."""
    tests_generated = len(tests)
    
    # Extract framework dynamically from tests
    frameworks = []
    for test in tests:
        fw = test.get("framework", "")
        if fw and fw not in frameworks:
            frameworks.append(fw.title())
    framework_str = "/".join(frameworks) if frameworks else "N/A"
    
    lines = [
        f"Files Parsed: {files_parsed}",
        f"Functions Parsed: {functions_parsed}",
        f"Tests Generated: {tests_generated}",
        f"Framework: {framework_str}",
        "",
        "# Test Generation Details",
        "",
        f"**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "",
        "## Statistics by Language",
    ]
    
    by_language = {}
    for test in tests:
        lang = test["language"]
        by_language[lang] = by_language.get(lang, 0) + 1
        
    for lang, count in sorted(by_language.items()):
        framework = next((t["framework"] for t in tests if t["language"] == lang), "N/A")
        lines.append(f"- {lang.title()}: {count} tests ({framework})")
        
    lines.extend([
        "",
        "## Usage",
        "",
        "Extract this archive into your project root.",
        "The tests are organized according to your project structure."
    ])
    return "\n".join(lines)


def create_download_archive(
    tests: list[GeneratedTest],
    output_path: Path,
    repo_path: Path | None = None,
    files_parsed: int = 0,
    functions_parsed: int = 0,
) -> Path:
    """
    Create a ZIP archive with structured test files.
    
    Args:
        tests: Generated test objects
        output_path: Where to save the ZIP file
        repo_path: Original repository path for relative path computation
        files_parsed: Number of files parsed (for summary)
        functions_parsed: Number of functions parsed (for summary)
    
    Returns:
        Path to created ZIP file
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Group tests by source and language
    by_source: dict[str, list[GeneratedTest]] = {}
    for test in tests:
        source_file = test.get("relative_source") or test.get("source_file") or f"{test['function']}.{test['language']}"
        by_source.setdefault(source_file, []).append(test)
    
    test_files: dict[str, str] = {}
    
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for source_file, source_tests in by_source.items():
            if not source_tests:
                continue
            
            language = source_tests[0]["language"]
            
            # Get relative source file path for mapper
            source_file_path = Path(source_file)
            if repo_path and source_file_path.is_absolute():
                try:
                    rel_source_file = str(source_file_path.relative_to(repo_path))
                except ValueError:
                    rel_source_file = source_file
            else:
                rel_source_file = source_file
                
            test_path = compute_test_path(rel_source_file, language)
            
            # Combine test code
            code_blocks = []
            for test in source_tests:
                code = test.get("code", "")
                if code and code not in code_blocks:
                    code_blocks.append(code)
            
            combined_code = "\n\n".join(code_blocks)
            
            # Add to ZIP preserving the structure
            archive_path = Path(test_path).as_posix()
            zf.writestr(archive_path, combined_code)
            test_files[source_file] = test_path
            
            log.debug("Added %s -> %s", source_file, archive_path)
        
        # Add manifest
        manifest = _generate_manifest(test_files, repo_path)
        zf.writestr("test_manifest.json", json.dumps(manifest, indent=2))
        
        # Add summary
        summary = _generate_summary(tests, files_parsed, functions_parsed)
        zf.writestr("generation_summary.md", summary)
    
    log.info("Created test archive at %s with %d test files", output_path, len(test_files))
    return output_path
