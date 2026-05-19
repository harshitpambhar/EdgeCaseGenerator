"""
Extended edge-case rules.

Each rule is a callable: (value) → list[Any]
Rules are keyed by operator string.

The existing ml-service/edge_case_engine/rules.py is NOT modified.
This module extends it with richer value sets.
"""
from __future__ import annotations
from typing import Any


# ── numeric boundary ──────────────────────────────────────────────────────────

def _boundary(value: int) -> list[Any]:
    return [
        value - 1, value, value + 1,
        0, -1, None,
        2**31 - 1, -(2**31),   # int32 overflow
        2**63 - 1, -(2**63),   # int64 overflow
        float("inf"), float("-inf"),
    ]


# ── string edge cases ─────────────────────────────────────────────────────────

STRING_EDGE_CASES: list[Any] = [
    "",
    None,
    " ",
    "a" * 10_000,          # very long string
    "\x00",                # null byte
    "<script>alert(1)</script>",  # XSS probe
    "'; DROP TABLE users;--",     # SQL injection probe
    "🔥",                  # unicode emoji
]

# ── boolean combinations ──────────────────────────────────────────────────────

BOOLEAN_EDGE_CASES: list[Any] = [True, False, None, 0, 1, "", "true", "false"]

# ── collection edge cases ─────────────────────────────────────────────────────

COLLECTION_EDGE_CASES: list[Any] = [
    [],
    None,
    [None],
    [0],
    list(range(10_000)),   # large list
]

# ── type confusion ────────────────────────────────────────────────────────────

TYPE_CONFUSION_CASES: list[Any] = [
    None, "", 0, False, [], {}, object(),
]

# ── operator → rule map ───────────────────────────────────────────────────────

EXTENDED_RULES: dict[str, Any] = {
    ">":  _boundary,
    "<":  _boundary,
    ">=": _boundary,
    "<=": _boundary,
    "==": _boundary,
    "!=": _boundary,
}
