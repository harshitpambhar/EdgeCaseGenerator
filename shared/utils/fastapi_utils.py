"""
Simple shared utilities for FastAPI services.

Provides minimal helpers - no complex abstractions.
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime


def create_app(title: str, description: str = "", version: str = "0.1.0") -> FastAPI:
    """Create a FastAPI app with basic configuration."""
    return FastAPI(
        title=title,
        description=description,
        version=version,
        docs_url="/docs",
        redoc_url="/redoc",
    )


def add_health_routes(app: FastAPI, service_name: str):
    """Add simple health check routes."""
    
    @app.get("/health", tags=["Health"])
    def health():
        """Service health check."""
        return {"status": "ok", "service": service_name}
    
    @app.get("/ping", tags=["Health"])
    def ping():
        """Simple ping endpoint."""
        return {"pong": True}
    
    @app.get("/status", tags=["Health"])
    def status():
        """Service status with uptime."""
        return {
            "status": "ok",
            "service": service_name,
            "timestamp": datetime.now().isoformat(),
        }
