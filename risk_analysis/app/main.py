sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
"""
Risk Analysis Engine - FastAPI application.
"""
from __future__ import annotations

from shared.utils.fastapi_utils import create_app, add_health_routes
from .routes import router


app = create_app(
    title="Risk Analysis",
    description="Service for analyzing code risk and complexity",
    version="0.1.0",
)

add_health_routes(app, "risk-analysis")
app.include_router(router)


@app.get("/", tags=["Info"])
def root():
    return {"service": "risk-analysis", "version": "0.1.0", "docs": "/docs"}
