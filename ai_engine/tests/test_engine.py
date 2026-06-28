"""
Unit tests to verify that the AI Engines (NLP parsing, BVA/EP scenario generation, ML prioritizing) operate perfectly.
"""
from __future__ import annotations

import json
from ai_engine.requirement_parser import parse_requirement
from ai_engine.embedding_engine import get_requirement_embedding, get_code_embedding
from ai_engine.vector_db import VectorIndex
from ai_engine.similarity_engine import RequirementMappingEngine
from ai_engine.code_parser import CodeParser
from ai_engine.testing_engine import TestingIntelligenceEngine
from ai_engine.ml_prioritizer import TestPrioritizer


def test_requirement_parser():
    """Verify that spaCy/regex extracts constraints accurately."""
    req_text = "The password should contain at least 8 characters."
    constraints = parse_requirement(req_text)
    
    assert len(constraints) > 0
    c = constraints[0]
    assert c["entity"].lower() == "password"
    assert c["attribute"].lower() == "length"
    assert c["operator"] == ">="
    assert c["value"] == 8


def test_embedding_and_vector_db():
    """Verify that vector DB indexes and returns similarity results correctly."""
    dim = 768
    index = VectorIndex(dimension=dim)
    
    # Generate mock embeddings
    v1 = [0.1] * dim
    v2 = [0.9] * dim
    
    index.add("func_1", v1)
    index.add("func_2", v2)
    
    # Search
    query = [0.8] * dim
    matches = index.search(query, top_k=2)
    
    assert len(matches) == 2
    # func_2 should be more similar to the query than func_1
    assert matches[0][0] == "func_2"
    assert matches[0][1] > matches[1][1]


def test_code_parser(tmp_path):
    """Verify code_parser reads Python code structure."""
    code_content = """
def calculate_salary(base, bonus=0):
    if base < 0:
        raise ValueError("Base cannot be negative")
    total = base + bonus
    for i in range(5):
        total += i
    return total
"""
    test_file = tmp_path / "sample_code.py"
    test_file.write_text(code_content)
    
    parser = CodeParser("python")
    meta = parser.parse_file(str(test_file))
    
    assert meta["language"] == "python"
    assert len(meta["functions"]) == 1
    fn = meta["functions"][0]
    assert fn["name"] == "calculate_salary"
    assert len(fn["parameters"]) == 2
    assert "ValueError" in fn["exceptions"]
    assert fn["loops"] == 1
    assert fn["complexity_score"] == 4  # 1 base + 1 if + 1 loop + 1 try/raise exception


def test_testing_intelligence_engine():
    """Verify BVA and EP scenarios are successfully derived."""
    fn_data = {
        "name": "validate_age",
        "parameters": [{"name": "age", "type": "int", "required": True}],
        "complexity_score": 3,
        "conditions": ["age >= 18"],
        "exceptions": ["ValueError"]
    }
    
    engine = TestingIntelligenceEngine(fn_data)
    scenarios = engine.generate_all_scenarios()
    
    assert len(scenarios) > 0
    # Check that we have BVA category scenarios
    categories = [s["category"] for s in scenarios]
    assert "Boundary Value Analysis" in categories
    assert "Equivalence Partitioning" in categories
    
    # Check details of a BVA scenario
    bva_case = next(s for s in scenarios if s["category"] == "Boundary Value Analysis")
    assert "age" in bva_case["test_data"]
    assert bva_case["boundary_info"] is not None


def test_ml_prioritizer():
    """Verify classifier predicts correct priorities (High/Medium/Low)."""
    prioritizer = TestPrioritizer()
    
    test_cases = [
        {
            "title": "BVA Boundary test",
            "description": "Checks critical age threshold boundary on 18",
            "test_data": {"age": 18},
            "category": "Boundary Value Analysis",
            "severity": "Major",
            "complexity_score": 5
        },
        {
            "title": "Null check",
            "description": "Checks invalid null fallback",
            "test_data": {"age": None},
            "category": "Equivalence Partitioning",
            "severity": "Critical",
            "complexity_score": 1
        }
    ]
    
    prioritized = prioritizer.prioritize(test_cases)
    assert len(prioritized) == 2
    assert prioritized[0]["priority"] in ("High", "Medium", "Low")
    assert prioritized[1]["priority"] in ("High", "Medium", "Low")
