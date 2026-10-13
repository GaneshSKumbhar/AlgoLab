"""
API Routes — /api/algorithms and /api/visualize
"""
from fastapi import APIRouter, HTTPException
from app.algorithms.registry import ALGORITHMS
from app.models.schemas import (
    SortRequest, GraphRequest, DPRequest, BacktrackRequest,
    GreedyRequest, VisualizeResponse,
)
from app.tracer import Tracer

router = APIRouter(prefix="/api", tags=["algorithms"])


@router.get("/algorithms")
def list_algorithms():
    return {"algorithms": list(ALGORITHMS.values())}


@router.get("/algorithms/{algo_id}")
def get_algorithm(algo_id: str):
    if algo_id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail=f"Algorithm '{algo_id}' not found.")
    return ALGORITHMS[algo_id]


@router.post("/visualize/sort", response_model=VisualizeResponse)
def visualize_sort(req: SortRequest):
    tracer = Tracer()
    try:
        if req.algorithm == "merge_sort":
            from app.algorithms.sorting.merge_sort import merge_sort
            result = merge_sort(req.array, tracer)
        elif req.algorithm == "quick_sort":
            from app.algorithms.sorting.quick_sort import quick_sort
            result = quick_sort(req.array, tracer)
        elif req.algorithm == "randomized_quick_sort":
            from app.algorithms.sorting.quick_sort import randomized_quick_sort
            result = randomized_quick_sort(req.array, tracer)
        elif req.algorithm == "binary_search":
            if req.target is None:
                raise HTTPException(status_code=400, detail="target required for binary_search")
            from app.algorithms.searching.binary_search import binary_search
            result = binary_search(req.array, req.target, tracer)
        elif req.algorithm == "linear_search":
            if req.target is None:
                raise HTTPException(status_code=400, detail="target required for linear_search")
            from app.algorithms.searching.linear_search import linear_search
            result = linear_search(req.array, req.target, tracer)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {req.algorithm}")
    except HTTPException:
        raise
    except Exception as e:
        return VisualizeResponse(
            algorithm=req.algorithm, events=[], result=None,
            metrics={}, success=False, error=str(e)
        )

    return VisualizeResponse(
        algorithm=req.algorithm,
        events=tracer.get_events(),
        result=result,
        metrics=tracer.get_metrics(),
        success=True,
    )


@router.post("/visualize/graph", response_model=VisualizeResponse)
def visualize_graph(req: GraphRequest):
    tracer = Tracer()
    try:
        if req.algorithm == "bfs":
            from app.algorithms.graph.bfs import bfs
            result = bfs(req.adjacency, req.start, tracer)
        elif req.algorithm == "dfs":
            from app.algorithms.graph.dfs import dfs
            result = dfs(req.adjacency, req.start, tracer)
        elif req.algorithm == "topological_sort":
            from app.algorithms.graph.dfs import topological_sort
            result = topological_sort(req.adjacency, tracer)
        elif req.algorithm == "dijkstra":
            # Convert edges to adjacency dict with weights
            graph = _edges_to_weighted_adj(req.nodes, req.edges)
            from app.algorithms.graph.dijkstra import dijkstra, reconstruct_path
            dist, pred = dijkstra(graph, req.start, tracer)
            path = reconstruct_path(pred, req.start, req.end) if req.end else []
            result = {"distances": dist, "path": path}
        elif req.algorithm == "bellman_ford":
            from app.algorithms.graph.bellman_ford import bellman_ford
            dist, pred, neg_cycle = bellman_ford(req.nodes, req.edges, req.start, tracer)
            result = {"distances": dist, "negative_cycle": neg_cycle}
        elif req.algorithm == "kruskal":
            from app.algorithms.graph.kruskal import kruskal
            mst, weight = kruskal(req.nodes, req.edges, tracer)
            result = {"mst_edges": mst, "total_weight": weight}
        elif req.algorithm == "prim":
            graph = _edges_to_weighted_adj(req.nodes, req.edges)
            from app.algorithms.graph.prim import prim
            mst, weight = prim(graph, req.start or req.nodes[0], tracer)
            result = {"mst_edges": mst, "total_weight": weight}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {req.algorithm}")
    except HTTPException:
        raise
    except Exception as e:
        return VisualizeResponse(
            algorithm=req.algorithm, events=[], result=None,
            metrics={}, success=False, error=str(e)
        )

    return VisualizeResponse(
        algorithm=req.algorithm,
        events=tracer.get_events(),
        result=result,
        metrics=tracer.get_metrics(),
        success=True,
    )


