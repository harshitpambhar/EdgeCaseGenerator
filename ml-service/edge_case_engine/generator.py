import re

from .rules import RULES


def generate_edge_cases(condition: str) -> list[int]:
    """Generate simple boundary cases for conditions like 'age > 18'."""
    pattern = r"^\s*[A-Za-z_][A-Za-z0-9_]*\s*(>=|<=|==|>|<)\s*(-?\d+)\s*$"
    match = re.match(pattern, condition)

    if not match:
        return []
    
    operator, raw_value = match.groups()
    value = int(raw_value)

    rule = RULES.get(operator)
    if rule is None:
        return []

    return rule(value)
