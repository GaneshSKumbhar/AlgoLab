"""
Paradigm Advisor — Rule-Based Algorithm Recommendation System
=============================================================
Uses problem characteristics to score and recommend paradigms/algorithms.
No ML/AI — purely explainable rule-based logic.
"""
from __future__ import annotations
from enum import Enum
from dataclasses import dataclass, field
from typing import Any


class Paradigm(str, Enum):
    BRUTE_FORCE      = "Brute Force"
    DIVIDE_CONQUER   = "Divide & Conquer"
    DYNAMIC_PROG     = "Dynamic Programming"
    GREEDY           = "Greedy"
    BACKTRACKING     = "Backtracking"
    NETWORK_FLOW     = "Network Flow"
    GRAPH_TRAVERSAL  = "Graph Traversal"
    APPROXIMATION    = "Approximation"


@dataclass
class ProblemCharacteristics:
    # Problem type signals
    is_graph_problem: bool = False
    is_optimization: bool = False
    needs_exact_solution: bool = True
    has_overlapping_subproblems: bool = False
    has_optimal_substructure: bool = False
    has_greedy_choice_property: bool = False
    needs_exhaustive_search: bool = False

    # Graph-specific
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

    # Problem scale signals
    input_size: str = "medium"   # "tiny" | "small" | "medium" | "large" | "huge"
    num_variables: int = 0

    # Problem structure
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

    # Known NP signals
    suspected_np_hard: bool = False


@dataclass
class AlgorithmRecommendation:
    name: str
    paradigm: str
    algorithm_id: str
    score: float
    reason: str
    complexity: str
    suitable: bool = True


@dataclass
class ParadigmScore:
    paradigm: Paradigm
    score: float
    reasons: list[str] = field(default_factory=list)


