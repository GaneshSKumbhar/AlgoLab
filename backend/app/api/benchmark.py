"""
Benchmark API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.auth.service import current_user
from app.models.schemas import BenchmarkRequest, BenchmarkResponse
from app.benchmark.runner import benchmark_sorting, benchmark_graph, benchmark_dp

router = APIRouter(prefix="/api", tags=["benchmark"])


@router.post("/benchmark", response_model=BenchmarkResponse)
def run_benchmark(req: BenchmarkRequest, _: str = Depends(current_user)):
    if not req.algorithms:
        raise HTTPException(status_code=400, detail="At least one algorithm required.")
    if not req.input_sizes:
        raise HTTPException(status_code=400, detail="At least one input size required.")

    # Cap to avoid hanging
    safe_sizes = [s for s in req.input_sizes if s <= 2000]

    try:
        if req.category == "sorting":
            results = benchmark_sorting(req.algorithms, safe_sizes, req.trials)
        elif req.category == "graph":
            safe_sizes = [s for s in safe_sizes if s <= 200]  # graph is heavier
            results = benchmark_graph(req.algorithms, safe_sizes, req.trials)
        elif req.category == "dp":
            safe_sizes = [s for s in safe_sizes if s <= 500]
            results = benchmark_dp(req.algorithms, safe_sizes, req.trials)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown category: {req.category}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return BenchmarkResponse(results=results, category=req.category)
