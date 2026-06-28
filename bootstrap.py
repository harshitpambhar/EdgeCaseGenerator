"""
Path bootstrap — call bootstrap() once at process start to make all
hyphenated service directories importable under their underscore aliases.

Usage (in any entry-point or orchestrator):
    from bootstrap import bootstrap
    bootstrap()
"""
from __future__ import annotations

import sys
from pathlib import Path
import importlib.util
from types import ModuleType

_ROOT = Path(__file__).resolve().parent

_SERVICE_DIRS = [
    "shared",
    "repository-scanner",
    "parser-engine",
    "edge-case-engine",
    "test-generation",
    "test-execution",
    "coverage-analysis",
    "risk-analysis",
    "report-generator",
    "orchestrator",
]

# Services that don't exist in this repo but are referenced
_OPTIONAL_SERVICE_DIRS = [
    "ml-service",
    "risk-analysis-service",
    "coverage-analysis-service",
]


def bootstrap() -> None:
    """Add services to sys.path and create underscore aliases for hyphenated names."""
    # Add all service directories to sys.path
    for service in _SERVICE_DIRS:
        service_path = _ROOT / service
        if service_path.exists():
            path_str = str(service_path)
            if path_str not in sys.path:
                sys.path.insert(0, path_str)
        
        # Create underscore alias for hyphenated service names
        if "-" in service:
            underscore_name = service.replace("-", "_")
            hyphenated_dir = _ROOT / service
            
            # Create a package module for the hyphenated directory
            if hyphenated_dir.exists() and hyphenated_dir.is_dir():
                # Load __init__.py if it exists, else create empty module
                init_file = hyphenated_dir / "__init__.py"
                if init_file.exists():
                    spec = importlib.util.spec_from_file_location(
                        underscore_name, init_file
                    )
                    if spec and spec.loader:
                        module = importlib.util.module_from_spec(spec)
                        sys.modules[underscore_name] = module
                        spec.loader.exec_module(module)
                else:
                    # Create empty package module
                    module = ModuleType(underscore_name)
                    module.__path__ = [str(hyphenated_dir)]
                    module.__file__ = str(hyphenated_dir / "__init__.py")
                    sys.modules[underscore_name] = module
    
    # Optional services (don't fail if missing)
    for service in _OPTIONAL_SERVICE_DIRS:
        service_path = _ROOT / service
        if service_path.exists():
            path_str = str(service_path)
            if path_str not in sys.path:
                sys.path.insert(0, path_str)
