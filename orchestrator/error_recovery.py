"""Error recovery and execution tracking."""
from typing import Any, Callable
from shared.utils.logger import get_logger

log = get_logger(__name__)


class ExecutionTracker:
    """Tracks pipeline stage execution and handles failures."""
    
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.stages = {}
    
    def execute_stage(self, stage_name: str, stage_func: Callable) -> Any:
        """
        Execute a pipeline stage with error tracking.
        
        Parameters
        ----------
        stage_name : str
            Name of the stage
        stage_func : Callable
            Function to execute
        
        Returns
        -------
        Any
            Result from stage_func
        """
        try:
            log.info(f"Starting stage: {stage_name}")
            result = stage_func()
            self.stages[stage_name] = {"status": "success", "result": result}
            log.info(f"Completed stage: {stage_name}")
            return result
        except Exception as e:
            log.error(f"Failed stage {stage_name}: {e}", exc_info=True)
            self.stages[stage_name] = {"status": "failed", "error": str(e)}
            raise
    
    def summary(self) -> dict:
        """
        Get execution summary of all stages.
        
        Returns
        -------
        dict
            Summary containing total stages, successful, failed, and stage details
        """
        successful = sum(1 for s in self.stages.values() if s["status"] == "success")
        failed = sum(1 for s in self.stages.values() if s["status"] == "failed")
        
        return {
            "job_id": self.job_id,
            "total_stages": len(self.stages),
            "successful_stages": successful,
            "failed_stages": failed,
            "stages": self.stages,
        }
