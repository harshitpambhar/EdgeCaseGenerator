"""
Test Execution Engine - FastAPI application.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from shared.utils.fastapi_utils import create_app, add_health_routes
from app.routes import router


app = create_app(
    title="Test Execution",
    description="Service for executing test files",
    version="0.1.0",
)

add_health_routes(app, "test-execution")
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    return {"service": "test-execution", "version": "0.1.0", "docs": "/docs"}
