"""
Test Generation Engine - FastAPI application.
"""
import sys
from pathlib import Path

"""
Test Generation - FastAPI application.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router
    version="0.1.0",
)

add_health_routes(app, "test-generation")
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    return {"service": "test-generation", "version": "0.1.0", "docs": "/docs"}
