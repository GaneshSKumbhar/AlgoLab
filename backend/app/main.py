"""
AlgoLab FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.algorithms import router as algo_router
from app.api.benchmark import router as bench_router
from app.api.advisor import router as advisor_router

app = FastAPI(
    title="AlgoLab API",
    description="Interactive Algorithmic Problem Solver — DAA Platform",
    version="1.0.0",
)

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(algo_router)
app.include_router(bench_router)
app.include_router(advisor_router)


@app.get("/")
def root():
    return {
        "name": "AlgoLab API",
        "version": "1.0.0",
        "docs": "/docs",
        "algorithms": "/api/algorithms",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
