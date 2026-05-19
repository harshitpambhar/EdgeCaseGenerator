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
        return parser_fn(file_path)
    except Exception as exc:
        log.error("Parser error for %s (%s): %s", file_path, language, exc)
        return None
