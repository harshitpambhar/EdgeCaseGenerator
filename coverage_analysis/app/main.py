"""
Coverage Analysis Engine - FastAPI application.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router


app = create_app(
    title="Coverage Analysis",
    description="Service for analyzing test coverage",
    version="0.1.0",
)

add_health_routes(app, "coverage-analysis")
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    return {"service": "coverage-analysis", "version": "0.1.0", "docs": "/docs"}
