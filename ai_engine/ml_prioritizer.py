"""
Test Case Prioritizer utilizing scikit-learn Random Forest Classifier.
Trains on complexity, dependency count, risk, coverage, and similarity metrics.
Falls back to a robust feature weighting classifier if scikit-learn is not installed.
"""
from __future__ import annotations

import numpy as np

try:
    from sklearn.ensemble import RandomForestClassifier
    _SKLEARN_AVAILABLE = True
except ImportError:
    RandomForestClassifier = None
    _SKLEARN_AVAILABLE = False


class TestPrioritizer:
    """Prioritizes generated test cases using an ML model or feature weights."""

    def __init__(self):
        self.model = None
        if _SKLEARN_AVAILABLE and RandomForestClassifier is not None:
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self._train_initial_model()

    def _train_initial_model(self) -> None:
        """Train classifier on synthetic historical test case scenarios to establish weights."""
        if self.model is None:
            return
            
        # Features: [req_complexity, cyclomatic_complexity, dependency_count, risk_level, similarity_score, target_coverage]
        # Label: 0 = Low, 1 = Medium, 2 = High
        X_train = np.array([
            [100, 8, 5, 2, 0.9, 0.85], # High (Complexity + Risk)
            [80,  6, 3, 1, 0.8, 0.70], # High
            [30,  2, 1, 0, 0.5, 0.30], # Low (Simple code, low risk)
            [10,  1, 0, 0, 0.2, 0.10], # Low
            [50,  3, 2, 1, 0.6, 0.50], # Medium
            [60,  4, 2, 0, 0.7, 0.60], # Medium
            [120, 10, 8, 2, 0.95, 0.90],# High
            [20,  2, 1, 0, 0.3, 0.40], # Low
            [45,  3, 2, 1, 0.55, 0.55] # Medium
        ])
        y_train = np.array([2, 2, 0, 0, 1, 1, 2, 0, 1])
        self.model.fit(X_train, y_train)

    def prioritize(self, test_cases: list[dict]) -> list[dict]:
        """Predict priority (High, Medium, Low) for a list of test cases."""
        prioritized_cases = []
        for tc in test_cases:
            # Extract features
            req_complexity = len(tc.get("description", ""))
            cyclomatic_complexity = tc.get("complexity_score", 1)
            # Default dependency count: list count in test data
            dependency_count = len(tc.get("test_data", {}))
            
            risk_level = 0
            severity = tc.get("severity", "Minor").lower()
            if severity == "critical":
                risk_level = 2
            elif severity == "major":
                risk_level = 1
                
            similarity_score = tc.get("coverage", 0.5)  # proxy similarity
            target_coverage = 0.8 if tc.get("category") == "Boundary Value Analysis" else 0.5
            
            features = [
                req_complexity,
                cyclomatic_complexity,
                dependency_count,
                risk_level,
                similarity_score,
                target_coverage
            ]
            
            # Predict
            priority_label = "Medium"
            if self.model is not None:
                try:
                    pred = self.model.predict([features])[0]
                    priority_label = ["Low", "Medium", "High"][pred]
                except Exception:
                    priority_label = self._fallback_prioritize(features)
            else:
                priority_label = self._fallback_prioritize(features)
                
            # Update test case dict
            tc_copy = dict(tc)
            tc_copy["priority"] = priority_label
            prioritized_cases.append(tc_copy)
            
        return prioritized_cases

    def _fallback_prioritize(self, features: list[float]) -> str:
        """Fallback rule classifier based on calculated metric weights."""
        req_comp, cyclo, deps, risk, sim, cov = features
        # Score calculation
        score = (cyclo * 10) + (deps * 5) + (risk * 25) + (sim * 15) + (cov * 15) + (req_comp * 0.1)
        if score >= 65:
            return "High"
        if score >= 35:
            return "Medium"
        return "Low"
