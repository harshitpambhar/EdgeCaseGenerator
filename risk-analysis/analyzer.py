"""
Risk analysis service wrapper.

Delegates to the existing risk-analysis-service/analyzer.py (unchanged)
and returns the canonical RiskAnalysisSchema.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# Add existing service to path so we can reuse it
_EXISTING = _ROOT / "risk-analysis-service"
if str(_EXISTING) not in sys.path:
    sys.path.insert(0, str(_EXISTING))

from analyzer import analyze_functions as _analyze  # existing, unchanged
from shared.schemas.models import ParsedFileSchema, RiskAnalysisSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)


def analyze_risk(parsed: ParsedFileSchema) -> RiskAnalysisSchema:
    """
    Run risk analysis on a parsed file.
    Returns RiskAnalysisSchema.
    """
    functions = parsed.get("functions", [])
    log.info("Analyzing risk for %d functions in %s", len(functions), parsed["source_file"])
    result = _analyze(functions)
    return RiskAnalysisSchema(functions=result.get("functions", []))
