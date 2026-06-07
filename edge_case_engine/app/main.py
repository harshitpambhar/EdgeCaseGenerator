sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
"""
Edge Case Engine - FastAPI application.

Wraps existing edge case generator with HTTP routes.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router


app = create_app(
    title="Edge Case Engine",
    description="Service for generating edge cases for test conditions",
    version="0.1.0",
)

add_health_routes(app, "edge-case-engine")
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    return {"service": "edge-case-engine", "version": "0.1.0", "docs": "/docs"}
