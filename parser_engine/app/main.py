"""
Parser Engine - FastAPI application.

Wraps existing parser dispatcher with HTTP routes.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router


# Create app
app = create_app(
    title="Parser Engine",
    description="Service for parsing source code files and extracting AST information",
    version="0.1.0",
)

# Add health routes
add_health_routes(app, "parser-engine")

# Include routes
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    """Service info."""
    return {
        "service": "parser-engine",
        "version": "0.1.0",
        "docs": "/docs",
    }
