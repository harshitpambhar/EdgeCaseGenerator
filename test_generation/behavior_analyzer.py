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


def _normalize_return_type(return_type: Any) -> str:
    """Normalize return type mapping into general categories (list, object, boolean, string, number)."""
    if not return_type:
        return "unknown"
    text = str(return_type).strip().lower()
    if any(token in text for token in ("list", "tuple", "set")):
        return "list"
    if any(token in text for token in ("dict", "map", "object", "json", "record")):
        return "object"
    if "bool" in text:
        return "boolean"
    if any(token in text for token in ("str", "string", "text")):
        return "string"
    if any(token in text for token in ("int", "float", "number", "decimal", "double", "long")):
        return "number"
    return "unknown"


def _generate_test_name(func_name: str, param_name: str, value: Any, category: str) -> str:
    if category == "happy_path":
        return f"test_{func_name}_happy_path"
    if category == "exception" or value is None:
        return f"test_{func_name}_invalid_{param_name}"
    if isinstance(value, bool):
        val_str = "true" if value else "false"
        return f"test_{func_name}_{param_name}_{val_str}"
    
    val_str = str(value).strip().lower()
    if (val_str.startswith('"') and val_str.endswith('"')) or (val_str.startswith("'") and val_str.endswith("'")):
        val_str = val_str[1:-1].strip()
    val_str = re.sub(r'[^a-zA-Z0-9_]', '_', val_str)
    val_str = val_str.strip('_')
    
    if val_str:
        # Avoid double naming if it already has the function name
        return f"test_{func_name}_{val_str}"
    return f"test_{func_name}_{param_name}_case"


