"""
Testing Intelligence Module implementing BVA, EP, Decision Tables, State Transitions, and API testing.
Generates fully structured, algorithm-driven test plans.
"""
from __future__ import annotations

import itertools
import re
from typing import Any, TypedDict


class GeneratedTestScenario(TypedDict):
    title: str
    description: str
    preconditions: str
    test_data: dict[str, Any]
    execution_steps: list[str]
    expected_result: str
    category: str
    priority: str
    severity: str
    boundary_info: str | None
    equivalence_class_info: str | None
    decision_table_ref: str | None
    state_transition_ref: str | None


class TestingIntelligenceEngine:
    """Algorithmic testing scenario generator for functions and endpoints."""

    def __init__(self, function_data: dict[str, Any]):
        self.fn = function_data
        self.name = function_data.get("name", "unknown")
        self.params = function_data.get("parameters", []) or []
        self.complexity = function_data.get("complexity_score", 1)
        self.conditions = function_data.get("conditions", []) or []
        self.exceptions = function_data.get("exceptions", []) or []

    def generate_all_scenarios(self) -> list[GeneratedTestScenario]:
        """Combine all testing techniques to output a comprehensive list of test scenarios."""
        scenarios: list[GeneratedTestScenario] = []
        
        # 1. Boundary Value Analysis (BVA)
        scenarios.extend(self.run_boundary_value_analysis())
        
        # 2. Equivalence Partitioning (EP)
        scenarios.extend(self.run_equivalence_partitioning())
        
        # 3. Decision Table Testing
        scenarios.extend(self.run_decision_table_testing())
        
        # 4. State Transition Testing
        scenarios.extend(self.run_state_transition_testing())
        
        # 5. API Testing (if API calls are present or parameters indicate it)
        if any(x in self.name.lower() for x in ["api", "request", "post", "get", "fetch", "url"]):
            scenarios.extend(self.run_api_testing())
            
        # Deduplicate scenarios by title
        seen_titles = set()
        deduped = []
        for s in scenarios:
            if s["title"] not in seen_titles:
                seen_titles.add(s["title"])
                deduped.append(s)
                
        # Limit the number of generated tests based on complexity to prevent bloating
        cap = 8 if self.complexity >= 5 else 5 if self.complexity >= 3 else 3
        return deduped[:cap]

    def run_boundary_value_analysis(self) -> list[GeneratedTestScenario]:
        """BVA technique: generate below, on, and above boundary inputs."""
        scenarios = []
        for cond in self.conditions:
            # Look for comparisons like x >= 10
            match = re.search(r"(\w+)\s*(>=|<=|==|!=|>|<)\s*(-?\d+)", cond)
            if match:
                var_name, op, val_str = match.groups()
                val = int(val_str)
                
                # Boundary value sets
                boundaries = []
                if op == ">=":
                    boundaries = [
                        (val - 1, "Below Boundary (Invalid)", "Low", "Minor"),
                        (val, "On Boundary (Valid)", "High", "Major"),
                        (val + 1, "Above Boundary (Valid)", "Medium", "Minor")
                    ]
                elif op == "<=":
                    boundaries = [
                        (val - 1, "Below Boundary (Valid)", "Medium", "Minor"),
                        (val, "On Boundary (Valid)", "High", "Major"),
                        (val + 1, "Above Boundary (Invalid)", "Low", "Minor")
                    ]
                elif op == ">":
                    boundaries = [
                        (val, "Below Boundary (Invalid)", "Low", "Minor"),
                        (val + 1, "On Boundary (Valid)", "High", "Major"),
                        (val + 2, "Above Boundary (Valid)", "Medium", "Minor")
                    ]
                elif op == "<":
                    boundaries = [
                        (val - 2, "Below Boundary (Valid)", "Medium", "Minor"),
                        (val - 1, "On Boundary (Valid)", "High", "Major"),
                        (val, "Above Boundary (Invalid)", "Low", "Minor")
                    ]
                else: # == or !=
                    boundaries = [
                        (val - 1, "Off Boundary", "Medium", "Minor"),
                        (val, "On Boundary", "High", "Major")
                    ]
                    
                for test_val, desc, priority, severity in boundaries:
                    test_data = {p["name"]: test_val if p["name"] == var_name else self._get_default_val(p) for p in self.params}
                    scenarios.append({
                        "title": f"BVA: {self.name} boundary check for {var_name} {op} {val} with value {test_val}",
                        "description": f"Verifies boundary condition '{cond}' using target value {test_val} ({desc}).",
                        "preconditions": f"System is ready to execute {self.name}.",
                        "test_data": test_data,
                        "execution_steps": [
                            f"Prepare parameters with {var_name} set to {test_val}.",
                            f"Invoke the {self.name} function.",
                            "Verify the return value matches expectation."
                        ],
                        "expected_result": "Success" if "Valid" in desc or op == "==" else "Validation Error / Exception raised",
                        "category": "Boundary Value Analysis",
                        "priority": priority,
                        "severity": severity,
                        "boundary_info": f"Variable: {var_name}, Operator: {op}, Target: {val}, Test Value: {test_val}",
                        "equivalence_class_info": None,
                        "decision_table_ref": None,
                        "state_transition_ref": None
                    })
        return scenarios

    def run_equivalence_partitioning(self) -> list[GeneratedTestScenario]:
        """EP technique: partition inputs into valid and invalid classes."""
        scenarios = []
        for p in self.params:
            pname = p["name"]
            ptype = p.get("type", "unknown").lower()
            
            partitions = []
            if ptype in ("int", "float", "number"):
                partitions = [
                    (10, "Valid Positive Integer", "Valid", "Medium", "Minor"),
                    (-5, "Invalid Negative Integer", "Invalid", "High", "Major"),
                    (0, "Boundary Zero Value", "Valid", "Medium", "Minor"),
                    (None, "Invalid Null Value", "Invalid", "High", "Critical")
                ]
            elif ptype in ("str", "string"):
                partitions = [
                    ("test_input", "Valid String Value", "Valid", "Medium", "Minor"),
                    ("", "Boundary Empty String", "Invalid", "High", "Major"),
                    (" "*1000, "Invalid Extremely Long String", "Invalid", "Low", "Minor"),
                    (None, "Invalid Null String", "Invalid", "High", "Critical")
                ]
            elif ptype in ("bool", "boolean"):
                partitions = [
                    (True, "Valid Boolean True", "Valid", "Medium", "Minor"),
                    (False, "Valid Boolean False", "Valid", "Medium", "Minor"),
                    (None, "Invalid Null Boolean", "Invalid", "High", "Critical")
                ]
            else:
                partitions = [
                    ("default_val", "Generic Valid Value", "Valid", "Medium", "Minor"),
                    (None, "Invalid Null Fallback", "Invalid", "High", "Critical")
                ]
                
            for test_val, desc, val_class, priority, severity in partitions:
                test_data = {param["name"]: test_val if param["name"] == pname else self._get_default_val(param) for param in self.params}
                scenarios.append({
                    "title": f"EP: {self.name} parameter {pname} with partition '{desc}'",
                    "description": f"Verifies input partition '{desc}' ({val_class} class) for parameter '{pname}'.",
                    "preconditions": f"Function {self.name} parameters initialized.",
                    "test_data": test_data,
                    "execution_steps": [
                        f"Set parameter {pname} to {test_val}.",
                        f"Execute function {self.name}.",
                        f"Assert behavior matches {val_class} requirements."
                    ],
                    "expected_result": "Function processes input successfully" if val_class == "Valid" else "Exception / Graceful validation rejection",
                    "category": "Equivalence Partitioning",
                    "priority": priority,
                    "severity": severity,
                    "boundary_info": None,
                    "equivalence_class_info": f"Param: {pname}, Class: {desc}, Type: {val_class}",
                    "decision_table_ref": None,
                    "state_transition_ref": None
                })
        return scenarios

    def run_decision_table_testing(self) -> list[GeneratedTestScenario]:
        """Decision Table technique: generate truth table combinations for conditions."""
        scenarios = []
        cond_count = len(self.conditions)
        if cond_count == 0:
            return []
            
        # Limit combinations to max 2 variables (4 rules) to avoid state explosion
        target_conds = self.conditions[:2]
        combinations = list(itertools.product([True, False], repeat=len(target_conds)))
        
        for rule_idx, combo in enumerate(combinations):
            rule_desc = ", ".join(f"{cond} is {val}" for cond, val in zip(target_conds, combo))
            
            # Map combinations to test data variables
            test_data = {}
            for p in self.params:
                pname = p["name"]
                # Determine value based on conditions
                matched = False
                for cond, val in zip(target_conds, combo):
                    if pname in cond:
                        # Extract numerical reference
                        match = re.search(r"\d+", cond)
                        val_ref = int(match.group(0)) if match else 10
                        if val: # True condition
                            test_data[pname] = val_ref + 1 if ">" in cond else val_ref - 1 if "<" in cond else val_ref
                        else: # False condition
                            test_data[pname] = val_ref - 1 if ">" in cond else val_ref + 1 if "<" in cond else val_ref + 99
                        matched = True
                        break
                if not matched:
                    test_data[pname] = self._get_default_val(p)
                    
            scenarios.append({
                "title": f"Decision Table: {self.name} rule combination {rule_idx + 1}",
                "description": f"Verifies logic tree combination: {rule_desc}.",
                "preconditions": f"Function logic loaded and database online.",
                "test_data": test_data,
                "execution_steps": [
                    f"Setup inputs to trigger rule combination: {rule_desc}.",
                    f"Invoke call to {self.name}.",
                    "Verify branching logic executes exactly matching expectation."
                ],
                "expected_result": "Branches evaluated correctly",
                "category": "Decision Table",
                "priority": "High" if rule_idx == 0 else "Medium",
                "severity": "Major",
                "boundary_info": None,
                "equivalence_class_info": None,
                "decision_table_ref": f"Rule: {rule_idx + 1}, Conditions: {rule_desc}",
                "state_transition_ref": None
            })
        return scenarios

    def run_state_transition_testing(self) -> list[GeneratedTestScenario]:
        """State Transition technique: test flow transitions."""
        # Detect state terms like "status", "state", "step"
        state_param = next((p for p in self.params if any(x in p["name"].lower() for x in ["state", "status", "step", "stage"])), None)
        if not state_param:
            return []
            
        states = ["INIT", "PENDING", "COMPLETED", "FAILED"]
        transitions = [
            ("INIT", "PENDING", "Valid start"),
            ("PENDING", "COMPLETED", "Valid completion"),
            ("PENDING", "FAILED", "Valid failure"),
            ("COMPLETED", "INIT", "Invalid restart (loop)")
        ]
        
        scenarios = []
        for src, dest, desc in transitions:
            test_data = {
                state_param["name"]: dest,
                # Additional parameters
                **{p["name"]: self._get_default_val(p) for p in self.params if p["name"] != state_param["name"]}
            }
            
            scenarios.append({
                "title": f"State Transition: {self.name} from {src} to {dest} ({desc})",
                "description": f"Tests state machine transition from {src} to {dest} — {desc}.",
                "preconditions": f"System state is set to '{src}'.",
                "test_data": test_data,
                "execution_steps": [
                    f"Ensure initial state is '{src}'.",
                    f"Trigger event changing state to '{dest}'.",
                    f"Invoke {self.name} and verify current state."
                ],
                "expected_result": "State successfully updated" if "Valid" in desc else "Transition rejected (Error state)",
                "category": "State Transition",
                "priority": "High" if "Invalid" in desc else "Medium",
                "severity": "Major",
                "boundary_info": None,
                "equivalence_class_info": None,
                "decision_table_ref": None,
                "state_transition_ref": f"From: {src}, To: {dest}, Action: {desc}"
            })
        return scenarios

    def run_api_testing(self) -> list[GeneratedTestScenario]:
        """API testing validation: check payload schema, negative values, and missing attributes."""
        scenarios = [
            {
                "title": f"API: {self.name} missing authentication token",
                "description": "Verifies API endpoint returns 401 unauthorized when auth token is omitted.",
                "preconditions": "Server is listening, database populated.",
                "test_data": {"headers": {"Authorization": ""}},
                "execution_steps": [
                    f"Make call to endpoint mapped to {self.name} without auth headers.",
                    "Capture HTTP status response."
                ],
                "expected_result": "HTTP 401 Unauthorized",
                "category": "API Testing",
                "priority": "High",
                "severity": "Critical",
                "boundary_info": None,
                "equivalence_class_info": None,
                "decision_table_ref": None,
                "state_transition_ref": None
            },
            {
                "title": f"API: {self.name} missing mandatory payload parameters",
                "description": "Verifies endpoint returns 422 validation failure when parameters are missing.",
                "preconditions": "Auth token valid.",
                "test_data": {},  # empty payload
                "execution_steps": [
                    f"Send request payload with missing attributes.",
                    "Verify server response status."
                ],
                "expected_result": "HTTP 422 Unprocessable Entity / validation errors list",
                "category": "API Testing",
                "priority": "Medium",
                "severity": "Major",
                "boundary_info": None,
                "equivalence_class_info": None,
                "decision_table_ref": None,
                "state_transition_ref": None
            }
        ]
        return scenarios

    def _get_default_val(self, p: dict[str, Any]) -> Any:
        ptype = p.get("type", "unknown").lower()
        if ptype in ("int", "float", "number"):
            return 1
        if ptype in ("bool", "boolean"):
            return True
        if ptype in ("list", "array"):
            return []
        return "default"
