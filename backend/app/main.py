"""AlgoLab FastAPI application entry point."""
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.api.algorithms import router as algo_router
from app.api.benchmark import router as bench_router
from app.api.advisor import router as advisor_router
from app.api.auth import router as auth_router

STATIC_DIR = Path(__file__).resolve().parents[1] / "static"
DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", DEFAULT_ORIGINS).split(",") if origin.strip()]

app = FastAPI(
    title="AlgoLab API",
    description="Interactive Algorithmic Problem Solver — DAA Platform",
    version="1.0.0",
)

# CORS is used during local development or when a separately-hosted frontend is configured.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(algo_router)
app.include_router(bench_router)
app.include_router(advisor_router)
app.include_router(auth_router)


@app.get("/")
def root():
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {
        "name": "AlgoLab API",
        "version": "1.0.0",
        "docs": "/docs",
        "algorithms": "/api/algorithms",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/{frontend_path:path}", include_in_schema=False)
def frontend(frontend_path: str):
    """Serve the compiled React app and preserve client-side routes on refresh."""
    index_file = STATIC_DIR / "index.html"
    requested_file = (STATIC_DIR / frontend_path).resolve()
    if STATIC_DIR.is_dir() and requested_file.is_relative_to(STATIC_DIR.resolve()) and requested_file.is_file():
        return FileResponse(requested_file)
    if index_file.is_file():
        return FileResponse(index_file)
    return {"detail": "Not Found"}
