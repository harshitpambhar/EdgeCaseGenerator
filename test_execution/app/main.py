"""
Test Execution Engine - FastAPI application.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router


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
