"""
Bellman-Ford Algorithm — Single Source Shortest Path
Handles graphs with negative edge weights.
Detects negative-weight cycles.
Time:  O(V·E)
Space: O(V)
"""
from app.tracer import Tracer, EventType


def bellman_ford(
    nodes: list[str],
    edges: list[tuple[str, str, float]],  # (from, to, weight)
    start: str,
    tracer: Tracer,
) -> tuple[dict[str, float], dict[str, str | None], bool]:
    """
    Returns (distances, predecessors, has_negative_cycle).
    """
    INF = float("inf")
    dist: dict[str, float] = {n: INF for n in nodes}
    dist[start] = 0.0
    pred: dict[str, str | None] = {n: None for n in nodes}

    tracer.emit(
        EventType.INITIALIZE,
        f"Bellman-Ford from '{start}'. {len(nodes)} nodes, {len(edges)} edges",
        data={"nodes": nodes, "edges": edges, "start": start, "distances": dict(dist)},
        highlight_nodes=[start],
    )

    V = len(nodes)

    for iteration in range(V - 1):
        tracer.emit(
            EventType.STATE_CHANGE,
            f"Iteration {iteration + 1}/{V - 1}: relaxing all edges",
            data={"iteration": iteration + 1, "distances": dict(dist)},
        )
        updated = False
        for u, v, w in edges:
            tracer.emit(
                EventType.RELAXATION,
                f"Relax ({u}→{v}, w={w}): {dist[u]} + {w} vs {dist[v]}",
                data={"from": u, "to": v, "weight": w, "dist_u": dist[u], "dist_v": dist[v]},
                highlight_nodes=[u, v],
                highlight_edges=[(u, v)],
            )
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pred[v] = u
                updated = True
                tracer.emit(
                    EventType.STATE_CHANGE,
                    f"Updated dist[{v}] = {dist[v]}",
                    data={"node": v, "new_dist": dist[v], "distances": dict(dist)},
                    highlight_nodes=[v],
                    highlight_edges=[(u, v)],
                )
        if not updated:
            tracer.emit(
                EventType.MESSAGE,
                f"Early termination at iteration {iteration + 1}: no updates",
                data={"iteration": iteration + 1},
            )
            break

    # Negative cycle detection
    has_negative_cycle = False
    for u, v, w in edges:
        if dist[u] != INF and dist[u] + w < dist[v]:
            has_negative_cycle = True
            tracer.emit(
                EventType.MESSAGE,
                f"Negative cycle detected via edge ({u}→{v})",
                data={"edge": (u, v, w)},
                highlight_nodes=[u, v],
                highlight_edges=[(u, v)],
            )
            break

    tracer.emit(
        EventType.COMPLETE,
        f"Bellman-Ford complete. Negative cycle: {has_negative_cycle}",
        data={"distances": dist, "predecessors": pred, "negative_cycle": has_negative_cycle},
    )
    return dist, pred, has_negative_cycle
