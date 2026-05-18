"""Proxy module so 'from edge_case_engine_ext.rules import ...' works."""
from edge_case_engine_ext import (  # noqa: F401
    BOOLEAN_EDGE_CASES,
    COLLECTION_EDGE_CASES,
    EXTENDED_RULES,
    STRING_EDGE_CASES,
    TYPE_CONFUSION_CASES,
)
