"""
Stub edge case generator from ML service.

This is a minimal implementation for boundary value generation.
The actual ml-service is not part of this repo, but this provides
the necessary interface for edge-case-engine to import from.
"""
from typing import Any


def generate_edge_cases(value: Any) -> list[Any]:
    """
    Generate boundary edge cases for a given value.
    
    For numeric values, generates boundary conditions (min, max, etc).
    For other types, returns a minimal set of edge cases.
    """
    try:
        # Try to parse as numeric
        num = int(value) if isinstance(value, (int, str)) else float(value)
        return [
            num - 1, num, num + 1,
            0, -1, None,
            2**31 - 1, -(2**31),     # int32 overflow
            2**63 - 1, -(2**63),     # int64 overflow
            float("inf"), float("-inf"),
        ]
    except (ValueError, TypeError):
        # Non-numeric fallback
        return [None, "", 0, False, [], {}]
