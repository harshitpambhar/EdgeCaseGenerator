"""
Canonical data-transfer schemas (plain TypedDicts — no runtime overhead,
no external dependency).  Every service imports from here so the contract
is defined in exactly one place.
"""
from __future__ import annotations

from typing import Any, TypedDict


# ── Parser output ─────────────────────────────────────────────────────────────

class FunctionSchema(TypedDict):
    name: str
    parameters: list[str]
    conditions: list[str]
    loops: int
    returns: int
    exceptions: int
    operators: list[str]
    nesting_depth: int
    complexity_score: int
    apis: list[str]
    imports: list[str]


class ParsedFileSchema(TypedDict):
    source_file: str
    language: str
    function_count: int
    functions: list[FunctionSchema]


# ── Edge-case output ──────────────────────────────────────────────────────────

class FunctionEdgeCases(TypedDict):
    name: str
    edge_cases: dict[str, list[Any]]   # condition → list of values


class EdgeCaseSchema(TypedDict):
    source_file: str
    functions: list[FunctionEdgeCases]


# ── Generated test ────────────────────────────────────────────────────────────

class GeneratedTest(TypedDict):
    function: str
    test_name: str
    condition: str | None
    case: Any
    language: str
    framework: str
    code: str


class TestGenerationSchema(TypedDict):
    source_file: str
    language: str
    framework: str
    generated: list[GeneratedTest]
    test_file_path: str


# ── Test execution ────────────────────────────────────────────────────────────

class ExecutionResult(TypedDict):
    passed: int
    failed: int
    errors: list[str]
    logs: list[str]
    duration_seconds: float


# ── Coverage ──────────────────────────────────────────────────────────────────

class CoverageSchema(TypedDict):
    coverage_percent: float
    covered_functions: list[str]
    uncovered_functions: list[str]
    covered_functions_count: int
    uncovered_functions_count: int
    uncovered_branches: list[Any]
    missing_lines: list[int]
    recommendation: str


# ── Risk analysis ─────────────────────────────────────────────────────────────

class FunctionRisk(TypedDict):
    name: str
    complexity: int
    risk_score: float
    risk_level: str          # LOW | MEDIUM | HIGH
    recommendation: str


class RiskAnalysisSchema(TypedDict):
    functions: list[FunctionRisk]


# ── Repository scan ───────────────────────────────────────────────────────────

class ScannedFile(TypedDict):
    path: str                # absolute path
    relative_path: str
    language: str
    size_bytes: int


class ScanResult(TypedDict):
    repo_path: str
    total_files: int
    languages_detected: list[str]
    files: list[ScannedFile]


# ── Unified pipeline response ─────────────────────────────────────────────────

class PipelineResponse(TypedDict):
    job_id: str
    repository: str
    languages_detected: list[str]
    functions_detected: int
    generated_tests: list[GeneratedTest]
    coverage: CoverageSchema
    risk_analysis: list[FunctionRisk]
    recommendations: list[str]
    execution_results: ExecutionResult
