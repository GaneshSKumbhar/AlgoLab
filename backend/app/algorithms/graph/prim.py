"""
Prim's Algorithm — Minimum Spanning Tree
Greedy: Grow MST one edge at a time using min-heap.
Time:  O((V + E) log V)
Space: O(V)
"""
import heapq
from app.tracer import Tracer, EventType


def prim(
    graph: dict[str, dict[str, float]],
    start: str,
    tracer: Tracer,
) -> tuple[list[tuple[str, str, float]], float]:
    """
    graph: { node: { neighbor: weight } }
    Returns (MST edges, total weight).
    """
    tracer.emit(
        EventType.INITIALIZE,
        f"Prim's algorithm starting from '{start}'",
        data={"graph": graph, "start": start},
        highlight_nodes=[start],
    )

    in_mst: set[str] = set()
    mst_edges: list[tuple[str, str, float]] = []
    total_weight = 0.0

    # (weight, from_node, to_node)
    heap: list[tuple[float, str, str]] = [(0.0, start, start)]

    while heap and len(in_mst) < len(graph):
        w, u, v = heapq.heappop(heap)

        if v in in_mst:
            tracer.emit(
                EventType.EDGE_REJECTED,
                f"Node '{v}' already in MST, skip",
                data={"node": v},
                highlight_nodes=[v],
            )
            continue

        in_mst.add(v)

        if u != v:
            mst_edges.append((u, v, w))
            total_weight += w
            tracer.emit(
                EventType.EDGE_SELECTED,
                f"Add edge ({u}—{v}, w={w}) to MST",
                data={"edge": (u, v, w), "total_weight": total_weight},
                highlight_nodes=[u, v],
                highlight_edges=[(u, v)],
            )
        else:
            tracer.emit(
                EventType.SELECTION,
                f"Start with node '{v}'",
                data={"node": v},
                highlight_nodes=[v],
            )

        for neighbor, weight in graph.get(v, {}).items():
            if neighbor not in in_mst:
                tracer.emit(
                    EventType.RELAXATION,
                    f"Candidate edge ({v}→{neighbor}, w={weight})",
                    data={"from": v, "to": neighbor, "weight": weight},
                    highlight_nodes=[v, neighbor],
                    highlight_edges=[(v, neighbor)],
                )
                heapq.heappush(heap, (weight, v, neighbor))

    tracer.emit(
        EventType.COMPLETE,
        f"Prim complete. MST weight={total_weight}",
        data={"mst": mst_edges, "total_weight": total_weight},
    )
    return mst_edges, total_weight
