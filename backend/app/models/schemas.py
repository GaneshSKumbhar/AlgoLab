"""
Pydantic Schemas — Request/Response models for AlgoLab API
"""
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Visualize ─────────────────────────────────────────────────────────────────

class SortRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm ID: merge_sort | quick_sort | randomized_quick_sort | linear_search | binary_search")
    array: list[int] = Field(..., min_length=1, max_length=200)
    target: Optional[int] = None  # for search algorithms


class GraphRequest(BaseModel):
    algorithm: str
    nodes: list[str]
    edges: list[tuple[str, str, float]] = []
    adjacency: dict[str, list[str]] = {}   # unweighted
    start: str = ""
    end: str = ""


class DPRequest(BaseModel):
    algorithm: str
    # Knapsack
    weights: list[int] = []
    values: list[int] = []
    capacity: int = 0
    # LCS / String
    string1: str = ""
    string2: str = ""
    # Coin Change
    coins: list[int] = []
    amount: int = 0
    # Floyd-Warshall
    nodes: list[str] = []
    edges: list[tuple[str, str, float]] = []


class BacktrackRequest(BaseModel):
    algorithm: str
    n: int = Field(8, ge=1, le=15)
    max_solutions: int = Field(5, ge=1, le=20)


class GreedyRequest(BaseModel):
    algorithm: str
    # Activity Selection
    activities: list[tuple[int, int, str]] = []
    # Fractional Knapsack
    weights: list[float] = []
    values: list[float] = []
    capacity: float = 0.0
    # Huffman
    text: str = ""


class VisualizeResponse(BaseModel):
    algorithm: str
    events: list[dict[str, Any]]
    result: Any
    metrics: dict[str, int]
    success: bool = True
    error: Optional[str] = None


# ── Benchmark ─────────────────────────────────────────────────────────────────

class BenchmarkRequest(BaseModel):
    algorithms: list[str]
    input_sizes: list[int] = Field(default=[10, 20, 50, 100, 200, 500])
    category: str = "sorting"
    trials: int = Field(3, ge=1, le=10)


class BenchmarkResponse(BaseModel):
    results: list[dict[str, Any]]
    category: str


# ── Paradigm Advisor ──────────────────────────────────────────────────────────

class AdvisorRequest(BaseModel):
    is_graph_problem: bool = False
    is_optimization: bool = False
    needs_exact_solution: bool = True
    has_overlapping_subproblems: bool = False
    has_optimal_substructure: bool = False
    has_greedy_choice_property: bool = False
    needs_exhaustive_search: bool = False
    is_weighted_graph: bool = False
    has_negative_weights: bool = False
    is_directed: bool = False
    is_dag: bool = False
    is_bipartite: bool = False
    needs_flow: bool = False
    needs_mst: bool = False
    needs_shortest_path: bool = False
    needs_traversal: bool = False
    needs_topological_order: bool = False
    input_size: str = "medium"
    num_variables: int = 0
    has_constraints: bool = False
    is_partitioning: bool = False
    is_scheduling: bool = False
    is_assignment: bool = False
    is_covering: bool = False
    is_tsp_like: bool = False
    is_knapsack_like: bool = False
    is_string_problem: bool = False
    is_sorting: bool = False
    is_searching: bool = False
    suspected_np_hard: bool = False


class AdvisorResponse(BaseModel):
    paradigm_scores: list[dict[str, Any]]
    algorithm_recommendations: list[dict[str, Any]]
    top_paradigm: Optional[str]
    explanation: str