def recommend(
    chars: ProblemCharacteristics,
) -> dict[str, Any]:
    """
    Main entry point.
    Returns paradigm scores and specific algorithm recommendations.
    """
    scores: dict[Paradigm, ParadigmScore] = {p: ParadigmScore(p, 0.0) for p in Paradigm}

    def add(paradigm: Paradigm, pts: float, reason: str) -> None:
        scores[paradigm].score += pts
        scores[paradigm].reasons.append(reason)

    # ──────────────────────────────────────────────────────────
    # Rule 1: Overlapping subproblems → DP strongly recommended
    # ──────────────────────────────────────────────────────────
    if chars.has_overlapping_subproblems:
        add(Paradigm.DYNAMIC_PROG, 5.0, "Problem has overlapping subproblems — DP eliminates redundant recomputation.")
        add(Paradigm.BRUTE_FORCE, -2.0, "Brute force would recompute the same subproblems repeatedly.")

    if chars.has_optimal_substructure:
        add(Paradigm.DYNAMIC_PROG, 3.0, "Optimal substructure allows optimal solutions to be built from subproblems.")
        add(Paradigm.GREEDY, 2.0, "Optimal substructure is also a prerequisite for greedy correctness.")

    # ──────────────────────────────────────────────────────────
    # Rule 2: Greedy choice property → Greedy
    # ──────────────────────────────────────────────────────────
    if chars.has_greedy_choice_property:
        add(Paradigm.GREEDY, 4.0, "Problem has the greedy-choice property — a locally optimal choice leads to a global optimum.")

    # ──────────────────────────────────────────────────────────
    # Rule 3: Sorting / Searching
    # ──────────────────────────────────────────────────────────
    if chars.is_sorting:
        add(Paradigm.DIVIDE_CONQUER, 5.0, "Sorting is best handled by Divide & Conquer (Merge Sort, Quick Sort).")
        add(Paradigm.BRUTE_FORCE, 1.0, "Brute-force sorting (Bubble/Insertion) works for small inputs.")

    if chars.is_searching:
        add(Paradigm.DIVIDE_CONQUER, 3.0, "Binary Search (Divide & Conquer) provides O(log n) search on sorted data.")
        add(Paradigm.BRUTE_FORCE, 2.0, "Linear search works on unsorted data.")

    # ──────────────────────────────────────────────────────────
    # Rule 4: Graph problems
    # ──────────────────────────────────────────────────────────
    if chars.is_graph_problem:
        add(Paradigm.GRAPH_TRAVERSAL, 3.0, "Graph problem — traversal algorithms (BFS, DFS) are essential.")

    if chars.needs_traversal:
        add(Paradigm.GRAPH_TRAVERSAL, 4.0, "Explicit traversal required — BFS for shortest unweighted path, DFS for connectivity.")

    if chars.needs_topological_order:
        add(Paradigm.GRAPH_TRAVERSAL, 3.0, "Topological ordering needed — use DFS-based topo sort on a DAG.")

    if chars.needs_shortest_path:
        if chars.has_negative_weights:
            add(Paradigm.DYNAMIC_PROG, 4.0, "Negative weights rule out Dijkstra — Bellman-Ford (DP-based) handles them.")
            add(Paradigm.GREEDY, -1.0, "Dijkstra (greedy) is incorrect with negative edge weights.")
        else:
            add(Paradigm.GREEDY, 4.0, "Non-negative weights — Dijkstra (greedy) is optimal.")
            add(Paradigm.DYNAMIC_PROG, 2.0, "Bellman-Ford (DP) also works but is slower: O(VE) vs O((V+E) log V).")

    if chars.needs_mst:
        add(Paradigm.GREEDY, 5.0, "MST is a classic greedy problem — Kruskal and Prim are both optimal greedy algorithms.")

    if chars.needs_flow:
        add(Paradigm.NETWORK_FLOW, 6.0, "Maximum flow / matching explicitly requires network flow algorithms.")

    if chars.is_bipartite:
        add(Paradigm.NETWORK_FLOW, 3.0, "Bipartite matching reduces to max-flow.")

    # ──────────────────────────────────────────────────────────
    # Rule 5: Constraint problems
    # ──────────────────────────────────────────────────────────
    if chars.has_constraints and chars.needs_exhaustive_search:
        add(Paradigm.BACKTRACKING, 5.0, "Constraint satisfaction with exhaustive search — backtracking prunes invalid states.")

    if chars.has_constraints and not chars.needs_exhaustive_search:
        add(Paradigm.GREEDY, 2.0, "Constraints may allow greedy simplification.")
        add(Paradigm.DYNAMIC_PROG, 2.0, "DP can handle constraints if subproblems are well-defined.")

    # ──────────────────────────────────────────────────────────
    # Rule 6: Input size penalties / bonuses
    # ──────────────────────────────────────────────────────────
    size_order = ["tiny", "small", "medium", "large", "huge"]
    size_idx = size_order.index(chars.input_size) if chars.input_size in size_order else 2

    if size_idx >= 3:  # large / huge
        add(Paradigm.BRUTE_FORCE, -4.0, "Large input — brute force is infeasible.")
        add(Paradigm.BACKTRACKING, -2.0, "Large input — backtracking may be too slow without good pruning.")
    elif size_idx <= 1:  # tiny / small
        add(Paradigm.BRUTE_FORCE, 2.0, "Small input — brute force is acceptable and simplest.")

    # ──────────────────────────────────────────────────────────
    # Rule 7: NP-hard suspected
    # ──────────────────────────────────────────────────────────
    if chars.suspected_np_hard:
        add(Paradigm.APPROXIMATION, 5.0, "Problem appears NP-hard — exact algorithms are exponential. Consider approximation algorithms.")
        add(Paradigm.BACKTRACKING, 3.0, "Backtracking with pruning is a practical exact approach for small NP-hard instances.")
        add(Paradigm.GREEDY, 2.0, "Greedy heuristics provide fast, near-optimal solutions for NP-hard problems.")
        add(Paradigm.DYNAMIC_PROG, 1.0, "DP may provide exact solutions for small instances (e.g., Held-Karp for TSP).")

    if chars.is_tsp_like:
        add(Paradigm.DYNAMIC_PROG, 3.0, "TSP-like: Held-Karp DP gives O(2^n · n²) exact solution for small n.")
        add(Paradigm.GREEDY, 2.0, "Nearest-neighbor greedy heuristic gives ~25% approximation quickly.")
        add(Paradigm.APPROXIMATION, 3.0, "Christofides algorithm gives 3/2 approximation for metric TSP.")

    if chars.is_knapsack_like:
        add(Paradigm.DYNAMIC_PROG, 4.0, "Knapsack-like: DP solves 0/1 Knapsack exactly in O(n·W).")
        add(Paradigm.GREEDY, 3.0, "Greedy by value/weight ratio is optimal for Fractional Knapsack.")

    if chars.is_scheduling:
        add(Paradigm.GREEDY, 4.0, "Scheduling problems often have greedy solutions (e.g., earliest-deadline-first).")
        add(Paradigm.BACKTRACKING, 2.0, "Backtracking handles complex scheduling with hard constraints.")

    if chars.is_string_problem:
        add(Paradigm.DYNAMIC_PROG, 4.0, "String problems (LCS, edit distance) are classic DP problems.")

    # ──────────────────────────────────────────────────────────
    # Sort paradigms
    # ──────────────────────────────────────────────────────────
    ranked = sorted(scores.values(), key=lambda s: s.score, reverse=True)
    ranked_positive = [s for s in ranked if s.score > 0]

    # ──────────────────────────────────────────────────────────
    # Map paradigms to specific algorithms
    # ──────────────────────────────────────────────────────────
    algo_recs: list[AlgorithmRecommendation] = _map_to_algorithms(chars, ranked_positive)

    return {
        "paradigm_scores": [
            {
                "paradigm": s.paradigm.value,
                "score": round(s.score, 2),
                "reasons": s.reasons,
            }
            for s in ranked_positive[:5]
        ],
        "algorithm_recommendations": [
            {
                "name": a.name,
                "paradigm": a.paradigm,
                "algorithm_id": a.algorithm_id,
                "score": round(a.score, 2),
                "reason": a.reason,
                "complexity": a.complexity,
                "suitable": a.suitable,
            }
            for a in algo_recs[:6]
        ],
        "top_paradigm": ranked_positive[0].paradigm.value if ranked_positive else None,
        "explanation": _generate_explanation(chars, ranked_positive, algo_recs),
    }


