"""Pipeline stages for the orchestrator."""
from pathlib import Path
from typing import Any, Dict, List
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
    files: List[Dict[str, Any]],
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
            if result is not None:
                parsed.append(result)
            else:
                errors.append({"file": str(file_path), "error": "Parser returned no result"})
                log.warning(f"Parser returned no result for {file_path}")
        except Exception as e:
            errors.append({"file": str(file_path), "error": str(e)})
            log.warning(f"Failed to parse {file_path}: {e}")
    
    return parsed, errors
