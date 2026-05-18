"""Re-exports from edge-case-engine/rules.py as an importable package."""
from pathlib import Path
import sys

_RULES_DIR = Path(__file__).resolve().parent.parent / "edge-case-engine"
if str(_RULES_DIR) not in sys.path:
    sys.path.insert(0, str(_RULES_DIR))

from rules import (  # noqa: F401
    BOOLEAN_EDGE_CASES,
    COLLECTION_EDGE_CASES,
    EXTENDED_RULES,
    STRING_EDGE_CASES,
    TYPE_CONFUSION_CASES,
)
