"""
Test generation dispatcher.

Maps language → (framework, generator_callable).
To add a new language/framework, register it in GENERATOR_REGISTRY.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable

_HERE = Path(__file__).resolve().parent   # test-generation/
_ROOT = _HERE.parent
for _p in (str(_ROOT), str(_HERE)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from shared.schemas.models import EdgeCaseSchema, GeneratedTest
from shared.utils.logger import get_logger

log = get_logger(__name__)

# language → (framework, generator_callable)
GENERATOR_REGISTRY: dict[str, tuple[str, Callable]] = {}


def _register_defaults() -> None:
    from generators.pytest_generator import generate_pytest_tests
    from generators.jest_generator import generate_jest_tests
    from generators.junit_generator import generate_junit_tests

    GENERATOR_REGISTRY["python"]     = ("pytest", generate_pytest_tests)
    GENERATOR_REGISTRY["javascript"] = ("jest",   generate_jest_tests)
    GENERATOR_REGISTRY["typescript"] = ("jest",   generate_jest_tests)
    GENERATOR_REGISTRY["java"]       = ("junit",  generate_junit_tests)


_register_defaults()


def generate_tests(
    edge_cases: EdgeCaseSchema,
    language: str,
    **kwargs,
) -> list[GeneratedTest]:
    """
    Generate tests for the given language.
    Extra kwargs are forwarded to the language-specific generator.
    """
    entry = GENERATOR_REGISTRY.get(language)
    if entry is None:
        log.warning("No test generator for language '%s'", language)
        return []
    framework, generator_fn = entry
    log.info(
        "Generating %s tests (%s) for %s",
        framework, language, edge_cases["source_file"],
    )
    try:
        return generator_fn(edge_cases, **kwargs)
    except Exception as exc:
        log.error("Test generation failed for %s: %s", language, exc)
        return []
