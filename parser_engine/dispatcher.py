"""
Parser dispatcher — routes a file to the correct language parser.

To add a new language:
  1. Create parsers/<lang>_parser.py with a parse_<lang>_file(path) function.
  2. Register it in PARSER_REGISTRY below.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable

# Ensure both the repo root AND parser-engine dir are on sys.path
_HERE = Path(__file__).resolve().parent          # parser-engine/
_ROOT = _HERE.parent                             # repo root
for _p in (str(_ROOT), str(_HERE)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from shared.schemas.models import ParsedFileSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)


def _function_priority(function: dict) -> tuple[str, int]:
    name = str(function.get("name", ""))
    parameters = function.get("parameters", []) or []
    conditions = function.get("conditions", []) or []
    loops = int(function.get("loops", 0) or 0)
    returns = int(function.get("returns", 0) or 0)
    
    exceptions = function.get("exceptions", 0)
    if isinstance(exceptions, list):
        exceptions_count = len(exceptions)
    else:
        exceptions_count = int(exceptions or 0)
        
    complexity_score = int(function.get("complexity_score", 0) or 0)

    score = 0
    if name and not name.startswith("_"):
        score += 2
    if len(parameters) >= 2:
        score += 2
    elif len(parameters) == 1:
        score += 1
    if conditions:
        score += min(3, len(conditions))
    if loops:
        score += 2
    if exceptions_count:
        score += 2
    if returns > 1:
        score += 1
    if complexity_score >= 5:
        score += 2
    elif complexity_score >= 3:
        score += 1

    if score >= 7:
        return "high", score
    if score >= 3:
        return "medium", score
    return "low", score


def _should_skip_function(function: dict) -> bool:
    name = str(function.get("name", ""))
    if not name:
        log.info("Skipping unnamed function")
        return True
    if name.startswith("test_"):
        log.info("Skipping test function: %s", name)
        return True
    if name.startswith("__"):
        log.info("Skipping dunder function: %s", name)
        return True
    if name.startswith("_"):
        log.info("Skipping internal helper function: %s", name)
        return True
    _, score = _function_priority(function)
    if score < 3:
        log.info("Skipping trivial function: %s", name)
        return True
    return False


# ── lazy parser factories ─────────────────────────────────────────────────────
# Each factory is called once on first use; import errors are caught per-language.

def _get_python_parser() -> Callable:
    from parsers.python_adapter import parse_python_file
    return parse_python_file


def _get_js_parser() -> Callable:
    from parsers.js_ts_parser import parse_js_ts_file
    return lambda path: parse_js_ts_file(path, "javascript")


def _get_ts_parser() -> Callable:
    from parsers.js_ts_parser import parse_js_ts_file
    return lambda path: parse_js_ts_file(path, "typescript")


def _get_java_parser() -> Callable:
    from parsers.java_parser import parse_java_file
    return parse_java_file


def _get_cpp_parser() -> Callable:
    from parsers.cpp_parser import parse_cpp_file
    return parse_cpp_file


PARSER_REGISTRY: dict[str, Callable[[], Callable]] = {
    "python":     _get_python_parser,
    "javascript": _get_js_parser,
    "typescript": _get_ts_parser,
    "java":       _get_java_parser,
    "cpp":        _get_cpp_parser,
    "c":          _get_cpp_parser,
}


def parse_file(file_path: str, language: str) -> ParsedFileSchema | None:
    """
    Parse a single source file.
    Returns None (with a warning) if the language has no registered parser.
    """
    factory = PARSER_REGISTRY.get(language)
    if factory is None:
        log.warning("No parser registered for language '%s' — skipping %s", language, file_path)
        return None
    try:
        parser_fn = factory()
        parsed = parser_fn(file_path)
        if not parsed:
            return None

        functions = [fn for fn in parsed.get("functions", []) if not _should_skip_function(fn)]
        if len(functions) != len(parsed.get("functions", [])):
            log.info(
                "Filtered %d low-value functions from %s",
                len(parsed.get("functions", [])) - len(functions),
                file_path,
            )

        return ParsedFileSchema(
            source_file=parsed.get("source_file", file_path),
            language=parsed.get("language", language),
            function_count=len(functions),
            functions=functions,
        )
    except Exception as exc:
        log.error("Parser error for %s (%s): %s", file_path, language, exc)
        return None