@router.post("/visualize/dp", response_model=VisualizeResponse)
def visualize_dp(req: DPRequest):
    tracer = Tracer()
    try:
        if req.algorithm == "knapsack_01":
            from app.algorithms.dp.knapsack_01 import knapsack_01
            val, items, table = knapsack_01(req.weights, req.values, req.capacity, tracer)
            result = {"max_value": val, "selected_items": items}
        elif req.algorithm == "lcs":
            from app.algorithms.dp.lcs import lcs
            length, lcs_str, table = lcs(req.string1, req.string2, tracer)
            result = {"length": length, "lcs": lcs_str}
        elif req.algorithm == "coin_change":
            from app.algorithms.dp.coin_change import coin_change
            min_c, used = coin_change(req.coins, req.amount, tracer)
            result = {"min_coins": min_c, "coins_used": used}
        elif req.algorithm == "floyd_warshall":
            from app.algorithms.dp.floyd_warshall import floyd_warshall
            dist, nxt = floyd_warshall(req.nodes, req.edges, tracer)
            # Convert INF to None for JSON
            dist_json = {
                u: {v: (None if val == float("inf") else val) for v, val in row.items()}
                for u, row in dist.items()
            }
            result = {"distances": dist_json}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown DP algorithm: {req.algorithm}")
    except HTTPException:
        raise
    except Exception as e:
        return VisualizeResponse(
            algorithm=req.algorithm, events=[], result=None,
            metrics={}, success=False, error=str(e)
        )

    return VisualizeResponse(
        algorithm=req.algorithm,
        events=tracer.get_events(),
        result=result,
        metrics=tracer.get_metrics(),
        success=True,
    )


@router.post("/visualize/backtrack", response_model=VisualizeResponse)
def visualize_backtrack(req: BacktrackRequest):
    tracer = Tracer()
    try:
        if req.algorithm == "n_queens":
            from app.algorithms.backtracking.n_queens import n_queens
            solutions = n_queens(req.n, tracer, req.max_solutions)
            result = {"solutions": solutions, "count": len(solutions)}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown backtracking algorithm: {req.algorithm}")
    except HTTPException:
        raise
    except Exception as e:
        return VisualizeResponse(
            algorithm=req.algorithm, events=[], result=None,
            metrics={}, success=False, error=str(e)
        )

    return VisualizeResponse(
        algorithm=req.algorithm,
        events=tracer.get_events(),
        result=result,
        metrics=tracer.get_metrics(),
        success=True,
    )


@router.post("/visualize/greedy", response_model=VisualizeResponse)
def visualize_greedy(req: GreedyRequest):
    tracer = Tracer()
    try:
        if req.algorithm == "activity_selection":
            from app.algorithms.greedy.activity_selection import activity_selection
            result = activity_selection(req.activities, tracer)
        elif req.algorithm == "fractional_knapsack":
            from app.algorithms.greedy.activity_selection import fractional_knapsack
            total, taken = fractional_knapsack(req.weights, req.values, req.capacity, tracer)
            result = {"total_value": total, "items_taken": taken}
        elif req.algorithm == "huffman":
            from app.algorithms.greedy.huffman import huffman, huffman_tree_to_dict
            codes, root, freq = huffman(req.text, tracer)
            result = {
                "codes": codes,
                "frequencies": freq,
                "tree": huffman_tree_to_dict(root),
                "compression_ratio": tracer.events[-1].data.get("compression_ratio") if tracer.events else 0,
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unknown greedy algorithm: {req.algorithm}")
    except HTTPException:
        raise
    except Exception as e:
        return VisualizeResponse(
            algorithm=req.algorithm, events=[], result=None,
            metrics={}, success=False, error=str(e)
        )

    return VisualizeResponse(
        algorithm=req.algorithm,
        events=tracer.get_events(),
        result=result,
        metrics=tracer.get_metrics(),
        success=True,
    )


# ── Helpers ────────────────────────────────────────────────────────────────────

def _edges_to_weighted_adj(
    nodes: list[str], edges: list[tuple[str, str, float]]
) -> dict[str, dict[str, float]]:
    graph: dict[str, dict[str, float]] = {n: {} for n in nodes}
    for u, v, w in edges:
        graph[u][v] = w
    return graph