def generate_behavior_test_plans(fn_entry: dict[str, Any], language: str) -> list[BehaviorTestPlan]:
    """Analyze metadata to produce high-quality behavior-driven test cases."""
    func_name = fn_entry.get("name", "unknown")
    return_type = _normalize_return_type(fn_entry.get("return_type"))
    param_details = fn_entry.get("parameter_details", []) or []
    defaults = fn_entry.get("default_values", {}) or {}
    allowed_values = fn_entry.get("allowed_values", {}) or {}
    literal_values = fn_entry.get("literal_values", []) or []
    exceptions = fn_entry.get("exceptions_detail", []) or fn_entry.get("exceptions", []) or []
    branch_conditions = fn_entry.get("branch_conditions", []) or []
    
    # Ensure exceptions contains string names
    exceptions = [str(e) for e in exceptions if e]
    
    classification = classify_function(func_name, return_type, fn_entry.get("docstring", ""), param_details)
    
    # Required parameters set
    required_params = {p["name"] for p in param_details if p.get("required")}

    # Establish Happy Path default values for all parameters
    happy_inputs: dict[str, Any] = {}
    for param in param_details:
        name = param.get("name")
        if not name:
            continue
        ptype = param.get("type", "").lower()
        
        # Priority mapping for happy path: Allowed values -> Enum -> Defaults -> Type-based
        if name in allowed_values and allowed_values[name]:
            happy_inputs[name] = allowed_values[name][0]
        elif name in defaults and defaults[name] is not None:
            happy_inputs[name] = defaults[name]
        else:
            semantic = get_semantic_values(name)
            if semantic and semantic.get("positive"):
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
    for param in param_details:
        candidates[param["name"]] = []

    # 1. Parse Branch Conditions to align parameters to branches
    for cond in branch_conditions:
        extracted = extract_values_from_condition(cond)
        if extracted:
            var_name, cases = extracted
            if var_name in candidates:
                for val, cat in cases:
                    candidates[var_name].append((val, f"branch:{cond}", cat))

    # 2. Apply Semantic and Enum rules
    for param in param_details:
        pname = param["name"]
        ptype = param.get("type", "").lower()
        
        # Add allowed values / enums if available
        if pname in allowed_values and allowed_values[pname]:
            for val in allowed_values[pname]:
                candidates[pname].append((val, f"allowed_values:{pname}", "positive"))
            # Add invalid value checks
            if pname not in required_params:
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
                # Only add None if parameter is not required
                if val is None and pname in required_params:
                    continue
                candidates[pname].append((val, f"semantic_exc:{pname}", "exception"))

        # Category-specific testing strategies
        if classification == "Validation":
            if ptype == "string":
                candidates[pname].extend([
                    ("valid_" + pname, f"{pname}_val_valid", "positive"),
                    ("", f"{pname}_val_empty", "boundary"),
                    (" ", f"{pname}_val_whitespace", "negative"),
                ])
                if pname not in required_params:
                    candidates[pname].append((None, f"{pname}_val_null", "exception"))
            elif ptype == "number":
                candidates[pname].extend([
                    (1, f"{pname}_val_valid", "positive"),
                    (0, f"{pname}_val_zero", "boundary"),
                    (-1, f"{pname}_val_negative", "negative"),
                ])
                if pname not in required_params:
                    candidates[pname].append((None, f"{pname}_val_null", "exception"))
        elif classification == "Transformation":
            if ptype == "string":
                candidates[pname].extend([
                    ("standard_value", f"{pname}_trans_std", "positive"),
                    ("", f"{pname}_trans_empty", "boundary"),
                    ("malformed{json:invalid", f"{pname}_trans_malformed", "negative"),
                ])
                if pname not in required_params:
                    candidates[pname].append((None, f"{pname}_trans_null", "exception"))
            elif ptype == "list":
                candidates[pname].extend([
                    ([], f"{pname}_trans_empty_list", "boundary"),
                    ([1, 2, 3], f"{pname}_trans_list", "positive"),
                ])
            elif ptype == "object":
                candidates[pname].extend([
                    ({}, f"{pname}_trans_empty_dict", "boundary"),
                    ({"key": "val"}, f"{pname}_trans_dict", "positive"),
                ])
        elif classification == "Calculation":
            if ptype == "number":
                candidates[pname].extend([
                    (10, f"{pname}_calc_std", "positive"),
                    (0, f"{pname}_calc_zero", "boundary"),
                    (-5, f"{pname}_calc_neg", "negative"),
                    (999999, f"{pname}_calc_extreme", "boundary"),
                ])
        elif classification == "CRUD":
            if ptype == "string" and ("id" in pname.lower() or "key" in pname.lower()):
                candidates[pname].extend([
                    ("existing_id_123", f"{pname}_crud_exists", "positive"),
                    ("non_existent_id_999", f"{pname}_crud_missing", "negative"),
                    ("", f"{pname}_crud_empty", "boundary"),
                ])
                if pname not in required_params:
                    candidates[pname].append((None, f"{pname}_crud_null", "exception"))
            elif ptype == "object":
                candidates[pname].extend([
                    ({"id": 1, "name": "test"}, f"{pname}_crud_payload", "positive"),
                    ({}, f"{pname}_crud_empty_payload", "boundary"),
                ])
        elif classification == "API Wrapper":
            if "url" in pname.lower() or "endpoint" in pname.lower():
                candidates[pname].extend([
                    ("https://httpbin.org/get", f"{pname}_api_url", "positive"),
                    ("http://invalid.local", f"{pname}_api_invalid", "negative"),
                    ("", f"{pname}_api_empty", "boundary"),
                ])
                if pname not in required_params:
                    candidates[pname].append((None, f"{pname}_api_null", "exception"))

        # Fallbacks if candidates empty
        if not candidates[pname]:
            if any(x in ptype for x in ["bool", "boolean"]):
                candidates[pname].extend([(True, "bool_fall", "positive"), (False, "bool_fall", "negative")])
            elif any(x in ptype for x in ["int", "float", "number"]):
                candidates[pname].extend([(10, "num_fall", "positive"), (0, "num_fall", "boundary")])
                if pname not in required_params:
                    candidates[pname].append((None, "num_fall_null", "exception"))
            else:
                candidates[pname].extend([("test", "str_fall", "positive"), ("", "str_fall", "boundary")])
                if pname not in required_params:
                    candidates[pname].append((None, "str_fall_null", "exception"))

    plans: list[BehaviorTestPlan] = []
    existing_names = set()

    # Always include the happy path test
    happy_name = f"test_{func_name}_happy_path"
    plans.append({
        "test_name": happy_name,
        "inputs": happy_inputs,
        "expected_behavior": "returns",
        "expected_value": return_type,
        "condition_source": "happy_path",
        "quality_score": 80,
        "description": "Happy path testing with standard inputs.",
        "classification": classification
    })
    existing_names.add(happy_name)

    # Determine default target exception
    target_exception = exceptions[0] if exceptions else "ValueError" if classification == "Validation" else "Exception"

    # Helper function to validate plans against Quality Gate
    def validate_plan(plan: BehaviorTestPlan) -> bool:
        inputs = plan["inputs"]
        test_name = plan["test_name"]
        
        # 1. Missing required parameters
        for param in param_details:
            pname = param["name"]
            preq = param.get("required")
            
            if pname not in inputs:
                if preq:
                    log.info("Rejecting test plan %s: missing required parameter %s", test_name, pname)
                    return False
            else:
                val = inputs[pname]
                # 2. Uses None for required parameter
                if val is None and preq:
                    log.info("Rejecting test plan %s: uses None for required parameter %s", test_name, pname)
                    return False
                
                # 3. Uses True/False for string parameter
                ptype = param.get("type", "").lower()
                if ptype == "string" and isinstance(val, bool):
                    log.info("Rejecting test plan %s: uses boolean for string parameter %s", test_name, pname)
                    return False
                    
        # 4. Only contains assert result is not None
        # We reject if expected behavior is returns and return type is unknown
        if plan["expected_behavior"] == "returns" and return_type == "unknown":
            log.info("Rejecting test plan %s: return type unknown (would result in weak assertion)", test_name)
            return False
            
        # 5. Duplicates another test
        if test_name in existing_names:
            log.info("Rejecting test plan %s: duplicates another test name", test_name)
            return False
            
        return True

    for pname, values in candidates.items():
        for val, src, cat in values:
            current_inputs = happy_inputs.copy()
            current_inputs[pname] = val
            
            test_name = _generate_test_name(func_name, pname, val, cat)
            
            expected_behavior = "returns"
            expected_val = return_type
            
            if cat == "exception":
                expected_behavior = "raises"
                expected_val = target_exception
                
            # Compute Granular Quality Score
            q_score = 10
            if "branch" in src.lower():
                q_score += 35
            if "semantic" in src.lower() or "allowed" in src.lower() or "enum" in src.lower():
                q_score += 25
            if expected_behavior == "raises":
                q_score += 20
            if return_type != "unknown":
                q_score += 20
            else:
                q_score += 5
                
            if expected_behavior != "raises" and return_type == "unknown":
                q_score -= 10
                
            plan: BehaviorTestPlan = {
                "test_name": test_name,
                "inputs": current_inputs,
                "expected_behavior": expected_behavior,
                "expected_value": expected_val,
                "condition_source": src,
                "quality_score": q_score,
                "description": f"Verifies behavior ({cat}) for {pname} derived from {src}.",
                "classification": classification
            }
            
            # Apply Quality Gate
            if q_score < 40:
                log.info("Rejecting test plan %s: quality score %d below threshold", test_name, q_score)
                continue
                
            if validate_plan(plan):
                plans.append(plan)
                existing_names.add(test_name)

    # Aggressive Deduplication
    unique_plans: list[BehaviorTestPlan] = []
    seen_inputs = set()
    for plan in plans:
        inp = plan["inputs"]
        serialized = str(sorted((k, str(v)) for k, v in inp.items()))
        key = (serialized, plan["expected_behavior"], plan["expected_value"])
        if key not in seen_inputs:
            seen_inputs.add(key)
            unique_plans.append(plan)
            
    unique_plans.sort(key=lambda x: x["quality_score"], reverse=True)
    
    # Cap test count based on complexity
    complexity = fn_entry.get("complexity_score", 1)
    cap = 8 if complexity >= 5 else 5 if complexity >= 3 else 3
    
    log.info("Function '%s' (%s): generated %d plans (capped at %d)", func_name, classification, len(unique_plans), cap)
    return unique_plans[:cap]
