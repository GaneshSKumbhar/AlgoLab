"""
Dijkstra's Algorithm — Single Source Shortest Path
Works on graphs with non-negative edge weights.
Time:  O((V + E) log V) with a min-heap
Space: O(V)
"""
import heapq
from app.tracer import Tracer, EventType


def dijkstra(
    graph: dict[str, dict[str, float]],
    start: str,
    tracer: Tracer,
) -> tuple[dict[str, float], dict[str, str | None]]:
    """
    graph: { node: { neighbor: weight } }
    Returns (distances, predecessors).
    """
    if start not in graph:
        tracer.emit(EventType.MESSAGE, f"Start node '{start}' not found.")
        return {}, {}

    INF = float("inf")
    dist: dict[str, float] = {node: INF for node in graph}
    dist[start] = 0.0
    pred: dict[str, str | None] = {node: None for node in graph}

    heap: list[tuple[float, str]] = [(0.0, start)]

    tracer.emit(
        EventType.INITIALIZE,
        f"Dijkstra from '{start}'. All distances = ∞ except start = 0",
        data={"graph": graph, "start": start, "distances": dict(dist)},
        highlight_nodes=[start],
    )

    visited: set[str] = set()

    while heap:
        d, node = heapq.heappop(heap)

        if node in visited:
            continue
        visited.add(node)

        tracer.emit(
            EventType.SELECTION,
            f"Select node '{node}' with distance {d}",
            data={"node": node, "distance": d, "distances": dict(dist)},
            highlight_nodes=[node],
        )

        for neighbor, weight in graph.get(node, {}).items():
            new_dist = d + weight

            tracer.emit(
                EventType.RELAXATION,
                f"Relax edge ({node}→{neighbor}): {d} + {weight} = {new_dist} vs current {dist[neighbor]}",
                data={
                    "from": node,
                    "to": neighbor,
                    "weight": weight,
                    "new_dist": new_dist,
                    "old_dist": dist[neighbor],
                },
                highlight_nodes=[node, neighbor],
                highlight_edges=[(node, neighbor)],
            )

            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                pred[neighbor] = node
                heapq.heappush(heap, (new_dist, neighbor))
                tracer.emit(
                    EventType.STATE_CHANGE,
                    f"Updated distance to '{neighbor}': {new_dist}",
                    data={"node": neighbor, "dist": new_dist, "distances": dict(dist)},
                    highlight_nodes=[neighbor],
                    highlight_edges=[(node, neighbor)],
                )

    tracer.emit(
        EventType.COMPLETE,
        "Dijkstra complete",
        data={"distances": dist, "predecessors": pred},
        highlight_nodes=list(graph.keys()),
    )
    return dist, pred


def reconstruct_path(
    pred: dict[str, str | None], start: str, end: str
) -> list[str]:
    """Reconstruct shortest path from predecessor map."""
    path: list[str] = []
    current: str | None = end
    while current is not None:
        path.append(current)
        current = pred.get(current)
    path.reverse()
    if path and path[0] == start:
        return path
    return []  # No path found
