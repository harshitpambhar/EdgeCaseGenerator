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
        source_file: Relative path to source file from repo root
        language: Programming language (python, javascript, typescript, java)
    
    Returns:
        Relative path where the test should be placed
    """
    source_path = Path(source_file)
    
    # Extract relative path components (using forward slashes/POSIX mapping)
    parts = list(source_path.parts)
    stem = source_path.stem
    
    if language == "python":
        # app/auth/login.py -> tests/auth/test_login.py
        # Replace the first component (like 'app' or 'src' or 'source') with 'tests', or prepend 'tests'
        if parts:
            if parts[0] in ("app", "src", "source"):
                new_parts = ["tests"] + parts[1:-1]
            else:
                new_parts = ["tests"] + parts[:-1]
        else:
            new_parts = ["tests"]
        return (Path(*new_parts) / f"test_{stem}.py").as_posix()
    
    elif language in ("javascript", "typescript"):
        # src/auth/login.js -> src/auth/tests/login.test.js
        ext = ".test.ts" if language == "typescript" else ".test.js"
        # If parts is empty, just default to tests/
        if parts:
            return (Path(*parts[:-1]) / "tests" / f"{stem}{ext}").as_posix()
        return (Path("tests") / f"{stem}{ext}").as_posix()
    
    elif language == "java":
        # src/main/java/com/company/UserService.java -> src/test/java/com/company/UserServiceTest.java
        source_str = "/".join(parts)
        if "src/main/java/" in source_str:
            # Reconstruct path substituting 'main' with 'test'
            test_parts = [p.replace("main", "test") if p == "main" else p for p in parts]
            return (Path(*test_parts[:-1]) / f"{stem}Test.java").as_posix()
        elif "src/test/java/" in source_str:
            return (Path(*parts[:-1]) / f"{stem}Test.java").as_posix()
        
        # If not standard src/main/java structure, try to preserve package structure
        return (Path(*parts[:-1]) / f"{stem}Test.java").as_posix()
    
    # Default: same directory with test_ prefix
    if parts:
        return (Path(*parts[:-1]) / f"test_{stem}{source_path.suffix}").as_posix()
    return (Path(f"test_{stem}{source_path.suffix}")).as_posix()
