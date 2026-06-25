"""
SpaceSort - Main FastAPI Application
Serves the React frontend and provides REST API endpoints.
"""

import os
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routers import auth, plans, admin, payments

app = FastAPI(
    title="SpaceSort API",
    description="AI-powered space organization service",
    version="0.1.0",
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ──────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(admin.router)
app.include_router(payments.router)

# ── Health check ─────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}


# ── Initialize database on startup ──────────────────────────────
@app.on_event("startup")
async def startup():
    init_db()
    print("✅ Database initialized")


# ── Serve static frontend (if built) ────────────────────────────
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
    print(f"✅ Serving frontend from {frontend_dist}")
else:
    print("ℹ️  Frontend not built yet - API-only mode. Build with: cd frontend && npm run build")

    @app.get("/")
    def root():
        return {
            "message": "SpaceSort API is running",
            "docs": "/docs",
            "frontend": "Build the frontend with: cd frontend && npm install && npm run build",
        }