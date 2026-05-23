"""
Repository cloning is intentionally disabled in the stateless ML engine.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.utils.logger import get_logger

log = get_logger(__name__)


def clone_repository(*_args, **_kwargs) -> Path:
    """
    Repository cloning is handled by the outer orchestrator.

    This function now fails fast so the Python ML engine cannot silently
    reintroduce host or Docker lifecycle responsibilities.
    """
    raise RuntimeError("Repository cloning is disabled; pass a mounted repo_path instead.")
