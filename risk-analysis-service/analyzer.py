from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class RiskResult:
    name: str
    complexity: int
    risk_score: float
    risk_level: str
    recommendation: str


def _pick_recommendation(metrics: Dict[str, Any], risk_level: str) -> str:
    condition_count = len(metrics.get("conditions", []) or [])
    if condition_count >= 3 or metrics.get("complexity_score", 0) >= 6:
        return "Needs additional boundary tests"
    if metrics.get("exceptions", 0) > 0:
        return "Add negative-path and exception handling tests"
    if metrics.get("loops", 0) > 0:
        return "Add loop coverage and edge iteration tests"
    if risk_level == "HIGH":
        return "Prioritize manual review and expand test coverage"
    if risk_level == "MEDIUM":
        return "Add targeted regression tests"
    return "Basic smoke coverage is sufficient for now"


def _risk_level_from_score(score: float) -> str:
    if score <= 0.33:
        return "LOW"
    if score <= 0.66:
        return "MEDIUM"
    return "HIGH"


def score_function(function_info: Dict[str, Any]) -> RiskResult:
    complexity = int(function_info.get("complexity_score", 0) or 0)
    conditions = len(function_info.get("conditions", []) or [])
    loops = int(function_info.get("loops", 0) or 0)
    exceptions = int(function_info.get("exceptions", 0) or 0)
    returns = int(function_info.get("returns", 0) or 0)

    weighted_score = (
        complexity * 0.35
        + conditions * 0.20
        + loops * 0.15
        + exceptions * 0.20
        + max(returns - 1, 0) * 0.10
    )
    risk_score = min(weighted_score / 10.0, 1.0)
    risk_level = _risk_level_from_score(risk_score)
    recommendation = _pick_recommendation(function_info, risk_level)

    return RiskResult(
        name=function_info.get("name", "unknown"),
        complexity=complexity,
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        recommendation=recommendation,
    )


def analyze_functions(functions: List[Dict[str, Any]]) -> Dict[str, Any]:
    results = [score_function(function_info) for function_info in functions]
    return {
        "functions": [
            {
                "name": result.name,
                "complexity": result.complexity,
                "risk_score": result.risk_score,
                "risk_level": result.risk_level,
                "recommendation": result.recommendation,
            }
            for result in results
        ]
    }
