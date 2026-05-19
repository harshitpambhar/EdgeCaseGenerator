"""Workspace manager for handling temporary workspace operations."""
import json
import shutil
from pathlib import Path
from shared.utils.logger import get_logger

log = get_logger(__name__)


class WorkspaceManager:
    """Manages workspace lifecycle and checkpoints."""
    
    def __init__(self, workspace_path: Path, job_id: str):
        self.workspace_path = workspace_path
        self.job_id = job_id
        self.checkpoint_dir = workspace_path / ".checkpoints"
        self.artifacts_dir = workspace_path / ".artifacts"
    
    def initialize(self):
        """Initialize workspace directories."""
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    def save_checkpoint(self, stage_name: str, data):
        """Save checkpoint data for recovery."""
        checkpoint_file = self.checkpoint_dir / f"{stage_name}.json"
        try:
            with open(checkpoint_file, "w") as f:
                json.dump(data, f, indent=2, default=str)
            log.debug(f"Checkpoint saved: {stage_name}")
        except Exception as e:
            log.error(f"Failed to save checkpoint {stage_name}: {e}")
    
    def load_checkpoint(self, stage_name: str):
        """Load checkpoint data."""
        checkpoint_file = self.checkpoint_dir / f"{stage_name}.json"
        if checkpoint_file.exists():
            try:
                with open(checkpoint_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                log.error(f"Failed to load checkpoint {stage_name}: {e}")
        return None
    
    def save_artifact(self, artifact_name: str, data):
        """
        Save artifact data for later reference.
        
        Parameters
        ----------
        artifact_name : str
            Name of the artifact
        data : Any
            Data to save (will be JSON serialized if dict/list)
        """
        artifact_file = self.artifacts_dir / f"{artifact_name}.json"
        try:
            with open(artifact_file, "w") as f:
                json.dump(data, f, indent=2, default=str)
            log.debug(f"Artifact saved: {artifact_name}")
        except Exception as e:
            log.error(f"Failed to save artifact {artifact_name}: {e}")
    
    def load_artifact(self, artifact_name: str):
        """
        Load artifact data.
        
        Parameters
        ----------
        artifact_name : str
            Name of the artifact
        
        Returns
        -------
        Any or None
            Artifact data or None if not found
        """
        artifact_file = self.artifacts_dir / f"{artifact_name}.json"
        if artifact_file.exists():
            try:
                with open(artifact_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                log.error(f"Failed to load artifact {artifact_name}: {e}")
        return None
    
    def list_checkpoints(self):
        """
        List all checkpoints.
        
        Returns
        -------
        list
            List of checkpoint names
        """
        if self.checkpoint_dir.exists():
            return [f.stem for f in self.checkpoint_dir.glob("*.json")]
        return []
    
    def list_artifacts(self):
        """
        List all artifacts.
        
        Returns
        -------
        list
            List of artifact names
        """
        if self.artifacts_dir.exists():
            return [f.stem for f in self.artifacts_dir.glob("*.json")]
        return []
    
    def cleanup(self):
        """Clean up workspace directory."""
        try:
            if self.workspace_path.exists():
                shutil.rmtree(self.workspace_path)
                log.info(f"Workspace cleaned: {self.workspace_path}")
        except Exception as e:
            log.error(f"Failed to cleanup workspace: {e}")
    
    def summary(self) -> dict:
        """
        Get workspace summary.
        
        Returns
        -------
        dict
            Summary containing job_id, workspace path, checkpoints, and artifacts
        """
        return {
            "job_id": self.job_id,
            "workspace_path": str(self.workspace_path),
            "checkpoints": self.list_checkpoints(),
            "artifacts": self.list_artifacts(),
            "checkpoint_dir": str(self.checkpoint_dir),
            "artifacts_dir": str(self.artifacts_dir),
        }
