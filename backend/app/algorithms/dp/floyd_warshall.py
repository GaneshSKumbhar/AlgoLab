"""
Floyd-Warshall — All-Pairs Shortest Path
Time:  O(V³)
Space: O(V²)
"""
from app.tracer import Tracer, EventType


INF = float("inf")


def floyd_warshall(
    nodes: list[str],
    edges: list[tuple[str, str, float]],
    tracer: Tracer,
) -> tuple[dict[str, dict[str, float]], dict[str, dict[str, str | None]]]:
    """
    Returns (dist_matrix, next_matrix) for path reconstruction.
    """
    idx = {n: i for i, n in enumerate(nodes)}
    n = len(nodes)
    dist = [[INF] * n for _ in range(n)]
    nxt: list[list[str | None]] = [[None] * n for _ in range(n)]

    for i in range(n):
        dist[i][i] = 0.0

    for u, v, w in edges:
        i, j = idx[u], idx[v]
        dist[i][j] = w
        nxt[i][j] = v

    tracer.emit(
        EventType.INITIALIZE,
        f"Floyd-Warshall on {n} nodes",
        data={"nodes": nodes, "edges": edges},
        dp_table_snapshot=[row[:] for row in dist],
    )

    for k in range(n):
        tracer.emit(
            EventType.STATE_CHANGE,
            f"Iteration k={k} (intermediate node '{nodes[k]}')",
            data={"k": k, "node": nodes[k]},
        )
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    old = dist[i][j]
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]
                    tracer.emit(
                        EventType.RELAXATION,
                        f"Update dist[{nodes[i]}][{nodes[j]}]: {old} → {dist[i][j]} via {nodes[k]}",
                        data={"i": nodes[i], "j": nodes[j], "k": nodes[k], "new_dist": dist[i][j]},
                        dp_table_snapshot=[row[:] for row in dist],
                    )

    # Convert to named dicts
    dist_named = {
        nodes[i]: {nodes[j]: dist[i][j] for j in range(n)}
        for i in range(n)
    }
    next_named = {
        nodes[i]: {nodes[j]: nxt[i][j] for j in range(n)}
        for i in range(n)
    }

    tracer.emit(
        EventType.COMPLETE,
        "Floyd-Warshall complete",
        data={"distances": dist_named},
        dp_table_snapshot=[row[:] for row in dist],
    )
    return dist_named, next_named


def reconstruct_fw_path(
    nxt: dict[str, dict[str, str | None]], u: str, v: str
) -> list[str]:
    if nxt[u][v] is None:
        return []
    path = [u]
    while u != v:
        u = nxt[u][v]  # type: ignore[assignment]
        path.append(u)
    return path