def _map_to_algorithms(
    chars: ProblemCharacteristics,
    paradigm_scores: list[ParadigmScore],
) -> list[AlgorithmRecommendation]:
    recs: list[AlgorithmRecommendation] = []

    top_paradigms = {s.paradigm for s in paradigm_scores[:3]}

    if Paradigm.GREEDY in top_paradigms:
        if chars.needs_shortest_path and not chars.has_negative_weights:
            recs.append(AlgorithmRecommendation(
                "Dijkstra", "Greedy", "dijkstra", 5.0,
                "Optimal for single-source shortest path with non-negative weights.",
                "O((V+E) log V)"
            ))
        if chars.needs_mst:
            recs.append(AlgorithmRecommendation(
                "Kruskal", "Greedy", "kruskal", 4.5,
                "Sort edges and use Union-Find — ideal for sparse graphs.",
                "O(E log E)"
            ))
            recs.append(AlgorithmRecommendation(
                "Prim", "Greedy", "prim", 4.0,
                "Grow MST greedily — ideal for dense graphs.",
                "O((V+E) log V)"
            ))
        if chars.is_knapsack_like:
            recs.append(AlgorithmRecommendation(
                "Fractional Knapsack", "Greedy", "fractional_knapsack", 4.0,
                "Greedy by value/weight ratio gives optimal fractional solution.",
                "O(n log n)"
            ))
        if chars.is_scheduling:
            recs.append(AlgorithmRecommendation(
                "Activity Selection", "Greedy", "activity_selection", 4.0,
                "Select activities by earliest finish time — provably optimal.",
                "O(n log n)"
            ))

    if Paradigm.DYNAMIC_PROG in top_paradigms:
        if chars.needs_shortest_path and chars.has_negative_weights:
            recs.append(AlgorithmRecommendation(
                "Bellman-Ford", "Dynamic Programming", "bellman_ford", 5.0,
                "Handles negative weights — detects negative cycles. O(VE).",
                "O(V·E)"
            ))
        if chars.is_tsp_like:
            recs.append(AlgorithmRecommendation(
                "Held-Karp TSP", "Dynamic Programming", "held_karp", 4.0,
                "Exact TSP via bitmask DP — O(2^n · n²), feasible for n ≤ 20.",
                "O(2^n · n²)"
            ))
        if chars.is_knapsack_like:
            recs.append(AlgorithmRecommendation(
                "0/1 Knapsack DP", "Dynamic Programming", "knapsack_01", 5.0,
                "Exact solution via DP table. Pseudo-polynomial O(n·W).",
                "O(n·W)"
            ))
        if chars.is_string_problem:
            recs.append(AlgorithmRecommendation(
                "LCS", "Dynamic Programming", "lcs", 4.5,
                "Classic DP for longest common subsequence.",
                "O(m·n)"
            ))
        if chars.needs_shortest_path and not chars.has_negative_weights:
            recs.append(AlgorithmRecommendation(
                "Floyd-Warshall", "Dynamic Programming", "floyd_warshall", 3.5,
                "All-pairs shortest path — use when many source/target pairs needed.",
                "O(V³)"
            ))
        recs.append(AlgorithmRecommendation(
            "Coin Change", "Dynamic Programming", "coin_change", 3.0,
            "Minimum coins to reach target — classic unbounded DP.",
            "O(amount · |coins|)"
        ))

    if Paradigm.DIVIDE_CONQUER in top_paradigms:
        if chars.is_sorting:
            recs.append(AlgorithmRecommendation(
                "Merge Sort", "Divide & Conquer", "merge_sort", 5.0,
                "Guaranteed O(n log n) with stable sort and O(n) extra space.",
                "O(n log n)"
            ))
            recs.append(AlgorithmRecommendation(
                "Quick Sort", "Divide & Conquer", "quick_sort", 4.5,
                "O(n log n) average with O(log n) space — best practical sorter.",
                "O(n log n) avg"
            ))
        if chars.is_searching:
            recs.append(AlgorithmRecommendation(
                "Binary Search", "Divide & Conquer", "binary_search", 5.0,
                "O(log n) search on sorted arrays — optimal.",
                "O(log n)"
            ))

    if Paradigm.GRAPH_TRAVERSAL in top_paradigms:
        if chars.needs_traversal:
            recs.append(AlgorithmRecommendation(
                "BFS", "Graph Traversal", "bfs", 4.5,
                "Shortest path in unweighted graphs. Level-by-level exploration.",
                "O(V+E)"
            ))
            recs.append(AlgorithmRecommendation(
                "DFS", "Graph Traversal", "dfs", 4.0,
                "Connectivity, cycle detection, topological sort.",
                "O(V+E)"
            ))
        if chars.needs_topological_order:
            recs.append(AlgorithmRecommendation(
                "Topological Sort", "Graph Traversal", "topological_sort", 5.0,
                "Linear ordering of a DAG — essential for dependency resolution.",
                "O(V+E)"
            ))

    if Paradigm.BACKTRACKING in top_paradigms:
        if chars.has_constraints and chars.needs_exhaustive_search:
            recs.append(AlgorithmRecommendation(
                "N-Queens", "Backtracking", "n_queens", 4.0,
                "Backtracking with constraint propagation for placement problems.",
                "O(N!)"
            ))

    if Paradigm.NETWORK_FLOW in top_paradigms:
        if chars.needs_flow:
            recs.append(AlgorithmRecommendation(
                "Edmonds-Karp (BFS Max-Flow)", "Network Flow", "edmonds_karp", 5.0,
                "O(VE²) — guaranteed polynomial max-flow using BFS augmentation.",
                "O(V·E²)"
            ))
        if chars.is_bipartite or chars.is_assignment:
            recs.append(AlgorithmRecommendation(
                "Bipartite Matching", "Network Flow", "bipartite_matching", 4.5,
                "Reduces to max-flow — finds maximum matching in bipartite graph.",
                "O(V·E)"
            ))

    if Paradigm.BRUTE_FORCE in top_paradigms or chars.input_size in ("tiny", "small"):
        if chars.is_searching:
            recs.append(AlgorithmRecommendation(
                "Linear Search", "Brute Force", "linear_search", 2.0,
                "Simple O(n) search — works on unsorted arrays.",
                "O(n)"
            ))

    # Deduplicate by algorithm_id, keep highest score
    seen: set[str] = set()
    unique_recs: list[AlgorithmRecommendation] = []
    for r in sorted(recs, key=lambda x: x.score, reverse=True):
        if r.algorithm_id not in seen:
            seen.add(r.algorithm_id)
            unique_recs.append(r)

    return unique_recs


def _generate_explanation(
    chars: ProblemCharacteristics,
    paradigm_scores: list[ParadigmScore],
    algo_recs: list[AlgorithmRecommendation],
) -> str:
    if not paradigm_scores:
        return "Unable to classify the problem with the given characteristics. Please provide more details."

    top = paradigm_scores[0]
    top_algo = algo_recs[0] if algo_recs else None

    lines = [
        f"**Primary Recommendation: {top.paradigm.value}**",
        "",
        "Key reasons:",
    ]
    for reason in top.reasons[:3]:
        lines.append(f"- {reason}")

    if top_algo:
        lines.append("")
        lines.append(f"**Suggested starting algorithm: {top_algo.name}** ({top_algo.complexity})")
        lines.append(f"{top_algo.reason}")

    if len(paradigm_scores) > 1:
        second = paradigm_scores[1]
        lines.append("")
        lines.append(f"**Alternative: {second.paradigm.value}** (score: {second.score:.1f})")
        if second.reasons:
            lines.append(f"- {second.reasons[0]}")

    return "\n".join(lines)
