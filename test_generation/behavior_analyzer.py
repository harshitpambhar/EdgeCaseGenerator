"""
Behavior Analyzer - Language-agnostic analysis layer for generating behavior-driven test cases.
Classifies functions, maps branch conditions to parameter values, prioritizes semantic inputs,
scores test quality, and deduplicates test cases.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any, TypedDict

from shared.utils.logger import get_logger

log = get_logger(__name__)


class BehaviorTestPlan(TypedDict):
    test_name: str
    inputs: Any  # positional args (list) or keyword args (dict)
    expected_behavior: str  # "returns", "raises"
    expected_value: Any  # expected return type/value or Exception type
    condition_source: str
    quality_score: int
    description: str
    classification: str


def classify_function(name: str, return_type: str | None, docstring: str, parameters: list[dict]) -> str:
    """Classify function into one of the key categories to apply specific testing strategies."""
    name_lower = name.lower()
    doc_lower = docstring.lower() if docstring else ""
    
    # 1. Validation
    if (any(x in name_lower for x in ["is_", "has_", "validate", "check", "valid", "auth", "verify"]) or
        (return_type and return_type.lower() in ["bool", "boolean"]) or
        "validate" in doc_lower or "check" in doc_lower):
        return "Validation"
        
    # 2. Calculation
    if any(x in name_lower for x in ["add", "sub", "mul", "div", "sum", "calc", "math", "divide", "average", "mean", "median", "sqrt", "pow", "abs"]):
        return "Calculation"
        
    # 3. CRUD
    if any(x in name_lower for x in ["create", "update", "delete", "save", "remove", "insert", "find", "query", "fetch", "db", "repository"]):
        return "CRUD"
        
    # 4. API Wrapper
    if any(x in name_lower for x in ["api", "request", "download", "send", "post", "http", "curl", "client"]):
        return "API Wrapper"
        
    # 5. Transformation
    if any(x in name_lower for x in ["to_", "from_", "parse", "format", "convert", "serialize", "deserialize", "map"]):
        return "Transformation"
        
    # 6. Utility
    if any(x in name_lower for x in ["util", "helper", "log", "print", "config", "setup"]):
        return "Utility"
        
    return "Business Logic"


def get_semantic_values(param_name: str) -> dict[str, list[Any]] | None:
    """Retrieve semantic values (positive, negative, exception) for well-known parameter names."""
    p_lower = param_name.lower()
    
    if "email" in p_lower:
        return {
            "positive": ["user@example.com", "user.name+tag@domain.co.uk"],
            "negative": ["invalid-email", "no_domain@", "@missing_user.com"],
            "exception": ["", None]
        }
    if "role" in p_lower:
        return {
            "positive": ["admin", "user", "guest"],
            "negative": ["invalid_role", "superuser"],
            "exception": ["", None]
        }
    if "task_type" in p_lower:
        return {
            "positive": ["classification", "regression"],
            "negative": ["invalid_task", "clustering"],
            "exception": ["", None]
        }
    if "url" in p_lower or "uri" in p_lower:
        return {
            "positive": ["https://example.com/api", "http://localhost:8080"],
            "negative": ["ftp://invalid-url", "just_a_string"],
            "exception": ["", None]
        }
    if "status" in p_lower:
        return {
            "positive": ["active", "inactive", "pending"],
            "negative": ["invalid_status", "unknown"],
            "exception": ["", None]
        }
    if "active" in p_lower or "enabled" in p_lower or "flag" in p_lower:
        return {
            "positive": [True],
            "negative": [False],
            "exception": [None]
        }
    if "age" in p_lower:
        return {
            "positive": [25, 18, 65],
            "negative": [-1, 150],
            "exception": [None, "twenty"]
        }
    if "score" in p_lower or "grade" in p_lower:
        return {
            "positive": [95, 75, 50],
            "negative": [-5, 105],
            "exception": [None]
        }
    return None


def extract_values_from_condition(condition: str) -> tuple[str, list[tuple[Any, str]]] | None:
    """Extract matching inputs and boundary conditions from a conditional branch expression."""
    # Match numeric comparison: var >= 90
    m = re.match(r"^\s*([A-Za-z_]\w*)\s*(>=|<=|==|!=|>|<)\s*(-?\d+(?:\.\d+)?)\s*$", condition)
    if m:
        var_name, op, val_str = m.groups()
        val = float(val_str) if "." in val_str else int(val_str)
        cases = []
        if op == "==":
            cases.append((val, "branch_true"))
            cases.append((val + 1, "branch_false"))
        elif op == "!=":
            cases.append((val, "branch_false"))
            cases.append((val + 1, "branch_true"))
        elif op == ">":
            cases.append((val + 1, "branch_true"))
            cases.append((val, "branch_boundary"))
            cases.append((val - 1, "branch_false"))
        elif op == ">=":
            cases.append((val, "branch_true"))
            cases.append((val - 1, "branch_boundary"))
            cases.append((val - 2, "branch_false"))
        elif op == "<":
            cases.append((val - 1, "branch_true"))
            cases.append((val, "branch_boundary"))
            cases.append((val + 1, "branch_false"))
        elif op == "<=":
            cases.append((val, "branch_true"))
            cases.append((val + 1, "branch_boundary"))
            cases.append((val + 2, "branch_false"))
        return var_name, cases
        
    # Match string comparison: var == "classification"
    m = re.match(r"""^\s*([A-Za-z_]\w*)\s*(==|!=)\s*["'](.*)["']\s*$""", condition)
    if m:
        var_name, op, val = m.groups()
        cases = []
        if op == "==":
            cases.append((val, "branch_true"))
            cases.append((val + "_invalid", "branch_false"))
        else:
            cases.append((val, "branch_false"))
            cases.append((val + "_invalid", "branch_true"))
        return var_name, cases
        
    # Match boolean comparison: active or not active
    m = re.match(r"^\s*(not\s+)?([A-Za-z_]\w*)\s*$", condition, re.IGNORECASE)
    if m:
        not_prefix, var_name = m.groups()
        is_not = bool(not_prefix)
        cases = []
        if is_not:
            cases.append((False, "branch_true"))
            cases.append((True, "branch_false"))
        else:
            cases.append((True, "branch_true"))
            cases.append((False, "branch_false"))
        return var_name, cases
        
    return None


def generate_behavior_test_plans(fn_entry: dict[str, Any], language: str) -> list[BehaviorTestPlan]:
    """Analyze metadata to produce high-quality behavior-driven test cases."""
    func_name = fn_entry.get("name", "unknown")
    return_type = fn_entry.get("return_type")
    param_details = fn_entry.get("parameter_details", []) or []
    defaults = fn_entry.get("default_values", {}) or {}
    allowed_values = fn_entry.get("allowed_values", {}) or {}
    literal_values = fn_entry.get("literal_values", []) or []
    exceptions = fn_entry.get("exceptions_detail", []) or []
    branch_conditions = fn_entry.get("branch_conditions", []) or []
    
    classification = classify_function(func_name, return_type, fn_entry.get("docstring", ""), param_details)
    
    # Establish Happy Path default values for all parameters
    happy_inputs: dict[str, Any] = {}
    for param in param_details:
        name = param.get("name")
        if not name:
            continue
        ptype = param.get("type", "").lower()
        
        # Priority mapping for happy path
        if name in defaults:
            happy_inputs[name] = defaults[name]
        elif name in allowed_values and allowed_values[name]:
            happy_inputs[name] = allowed_values[name][0]
        elif literal_values:
            # Try to match literals
            happy_inputs[name] = literal_values[0]
        else:
            semantic = get_semantic_values(name)
            if semantic:
                happy_inputs[name] = semantic["positive"][0]
            elif any(x in ptype for x in ["int", "float", "number", "double"]):
                happy_inputs[name] = 10
            elif any(x in ptype for x in ["bool", "boolean"]):
                happy_inputs[name] = True
            elif any(x in ptype for x in ["list", "array", "sequence", "collection"]):
                happy_inputs[name] = [1, 2, 3]
            elif any(x in ptype for x in ["dict", "map", "object"]):
                happy_inputs[name] = {"key": "value"}
            else:
                happy_inputs[name] = "test_string"

    # Candidates mapping: parameter -> list of tuples (value, condition_source, category)
    candidates: dict[str, list[tuple[Any, str, str]]] = {}
    
    # Initialize candidates list
    for param in param_details:
        candidates[param["name"]] = []

    # 1. Parse Branch Conditions to align parameters to branches (Rule 2, Rule 9)
    for cond in branch_conditions:
        extracted = extract_values_from_condition(cond)
        if extracted:
            var_name, cases = extracted
            if var_name in candidates:
                for val, cat in cases:
                    candidates[var_name].append((val, f"branch:{cond}", cat))

    # 2. Apply Semantic rules (Rule 1, Rule 8, Rule 13)
    for param in param_details:
        pname = param["name"]
        ptype = param.get("type", "").lower()
        
        # Add allowed values if available
        if pname in allowed_values and allowed_values[pname]:
            for val in allowed_values[pname]:
                candidates[pname].append((val, f"allowed_values:{pname}", "positive"))
            # Add semantic invalid cases as well
            candidates[pname].append((None, f"allowed_values_null:{pname}", "exception"))
            candidates[pname].append(("__invalid_value__", f"allowed_values_invalid:{pname}", "exception"))
            
        # Match semantic names
        semantic = get_semantic_values(pname)
        if semantic:
            for val in semantic["positive"]:
                candidates[pname].append((val, f"semantic_pos:{pname}", "positive"))
            for val in semantic["negative"]:
                candidates[pname].append((val, f"semantic_neg:{pname}", "negative"))
            for val in semantic["exception"]:
                candidates[pname].append((val, f"semantic_exc:{pname}", "exception"))
                
        # 3. Validation Functions specific rules (Rule 13)
        if classification == "Validation":
            if "email" in pname.lower():
                candidates[pname].extend([
                    ("valid.user@domain.com", "email_validation", "positive"),
                    ("invalid-email", "email_validation", "negative"),
                    ("", "email_validation", "exception"),
                    ("malformed@domain..com", "email_validation", "negative")
                ])
                
        # 4. Mathematical Functions boundary rules (Rule 14)
        if classification == "Calculation":
            if any(x in ptype for x in ["int", "float", "number", "double"]):
                candidates[pname].extend([
                    (1, "math_boundary", "positive"),
                    (0, "math_boundary", "boundary"),
                    (-1, "math_boundary", "negative"),
                    (999999, "math_extreme", "boundary"),
                ])
                if "b" in pname.lower() or "div" in func_name.lower():
                    # division by zero check
                    candidates[pname].append((0, "division_by_zero", "exception"))

        # 5. Collection Functions rules (Rule 15)
        if any(x in ptype for x in ["list", "array", "sequence", "collection"]):
            candidates[pname].extend([
                ([], "collection_empty", "boundary"),
                ([1], "collection_single", "positive"),
                ([1, 1, 2, 2], "collection_duplicates", "boundary"),
                (list(range(100)), "collection_large", "boundary"),
                ([1, "two", None], "collection_mixed", "boundary")
            ])
            
        # 6. Type based fallbacks
        if not candidates[pname]:
            if any(x in ptype for x in ["bool", "boolean"]):
                candidates[pname].extend([(True, "bool_fall", "positive"), (False, "bool_fall", "negative")])
            elif any(x in ptype for x in ["int", "float", "number"]):
                candidates[pname].extend([(10, "num_fall", "positive"), (0, "num_fall", "boundary"), (-1, "num_fall", "negative")])
            else:
                candidates[pname].extend([("test", "str_fall", "positive"), ("", "str_fall", "boundary"), (None, "str_fall", "exception")])

    # Construct Test Plans using one-at-a-time substitution
    plans: list[BehaviorTestPlan] = []
    
    # Always include a happy path test
    plans.append({
        "test_name": f"test_{func_name}_happy_path",
        "inputs": happy_inputs,
        "expected_behavior": "returns",
        "expected_value": return_type or "unknown",
        "condition_source": "happy_path",
        "quality_score": 75,
        "description": "Happy path testing with standard inputs.",
        "classification": classification
    })

    # Keep track of exceptions mapping to direct raise tests (Rule 3)
    target_exception = exceptions[0] if exceptions else "ValueError" if classification == "Validation" else "Exception"
    
    for pname, values in candidates.items():
        for val, src, cat in values:
            # Skip duplicate value checks per parameter
            current_inputs = happy_inputs.copy()
            current_inputs[pname] = val
            
            # Format test name based on condition and category
            clean_src = src.replace("branch:", "").replace(" ", "_").replace(">", "gt").replace("<", "lt").replace("=", "eq").replace("!", "ne")
            clean_src = re.sub(r'[^a-zA-Z0-9_]', '', clean_src)
            test_name = f"test_{func_name}_{cat}_{clean_src}"
            
            expected_behavior = "returns"
            expected_val = return_type or "unknown"
            
            if cat == "exception":
                expected_behavior = "raises"
                expected_val = target_exception
                
            # Score the quality of the test plan (Rule 17)
            q_score = 0
            if "branch:" in src:
                q_score += 30  # branch coverage
            if "semantic" in src or cat == "positive":
                q_score += 25  # semantic coverage
            if cat == "exception":
                q_score += 25  # exception coverage
            if return_type and return_type != "unknown":
                q_score += 20  # assertion quality
            else:
                q_score += 10
                
            # Discard tests below quality score threshold (Rule 17)
            if q_score < 30:
                continue
                
            plans.append({
                "test_name": test_name,
                "inputs": current_inputs,
                "expected_behavior": expected_behavior,
                "expected_value": expected_val,
                "condition_source": src,
                "quality_score": q_score,
                "description": f"Verifies behavior ({cat}) for {pname} derived from {src}.",
                "classification": classification
            })

    # Aggressive Deduplication (Rule 11)
    unique_plans: list[BehaviorTestPlan] = []
    seen_inputs = set()
    for plan in plans:
        # Serialize inputs to handle lists/dicts
        inp = plan["inputs"]
        serialized = str(sorted((k, str(v)) for k, v in inp.items()))
        # Deduplicate on serialized inputs and expected behavior
        key = (serialized, plan["expected_behavior"], plan["expected_value"])
        if key not in seen_inputs:
            seen_inputs.add(key)
            unique_plans.append(plan)
            
    # Sort plans by quality score descending to keep best tests
    unique_plans.sort(key=lambda x: x["quality_score"], reverse=True)
    
    # Cap maximum test cases to prevent bloat (Rule 10)
    # High complexity: 8 tests, Medium complexity: 5 tests, Low complexity: 3 tests
    complexity = fn_entry.get("complexity_score", 1)
    cap = 8 if complexity >= 5 else 5 if complexity >= 3 else 3
    
    log.info("Function '%s' (%s): generated %d behavior plans (capped at %d)", func_name, classification, len(unique_plans), cap)
    return unique_plans[:cap]


def _normalize_return_type(return_type: Any) -> str:
    """Normalize return type mapping into general categories (list, object, boolean, string, number)."""
    if not return_type:
        return "unknown"
    text = str(return_type).strip().lower()
    if any(token in text for token in ("list", "tuple", "set")):
        return "list"
    if any(token in text for token in ("dict", "map", "object", "json")):
        return "object"
    if "bool" in text:
        return "boolean"
    if any(token in text for token in ("str", "string", "text")):
        return "string"
    if any(token in text for token in ("int", "float", "number", "decimal", "long")):
        return "number"
    return "unknown"
