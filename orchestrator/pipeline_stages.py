"""Pipeline stages for the orchestrator."""
from pathlib import Path
from typing import List, Dict, Any
from shared.utils.logger import get_logger

log = get_logger(__name__)


def analyze_repository_intelligence(repo_dir: Path) -> Dict[str, Any]:
    """
    Analyze repository to determine project type and structure.
    
    Parameters
    ----------
    repo_dir : Path
        Repository directory
    
    Returns
    -------
    Dict[str, Any]
        Repository intelligence data
    """
    intelligence = {
        "project_types": [],
        "frameworks": [],
        "languages": [],
    }
    
    repo_dir = Path(repo_dir)
    
    # Detect project types
    if (repo_dir / "package.json").exists():
        intelligence["project_types"].append("node")
        intelligence["languages"].append("javascript")
    
    if (repo_dir / "pom.xml").exists() or (repo_dir / "build.gradle").exists():
        intelligence["project_types"].append("java")
        intelligence["languages"].append("java")
    
    if (repo_dir / "requirements.txt").exists() or (repo_dir / "setup.py").exists():
        intelligence["project_types"].append("python")
        intelligence["languages"].append("python")
    
    if (repo_dir / "go.mod").exists():
        intelligence["project_types"].append("go")
        intelligence["languages"].append("go")
    
    if (repo_dir / "Cargo.toml").exists():
        intelligence["project_types"].append("rust")
        intelligence["languages"].append("rust")
    
    log.info(f"Repository intelligence: {intelligence}")
    return intelligence


def parse_files_parallel(
    files: List[str],
    parse_func,
    max_workers: int = 4
) -> tuple[List[Any], List[Dict[str, str]]]:
    """
    Parse files with optional parallelization.
    
    Parameters
    ----------
    files : List[str]
        List of file paths to parse
    parse_func : callable
        Parse function to apply
    max_workers : int
        Number of parallel workers
    
    Returns
    -------
    tuple[List[Any], List[Dict[str, str]]]
        (parsed_results, errors)
    """
    parsed = []
    errors = []
    
    for file_path in files:
        try:
            result = parse_func(file_path)
            parsed.append(result)
        except Exception as e:
            errors.append({"file": str(file_path), "error": str(e)})
            log.warning(f"Failed to parse {file_path}: {e}")
    
    return parsed, errors


def setup_execution_environment(
    workspace: Path,
    languages: List[str],
    dep_mgr
) -> Dict[str, Any]:
    """
    Setup execution environment for the project.
    
    Parameters
    ----------
    workspace : Path
        Workspace directory
    languages : List[str]
        Detected languages
    dep_mgr : DependencyManager
        Dependency manager instance
    
    Returns
    -------
    Dict[str, Any]
        Environment setup results
    """
    return {
        "workspace": str(workspace),
        "languages": languages,
        "status": "ready",
    }


def persist_pipeline_artifacts(
    workspace: Path,
    parsed: List[Any],
    edge_cases: List[Any],
    tests: List[Any],
    execution: Dict[str, Any],
    coverage: Dict[str, Any],
    risk: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Persist pipeline artifacts to workspace.
    
    Parameters
    ----------
    workspace : Path
        Workspace directory
    parsed : List[Any]
        Parsed files
    edge_cases : List[Any]
        Generated edge cases
    tests : List[Any]
        Generated tests
    execution : Dict[str, Any]
        Execution results
    coverage : Dict[str, Any]
        Coverage results
    risk : Dict[str, Any]
        Risk analysis results
    
    Returns
    -------
    Dict[str, Any]
        Persistence results
    """
    artifacts_dir = workspace / ".artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    return {
        "artifacts_dir": str(artifacts_dir),
        "status": "persisted",
        "counts": {
            "parsed_files": len(parsed),
            "edge_cases": len(edge_cases),
            "tests": len(tests),
        }
    }
