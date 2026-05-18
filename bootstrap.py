"""
Path bootstrap — call bootstrap() once at process start to make all
hyphenated service directories importable under their underscore aliases.

Usage (in any entry-point or orchestrator):
    from bootstrap import bootstrap
    bootstrap()
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent

_SERVICE_DIRS = [
    "shared",
    "repository-scanner",
    "parser-engine",
    "edge-case-engine",
    "test-generation",
    "test-execution",
    "coverage-analysis",
    "risk-analysis",
    "report-generator",
    "orchestrator",
    # existing services (unchanged)
    "ml-service",
    "risk-analysis-service",
    "coverage-analysis-service",
]


def bootstrap() -> None:
    for service in _SERVICE_DIRS:
        p = str(_ROOT / service)
        if p not in sys.path:
            sys.path.insert(0, p)
