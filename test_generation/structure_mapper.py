"""
Structure mapper - maps source files to test file paths preserving hierarchy.
"""
from __future__ import annotations

from pathlib import Path

from shared.utils.logger import get_logger

log = get_logger(__name__)


def compute_test_path(source_file: str, language: str) -> str:
    """
    Compute the test file path for a source file, preserving directory structure.
    
    Args:
        source_file: Absolute or relative path to source file
        language: Programming language (python, javascript, typescript, java)
    
    Returns:
        Relative path where the test should be placed
    """
    source_path = Path(source_file)
    
    # Extract relative path components
    parts = list(source_path.parts)
    stem = source_path.stem
    
    if language == "python":
        # app/auth/login.py -> tests/auth/test_login.py
        return str(Path(*parts[:-1]) / f"test_{stem}.py")
    
    elif language in ("javascript", "typescript"):
        # src/auth/login.js -> src/auth/tests/login.test.js
        ext = ".test.ts" if language == "typescript" else ".test.js"
        return str(Path(*parts[:-1]) / "tests" / f"{stem}{ext}")
    
    elif language == "java":
        # src/main/java/com/company/UserService.java
        # -> src/test/java/com/company/UserServiceTest.java
        if "src/main/java" in str(source_path):
            test_parts = [p.replace("main", "test") if p == "main" else p for p in parts]
            return str(Path(*test_parts[:-1]) / f"{stem}Test.java")
        return str(Path(*parts[:-1]) / f"{stem}Test.java")
    
    # Default: same directory with test_ prefix
    return str(Path(*parts[:-1]) / f"test_{stem}{source_path.suffix}")
