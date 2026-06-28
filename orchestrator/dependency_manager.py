"""Dependency manager for handling project dependencies."""
from pathlib import Path
from typing import List, Dict, Any


class DependencyManager:
    """Manages project dependencies detection and setup."""
    
    def __init__(self, repo_dir: Path):
        self.repo_dir = Path(repo_dir)
    
    def detect_dependencies(self) -> Dict[str, List[str]]:
        """Detect project dependencies."""
        dependencies = {}
        
        # Check for Python dependencies
        if (self.repo_dir / "requirements.txt").exists():
            dependencies["python"] = self._parse_requirements()
        
        # Check for Node dependencies
        if (self.repo_dir / "package.json").exists():
            dependencies["node"] = ["nodejs"]
        
        # Check for Java dependencies
        if (self.repo_dir / "pom.xml").exists():
            dependencies["java"] = ["maven"]
        elif (self.repo_dir / "build.gradle").exists():
            dependencies["java"] = ["gradle"]
        
        return dependencies
    
    def _parse_requirements(self) -> List[str]:
        """Parse requirements.txt file."""
        req_file = self.repo_dir / "requirements.txt"
        if req_file.exists():
            try:
                with open(req_file, "r") as f:
                    return [line.strip() for line in f if line.strip() and not line.startswith("#")]
            except Exception:
                pass
        return []
    
    def setup_environment(self) -> Dict[str, Any]:
        """Setup execution environment."""
        return {"status": "ready", "dependencies_detected": self.detect_dependencies()}
