"""
Risk analysis service wrapper.

Delegates to the existing risk-analysis-service/analyzer.py (unchanged)
and returns the canonical RiskAnalysisSchema.
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# Load existing service analyzer using direct file path to avoid circular imports
_existing_analyzer_path = _ROOT / "risk-analysis-service" / "analyzer.py"
if _existing_analyzer_path.exists():
    _spec = importlib.util.spec_from_file_location(
        "_risk_analysis_service_analyzer", _existing_analyzer_path
    )
    if _spec and _spec.loader:
        _analyzer_module = importlib.util.module_from_spec(_spec)
        _spec.loader.exec_module(_analyzer_module)
        _analyze = _analyzer_module.analyze_functions
    else:
        # Fallback if spec fails
        def _analyze(functions):
            return {"functions": functions}
else:
    # Fallback if service doesn't exist
    def _analyze(functions):
        return {"functions": functions}

from shared.schemas.models import ParsedFileSchema, RiskAnalysisSchema
from shared.utils.logger import get_logger

log = get_logger(__name__)


def analyze_risk(parsed: ParsedFileSchema) -> RiskAnalysisSchema:
    """
    Run risk analysis on a parsed file.
    Returns RiskAnalysisSchema.
    """
    try:
        functions = parsed.get("functions", [])
        log.info("Analyzing risk for %d functions in %s", len(functions), parsed.get("source_file", "unknown"))
        
        if not isinstance(functions, list):
            log.error(f"Expected functions to be list, got {type(functions)}")
            functions = []
        
        result = _analyze(functions)
        
        risk_functions = result.get("functions", [])
        if not isinstance(risk_functions, list):
            log.error(f"Expected result['functions'] to be list, got {type(risk_functions)}")
            risk_functions = []
        
        return {
            "functions": risk_functions
        }
    except Exception as e:
        log.error(f"Error in analyze_risk: {e}")
        log.error(f"Parsed data: {parsed}")
        raise
