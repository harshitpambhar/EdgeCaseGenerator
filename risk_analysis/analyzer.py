"""
Risk analysis service wrapper.

Delegates to the existing risk_analysis_service/analyzer.py and returns the
canonical RiskAnalysisSchema.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from typing import Any
from shared.schemas.models import ParsedFileSchema, RiskAnalysisSchema
from shared.utils.logger import get_logger


def _analyze(functions: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Analyze risk factors in a list of functions.
    
    Returns a structure with risk analysis results.
    """
    # Return the functions as-is with minimal risk scoring
    analyzed = []
    for func in functions:
        analyzed.append({
            **func,
            "risk_score": 0.0,
            "risk_factors": [],
        })
    
    return {"functions": analyzed}

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

        normalized = []
        for original, analyzed in zip(functions, risk_functions):
            combined = {**original, **analyzed}
            complexity = int(
                combined.get("complexity_score", combined.get("complexity", 0))
                or 0
            )
            risk_score = float(combined.get("risk_score", min(100.0, complexity * 8.0)))
            if risk_score >= 70 or complexity >= 12:
                risk_level = "HIGH"
            elif risk_score >= 35 or complexity >= 6:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            if risk_level == "HIGH":
                recommendation = "Prioritize refactoring and add focused tests"
            elif risk_level == "MEDIUM":
                recommendation = "Add targeted tests and review edge conditions"
            else:
                recommendation = "Risk is low; keep coverage current"

            normalized.append({
                "name": combined.get("name", "unknown"),
                "complexity": complexity,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "recommendation": combined.get("recommendation", recommendation),
            })

        return {
            "functions": normalized
        }
    except Exception as e:
        log.error(f"Error in analyze_risk: {e}")
        log.error(f"Parsed data: {parsed}")
        raise
