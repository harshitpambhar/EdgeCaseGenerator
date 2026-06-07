"""Mounted workspace path helpers for the stateless ML engine."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class WorkspaceLayout:
    repo_path: Path
    workspace_root: Path
    generated_tests_dir: Path
    reports_dir: Path
    coverage_dir: Path
    logs_dir: Path

    def ensure_directories(self) -> "WorkspaceLayout":
        for directory in (
            self.generated_tests_dir,
            self.reports_dir,
            self.coverage_dir,
            self.logs_dir,
        ):
            directory.mkdir(parents=True, exist_ok=True)
        return self


def build_workspace_layout(repo_path: str | Path) -> WorkspaceLayout:
    repo = Path(repo_path).expanduser().resolve()
    if not repo.is_dir():
        raise ValueError(f"Repository path does not exist: {repo}")

    workspace_root = repo.parent
    return WorkspaceLayout(
        repo_path=repo,
        workspace_root=workspace_root,
        generated_tests_dir=workspace_root / "generated_tests",
        reports_dir=workspace_root / "reports",
        coverage_dir=workspace_root / "coverage",
        logs_dir=workspace_root / "logs",
    )
