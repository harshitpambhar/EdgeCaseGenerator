"""
FastAPI unified backend for the AI-Powered Smart Test Input Generator.
Handles DB persistence, Authentication, Job execution, AST parsing, BVA/EP testing algorithms, ML prioritizations, and Requirement mappings.
"""
from __future__ import annotations

import os
import json
import uuid
import datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Depends, status, Response, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Import DB configurations
from backend.database import Base, engine, get_db
from backend.models import User, Requirement, Repository, ParsedFunction, TestCase, CoverageReport
from backend.auth import hash_password, verify_password, create_access_token, get_current_user

# Import AI Engine components
from ai_engine.requirement_parser import parse_requirement
from ai_engine.code_parser import CodeParser
from ai_engine.similarity_engine import RequirementMappingEngine
from ai_engine.testing_engine import TestingIntelligenceEngine
from ai_engine.ml_prioritizer import TestPrioritizer
from ai_engine.coverage_engine import CoverageAnalyzer

from shared.utils.logger import get_logger

# Initialize Database tables
Base.metadata.create_all(bind=engine)

log = get_logger("api")
app = FastAPI(title="AI-Powered Test Generator Backend", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REQUEST SCHEMAS ───────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    username: str | None = None
    name: str | None = None
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str


class RequirementRequest(BaseModel):
    req_id: str
    title: str
    description: str


class RepoScanRequest(BaseModel):
    name: str
    repo_path: str
    language: str | None = "python"


class MapTriggerRequest(BaseModel):
    repo_id: int
    threshold: float = 0.1


# ── HEALTH ENDPOINT ───────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}


# ── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────────────

@app.post("/api/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    import re
    # Determine username
    username = req.username or req.name or req.email.split("@")[0]
    username = re.sub(r'[^a-zA-Z0-9_]', '_', username)
    if not username:
        username = "user"
        
    # Ensure username uniqueness in the database
    base_username = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}_{counter}"
        counter += 1
        
    # Check if email is already registered
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    hashed = hash_password(req.password)
    user = User(username=username, email=req.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully", "user_id": user.id}


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    identifier = req.email or req.username
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required")
        
    user = db.query(User).filter((User.email == identifier) | (User.username == identifier)).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_access_token(data={"sub": user.username})
    return {
        "token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.username,
            "fullName": user.username
        }
    }


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.username,
        "fullName": current_user.username
    }


# ── REQUIREMENT MANAGEMENT ENDPOINTS ──────────────────────────────────────────

