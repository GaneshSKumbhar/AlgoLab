"""
Benchmark Runner
================
Runs algorithm implementations at increasing input sizes and
measures operation counts and wall-clock time.
"""
from __future__ import annotations
import time
import random
from typing import Any, Callable
from app.tracer import Tracer


def _make_tracer() -> Tracer:
    return Tracer()


def benchmark_sorting(
    algorithm_ids: list[str],
    input_sizes: list[int],
    trials: int = 3,
) -> list[dict[str, Any]]:
    """Benchmark sorting algorithms."""
    from app.algorithms.sorting.merge_sort import merge_sort
    from app.algorithms.sorting.quick_sort import quick_sort, randomized_quick_sort

    algo_map: dict[str, Callable] = {
        "merge_sort": merge_sort,
        "quick_sort": quick_sort,
        "randomized_quick_sort": randomized_quick_sort,
    }

    results = []
    for algo_id in algorithm_ids:
        if algo_id not in algo_map:
            continue
        fn = algo_map[algo_id]
        size_results = []
        for n in input_sizes:
            trial_ops = []
            trial_times = []
            for _ in range(trials):
                arr = [random.randint(1, 1000) for _ in range(n)]
                tracer = _make_tracer()
                t0 = time.perf_counter()
                fn(arr, tracer)
                t1 = time.perf_counter()
                trial_ops.append(tracer.metrics["comparisons"] + tracer.metrics["swaps"])
                trial_times.append((t1 - t0) * 1000)  # ms
            size_results.append({
                "n": n,
                "avg_operations": sum(trial_ops) / trials,
                "avg_time_ms": sum(trial_times) / trials,
                "min_time_ms": min(trial_times),
                "max_time_ms": max(trial_times),
            })
        results.append({
            "algorithm_id": algo_id,
            "category": "sorting",
            "sizes": size_results,
        })
    return results


def benchmark_graph(
    algorithm_ids: list[str],
    input_sizes: list[int],
    trials: int = 3,
) -> list[dict[str, Any]]:
    """Benchmark graph algorithms on random graphs."""
    from app.algorithms.graph.bfs import bfs
    from app.algorithms.graph.dfs import dfs
    from app.algorithms.graph.dijkstra import dijkstra
    from app.algorithms.graph.bellman_ford import bellman_ford

    results = []
    for algo_id in algorithm_ids:
        size_results = []
        for n in input_sizes:
            trial_ops = []
            trial_times = []
            nodes = [str(i) for i in range(n)]
            for _ in range(trials):
                tracer = _make_tracer()
                t0 = time.perf_counter()
                if algo_id == "bfs":
                    g = _random_graph(nodes)
                    bfs(g, nodes[0], tracer)
                elif algo_id == "dfs":
                    g = _random_graph(nodes)
                    dfs(g, nodes[0], tracer)
                elif algo_id == "dijkstra":
                    g = _random_weighted_graph(nodes)
                    dijkstra(g, nodes[0], tracer)
                elif algo_id == "bellman_ford":
                    g_nodes, edges = _random_edge_list(nodes)
                    bellman_ford(g_nodes, edges, nodes[0], tracer)
                else:
                    break
                t1 = time.perf_counter()
                ops = tracer.metrics["visits"] + tracer.metrics["edge_relaxations"] + tracer.metrics["comparisons"]
                trial_ops.append(ops)
                trial_times.append((t1 - t0) * 1000)

            if not trial_ops:
                continue
            size_results.append({
                "n": n,
                "avg_operations": sum(trial_ops) / trials,
                "avg_time_ms": sum(trial_times) / trials,
                "min_time_ms": min(trial_times),
                "max_time_ms": max(trial_times),
            })
        if size_results:
            results.append({
                "algorithm_id": algo_id,
                "category": "graph",
                "sizes": size_results,
            })
    return results


def benchmark_dp(
    algorithm_ids: list[str],
    input_sizes: list[int],
    trials: int = 3,
) -> list[dict[str, Any]]:
    """Benchmark DP algorithms."""
    from app.algorithms.dp.knapsack_01 import knapsack_01
    from app.algorithms.dp.lcs import lcs

    results = []
    for algo_id in algorithm_ids:
        size_results = []
        for n in input_sizes:
            trial_ops = []
            trial_times = []
            for _ in range(trials):
                tracer = _make_tracer()
                t0 = time.perf_counter()
                if algo_id == "knapsack_01":
                    weights = [random.randint(1, 10) for _ in range(n)]
                    values = [random.randint(1, 100) for _ in range(n)]
                    knapsack_01(weights, values, n * 5, tracer)
                elif algo_id == "lcs":
                    import string
                    s1 = "".join(random.choices(string.ascii_lowercase[:8], k=n))
                    s2 = "".join(random.choices(string.ascii_lowercase[:8], k=n))
                    lcs(s1, s2, tracer)
                else:
                    break
                t1 = time.perf_counter()
                ops = tracer.metrics["dp_updates"] + tracer.metrics["comparisons"]
                trial_ops.append(ops)
                trial_times.append((t1 - t0) * 1000)

            if not trial_ops:
                continue
            size_results.append({
                "n": n,
                "avg_operations": sum(trial_ops) / trials,
                "avg_time_ms": sum(trial_times) / trials,
                "min_time_ms": min(trial_times),
                "max_time_ms": max(trial_times),
            })
        if size_results:
            results.append({
                "algorithm_id": algo_id,
                "category": "dp",
                "sizes": size_results,
            })
    return results


# ── Helpers ────────────────────────────────────────────────────────────────────

def _random_graph(nodes: list[str], density: float = 0.3) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {n: [] for n in nodes}
    for i, u in enumerate(nodes):
        for j, v in enumerate(nodes):
            if i != j and random.random() < density:
                graph[u].append(v)
    return graph


def _random_weighted_graph(
    nodes: list[str], density: float = 0.4
) -> dict[str, dict[str, float]]:
    graph: dict[str, dict[str, float]] = {n: {} for n in nodes}
    for i, u in enumerate(nodes):
        for j, v in enumerate(nodes):
            if i != j and random.random() < density:
                graph[u][v] = round(random.uniform(1, 20), 1)
    return graph


def _random_edge_list(
    nodes: list[str], density: float = 0.4
) -> tuple[list[str], list[tuple[str, str, float]]]:
    edges = []
    for i, u in enumerate(nodes):
        for j, v in enumerate(nodes):
            if i != j and random.random() < density:
                edges.append((u, v, round(random.uniform(1, 20), 1)))
    return nodes, edges
