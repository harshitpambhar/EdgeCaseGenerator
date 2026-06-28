"""
Requirement Parser utilizing spaCy for NLP analysis and constraint extraction.
Falls back to regex-based rule analysis if spaCy model is unavailable.
"""
from __future__ import annotations

import re
from typing import TypedDict, Any

try:
    import spacy
    # Load small English model
    try:
        nlp = spacy.load("en_core_web_sm")
        _SPACY_AVAILABLE = True
    except OSError:
        # Try to download if missing? Usually, we shouldn't block, so we fallback
        _SPACY_AVAILABLE = False
except ImportError:
    _SPACY_AVAILABLE = False


class ExtractedConstraint(TypedDict):
    entity: str
    attribute: str
    operator: str  # >=, <=, ==, !=, >, <, contains, match
    value: Any
    action: str


def parse_requirement_with_spacy(text: str) -> list[ExtractedConstraint]:
    """Parse requirement text using spaCy dependency graph and POS tags."""
    if not _SPACY_AVAILABLE:
        return []

    doc = nlp(text)
    constraints: list[ExtractedConstraint] = []
    
    # Simple dependency-based constraint extraction
    # E.g., "The password should contain at least 8 characters."
    # Find nouns as entities/attributes
    entities = [ent.text for ent in doc.ents]
    nouns = [token.text for token in doc if token.pos_ in ("NOUN", "PROPN")]
    verbs = [token.text for token in doc if token.pos_ == "VERB"]
    
    entity = nouns[0] if nouns else "Input"
    attribute = nouns[1] if len(nouns) > 1 else "Value"
    action = verbs[0] if verbs else "Validate"
    
    # Try to find numeric constraints (like "8", "100")
    numbers = [token.text for token in doc if token.pos_ == "NUM"]
    
    if numbers:
        val = int(numbers[0]) if numbers[0].isdigit() else numbers[0]
        # Look for operators around numbers
        operator = "=="
        text_lower = text.lower()
        if "at least" in text_lower or "greater than or equal" in text_lower or "minimum" in text_lower:
            operator = ">="
        elif "at most" in text_lower or "less than or equal" in text_lower or "maximum" in text_lower:
            operator = "<="
        elif "greater than" in text_lower or "more than" in text_lower:
            operator = ">"
        elif "less than" in text_lower:
            operator = "<"
            
        constraints.append({
            "entity": entity,
            "attribute": attribute,
            "operator": operator,
            "value": val,
            "action": action
        })
    else:
        # Non-numeric constraints (e.g. contains special characters, regex rules)
        if "contain" in [v.lower() for v in verbs]:
            constraints.append({
                "entity": entity,
                "attribute": attribute,
                "operator": "contains",
                "value": "special characters" if "special" in text_lower else "required",
                "action": action
            })
            
    return constraints


def parse_requirement_regex(text: str) -> list[ExtractedConstraint]:
    """Fallback regex-based rule constraint extraction."""
    constraints: list[ExtractedConstraint] = []
    text_lower = text.lower()
    
    # Match patterns like: "password ... at least 8 characters"
    # Find main noun/subject
    entity = "Value"
    for word in ["password", "username", "email", "age", "input", "amount", "price", "score", "file", "token"]:
        if word in text_lower:
            entity = word.capitalize()
            break
            
    # Extract numerical boundary limits
    num_match = re.search(r"\b(\d+)\b", text)
    if num_match:
        val = int(num_match.group(1))
        attribute = "Length" if "character" in text_lower or "length" in text_lower or "size" in text_lower else "Value"
        
        operator = "=="
        if any(op in text_lower for op in ["at least", "greater than or equal", "minimum", "min", ">="]):
            operator = ">="
        elif any(op in text_lower for op in ["at most", "less than or equal", "maximum", "max", "<="]):
            operator = "<="
        elif any(op in text_lower for op in ["greater than", "more than", "above", ">"]):
            operator = ">"
        elif any(op in text_lower for op in ["less than", "below", "<"]):
            operator = "<"
            
        constraints.append({
            "entity": entity,
            "attribute": attribute,
            "operator": operator,
            "value": val,
            "action": "Validate"
        })
    else:
        # Check for string formatting constraints
        attribute = "Format"
        if "email" in text_lower:
            constraints.append({
                "entity": "Email",
                "attribute": "Format",
                "operator": "match",
                "value": r"^[\w\.-]+@[\w\.-]+\.\w+$",
                "action": "Validate"
            })
        elif "alphanumeric" in text_lower:
            constraints.append({
                "entity": entity,
                "attribute": "Format",
                "operator": "match",
                "value": r"^[a-zA-Z0-9]+$",
                "action": "Validate"
            })
        else:
            constraints.append({
                "entity": entity,
                "attribute": "Value",
                "operator": "contains" if "contain" in text_lower else "==",
                "value": "required",
                "action": "Validate"
            })
            
    return constraints


def parse_requirement(text: str) -> list[ExtractedConstraint]:
    """Parse a requirement using spacy NLP or regex fallback."""
    if _SPACY_AVAILABLE:
        try:
            spacy_results = parse_requirement_with_spacy(text)
            if spacy_results:
                return spacy_results
        except Exception:
            pass
    return parse_requirement_regex(text)