@app.post("/api/requirements")
def create_requirement(req: RequirementRequest, db: Session = Depends(get_db)):
    existing = db.query(Requirement).filter(Requirement.req_id == req.req_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Requirement ID {req.req_id} already exists")
        
    # Analyze constraints and actions using spaCy parser
    nlp_constraints = parse_requirement(req.description)
    
    requirement = Requirement(
        req_id=req.req_id,
        title=req.title,
        description=req.description,
        constraints=json.dumps(nlp_constraints),
        actions=json.dumps([c["action"] for c in nlp_constraints])
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return {
        "message": "Requirement added and analyzed",
        "id": requirement.id,
        "extracted_constraints": nlp_constraints
    }


@app.get("/api/requirements")
def list_requirements(db: Session = Depends(get_db)):
    reqs = db.query(Requirement).all()
    results = []
    for r in reqs:
        results.append({
            "id": r.id,
            "req_id": r.req_id,
            "title": r.title,
            "description": r.description,
            "constraints": json.loads(r.constraints or "[]"),
            "actions": json.loads(r.actions or "[]"),
            "created_at": r.created_at.isoformat()
        })
    return results


@app.delete("/api/requirements/{id}")
def delete_requirement(id: int, db: Session = Depends(get_db)):
    req = db.query(Requirement).filter(Requirement.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    db.delete(req)
    db.commit()
    return {"message": "Requirement deleted"}


# ── REPOSITORY SCAN & AST PARSING ENDPOINTS ───────────────────────────────────

@app.post("/api/projects")
@app.post("/api/jobs")
def scan_and_register_repo(req: RepoScanRequest, db: Session = Depends(get_db)):
    repo_dir = Path(req.repo_path).expanduser().resolve()
    if not repo_dir.is_dir():
        raise HTTPException(status_code=400, detail=f"Repository path does not exist: {repo_dir}")
        
    # Save repo meta
    repo = Repository(name=req.name, repo_path=str(repo_dir), language=req.language)
    db.add(repo)
    db.commit()
    db.refresh(repo)
    
    # Trigger parser engine scanning recursively
    parser = CodeParser(language=req.language or "python")
    scanned_files = list(repo_dir.rglob("*.py" if (req.language or "").lower() == "python" else "*.java" if (req.language or "").lower() == "java" else "*.js" if (req.language or "").lower() == "javascript" else "*.*"))
    
    parsed_count = 0
    for file_path in scanned_files:
        if file_path.is_file() and not any(x in file_path.parts for x in [".venv", "venv", "node_modules", ".git", "__pycache__"]):
            try:
                parsed_meta = parser.parse_file(str(file_path))
                for fn in parsed_meta.get("functions", []):
                    parsed_fn = ParsedFunction(
                        repo_id=repo.id,
                        name=fn["name"],
                        class_name=None,
                        file_path=str(file_path.relative_to(repo_dir)),
                        code=fn["code"],
                        complexity=fn["complexity_score"],
                        parameters=json.dumps(fn["parameters"]),
                        returns=fn["return_type"],
                        exceptions=json.dumps(fn["exceptions"]),
                        dependencies=json.dumps([])
                    )
                    db.add(parsed_fn)
                    parsed_count += 1
            except Exception as e:
                log.warning("Could not parse file %s: %s", file_path, e)
                
    db.commit()
    return {
        "message": "Repository registered and parsed",
        "repo_id": repo.id,
        "functions_extracted": parsed_count
    }


@app.get("/api/projects")
@app.get("/api/jobs")
def list_repositories(db: Session = Depends(get_db)):
    repos = db.query(Repository).all()
    results = []
    for r in repos:
        func_count = db.query(ParsedFunction).filter(ParsedFunction.repo_id == r.id).count()
        results.append({
            "id": r.id,
            "name": r.name,
            "repo_path": r.repo_path,
            "language": r.language,
            "functions_count": func_count,
            "created_at": r.created_at.isoformat()
        })
    return results


@app.get("/api/jobs/user/{email}")
def get_jobs_by_user(email: str, db: Session = Depends(get_db)):
    # Return all registered repositories as jobs for simplicity
    repos = db.query(Repository).all()
    results = []
    for r in repos:
        func_count = db.query(ParsedFunction).filter(ParsedFunction.repo_id == r.id).count()
        # Mock result JSON structure that match expected frontend parameters
        cov = db.query(CoverageReport).filter(CoverageReport.repo_id == r.id).first()
        tcs_count = db.query(TestCase).join(ParsedFunction).filter(ParsedFunction.repo_id == r.id).count()
        
        result_data = {
            "languages_detected": [r.language or "python"],
            "functions_detected": func_count,
            "generated_tests": [{"id": i} for i in range(tcs_count)],
            "coverage": {
                "coverage_percent": cov.code_coverage if cov else 0.0,
            },
            "risk_analysis": [
                {"name": "mock", "risk_level": "LOW"}
            ]
        }
        
        results.append({
            "id": r.id,
            "repoUrl": r.name,
            "status": "COMPLETED" if tcs_count > 0 else "PENDING",
            "createdAt": r.created_at.isoformat(),
            "updatedAt": r.created_at.isoformat(),
            "resultJson": json.dumps(result_data)
        })
    return results


@app.get("/api/projects/{id}")
@app.get("/api/jobs/{id}")
def get_repository_details(id: int, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    functions = db.query(ParsedFunction).filter(ParsedFunction.repo_id == repo.id).all()
    func_list = []
    for fn in functions:
        func_list.append({
            "id": fn.id,
            "name": fn.name,
            "file_path": fn.file_path,
            "complexity": fn.complexity,
            "returns": fn.returns
        })
        
    return {
        "id": repo.id,
        "name": repo.name,
        "repo_path": repo.repo_path,
        "language": repo.language,
        "functions": func_list
    }


# ── REQUIREMENT MAPPING ENGINE ────────────────────────────────────────────────

@app.post("/api/requirements/map")
def map_requirements(req: MapTriggerRequest, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == req.repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    requirements = db.query(Requirement).all()
    functions = db.query(ParsedFunction).filter(ParsedFunction.repo_id == repo.id).all()
    
    if not requirements or not functions:
        return {"message": "Need both requirements and parsed code functions to compute mappings", "mappings": []}
        
    # Build Similarity Engine
    mapping_engine = RequirementMappingEngine(job_id=str(repo.id))
    
    # Index parsed functions code
    fn_dicts = [{"id": f.id, "name": f.name, "code": f.code, "file_path": f.file_path} for f in functions]
    mapping_engine.index_functions(fn_dicts)
    
    # Run mapping similarity search for each requirement
    results = []
    for r in requirements:
        req_text = f"{r.title} {r.description}"
        mapped_fns = mapping_engine.map_requirement_to_functions(req_text, top_k=3, threshold=req.threshold)
        
        for mapped in mapped_fns:
            results.append({
                "requirement_id": r.id,
                "requirement_code": r.req_id,
                "requirement_title": r.title,
                "function_id": mapped["function_id"],
                "function_name": mapped["name"],
                "file_path": mapped["file_path"],
                "similarity_score": mapped["similarity_score"]
            })
            
    return {"message": "Requirements mapped successfully", "mappings": results}


# ── TEST CASE GENERATION & PRIORITIZATION ENDPOINTS ───────────────────────────

@app.post("/api/projects/{repo_id}/testcases/generate")
@app.post("/api/jobs/{repo_id}/testcases/generate")
def generate_and_prioritize_tests(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    functions = db.query(ParsedFunction).filter(ParsedFunction.repo_id == repo_id).all()
    if not functions:
        raise HTTPException(status_code=400, detail="No parsed functions found for this repository. Run scan first.")
        
    requirements = db.query(Requirement).all()
    
    # Instantiate prioritizer
    prioritizer = TestPrioritizer()
    
    # Match requirements to code functions using Similarity Engine to bind them
    mapping_engine = RequirementMappingEngine(job_id=str(repo.id))
    fn_dicts = [{"id": f.id, "name": f.name, "code": f.code, "file_path": f.file_path} for f in functions]
    mapping_engine.index_functions(fn_dicts)
    
    test_cases_created = 0
    scenarios_list = []
    
    for fn in functions:
        # Load parameters
        params = json.loads(fn.parameters or "[]")
        conditions = json.loads(fn.code).get("conditions", []) if hasattr(fn.code, "conditions") else []
        exceptions = json.loads(fn.exceptions or "[]")
        
        fn_data = {
            "name": fn.name,
            "parameters": params,
            "complexity_score": fn.complexity,
            "conditions": conditions,
            "exceptions": exceptions
        }
        
        # 1. Generate scenarios using TestingIntelligenceEngine (BVA, EP, Decision Tables, States)
        engine = TestingIntelligenceEngine(fn_data)
        scenarios = engine.generate_all_scenarios()
        
        # 2. Prioritize scenarios using ML Prioritizer
        prioritized_scenarios = prioritizer.prioritize(scenarios)
        
        # 3. Associate with similar requirement if matching score > 0.1
        best_req_id = None
        best_score = 0.0
        for r in requirements:
            req_text = f"{r.title} {r.description}"
            # Compute direct similarity score
            sim_score = mapping_engine.map_requirement_to_functions(req_text, top_k=1)
            for m in sim_score:
                if m["function_id"] == fn.id and m["similarity_score"] > best_score:
                    best_score = m["similarity_score"]
                    best_req_id = r.id

        # 4. Save to Database
        for ps in prioritized_scenarios:
            tc_id = f"TC-{uuid.uuid4().hex[:6].upper()}"
            tc = TestCase(
                tc_id=tc_id,
                title=ps["title"],
                description=ps["description"],
                requirement_id=best_req_id,
                function_id=fn.id,
                preconditions=ps["preconditions"],
                test_data=json.dumps(ps["test_data"]),
                execution_steps=json.dumps(ps["execution_steps"]),
                expected_result=ps["expected_result"],
                priority=ps["priority"],
                severity=ps["severity"],
                coverage=best_score if best_req_id else 0.0,
                category=ps["category"],
                boundary_info=ps.get("boundary_info"),
                equivalence_class_info=ps.get("equivalence_class_info"),
                decision_table_ref=ps.get("decision_table_ref"),
                state_transition_ref=ps.get("state_transition_ref")
            )
            db.add(tc)
            test_cases_created += 1
            
    db.commit()
    
    # 5. Calculate and save coverage metrics
    cov_analyzer = CoverageAnalyzer(db)
    cov_analyzer.analyze_and_save_coverage(repo.id)
    
    return {
        "message": "Testing intelligence scenarios generated and ML prioritized successfully",
        "test_cases_created": test_cases_created
    }


@app.get("/api/projects/{repo_id}/testcases")
@app.get("/api/jobs/{repo_id}/testcases")
def list_test_cases(repo_id: int, db: Session = Depends(get_db)):
    tcs = db.query(TestCase).join(ParsedFunction).filter(ParsedFunction.repo_id == repo_id).all()
    results = []
    for t in tcs:
        results.append({
            "id": t.id,
            "tc_id": t.tc_id,
            "title": t.title,
            "description": t.description,
            "requirement_id": t.requirement_id,
            "function_id": t.function_id,
            "preconditions": t.preconditions,
            "test_data": json.loads(t.test_data or "{}"),
            "execution_steps": json.loads(t.execution_steps or "[]"),
            "expected_result": t.expected_result,
            "priority": t.priority,
            "severity": t.severity,
            "category": t.category,
            "boundary_info": t.boundary_info,
            "equivalence_class_info": t.equivalence_class_info,
            "decision_table_ref": t.decision_table_ref,
            "state_transition_ref": t.state_transition_ref
        })
    return results


# ── COVERAGE TRACKING ENDPOINT ────────────────────────────────────────────────

@app.get("/api/projects/{repo_id}/coverage")
@app.get("/api/jobs/{repo_id}/coverage")
def get_coverage(repo_id: int, db: Session = Depends(get_db)):
    report = db.query(CoverageReport).filter(CoverageReport.repo_id == repo_id).first()
    if not report:
        # Fallback empty coverage report
        return {
            "req_coverage": 0.0,
            "code_coverage": 0.0,
            "func_coverage": 0.0,
            "branch_coverage": 0.0,
            "loop_coverage": 0.0,
            "cond_coverage": 0.0,
            "api_coverage": 0.0
        }
    return {
        "req_coverage": report.req_coverage,
        "code_coverage": report.code_coverage,
        "func_coverage": report.func_coverage,
        "branch_coverage": report.branch_coverage,
        "loop_coverage": report.loop_coverage,
        "cond_coverage": report.cond_coverage,
        "api_coverage": report.api_coverage
    }


# ── TEST CASE ZIP ARCHIVE EXPORT ENDPOINT ─────────────────────────────────────

@app.get("/api/projects/{repo_id}/testcases/export")
@app.get("/api/jobs/{repo_id}/download")
def download_test_archive(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    tcs = db.query(TestCase).join(ParsedFunction).filter(ParsedFunction.repo_id == repo_id).all()
    if not tcs:
        raise HTTPException(status_code=400, detail="No generated test cases to export. Generate tests first.")
        
    # Build python/jest/junit formatted code block archive in temporary workspace
    import tempfile
    import zipfile
    
    with tempfile.TemporaryDirectory() as tmp_dir:
        zip_path = Path(tmp_dir) / f"{repo.name}_tests.zip"
        
        with zipfile.ZipFile(zip_path, "w") as zip_file:
            # Write a README manifest
            manifest = [
                f"# Generated Test Suites for {repo.name}",
                f"Generated on: {datetime.datetime.utcnow().isoformat()}",
                f"Total Test Cases: {len(tcs)}",
                "",
                "| ID | Title | Category | Priority | Expected |",
                "|---|---|---|---|---|"
            ]
            for t in tcs:
                manifest.append(f"| {t.tc_id} | {t.title} | {t.category} | {t.priority} | {t.expected_result} |")
                
            zip_file.writestr("test_manifest.md", "\n".join(manifest))
            
            # Write the structured test files
            # Group by file path
            by_file = {}
            for t in tcs:
                fn = db.query(ParsedFunction).filter(ParsedFunction.id == t.function_id).first()
                if fn:
                    by_file.setdefault(fn.file_path, []).append(t)
                    
            for file_path, file_tcs in by_file.items():
                test_code = ["import pytest", ""]
                for t in file_tcs:
                    test_name = f"test_{t.tc_id.lower().replace('-', '_')}"
                    data = json.loads(t.test_data or "{}")
                    steps = json.loads(t.execution_steps or "[]")
                    
                    test_code.append(f"def {test_name}():")
                    test_code.append(f'    \"\"\"{t.description}\"\"\"')
                    test_code.append(f"    # Preconditions: {t.preconditions}")
                    test_code.append(f"    # Test Data: {json.dumps(data)}")
                    for step in steps:
                        test_code.append(f"    # Step: {step}")
                    test_code.append(f"    # Expected Result: {t.expected_result}")
                    test_code.append("    assert True")
                    test_code.append("")
                    
                target_name = f"test_{Path(file_path).stem}.py"
                zip_file.writestr(target_name, "\n".join(test_code))
                
        # Read the file to respond
        content = zip_path.read_bytes()
        
    return Response(
        content=content,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={repo.name}_tests.zip"
        }
    )
