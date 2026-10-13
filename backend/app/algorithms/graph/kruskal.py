"""
Kruskal's Algorithm — Minimum Spanning Tree
Greedy: Sort edges by weight, add if no cycle using Union-Find.
Time:  O(E log E)
Space: O(V)
"""
from app.tracer import Tracer, EventType


class UnionFind:
    def __init__(self, nodes: list[str]) -> None:
        self.parent = {n: n for n in nodes}
        self.rank = {n: 0 for n in nodes}

    def find(self, x: str) -> str:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: str, y: str) -> bool:
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False  # Same component — cycle
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True


def kruskal(
    nodes: list[str],
    edges: list[tuple[str, str, float]],  # (from, to, weight)
    tracer: Tracer,
) -> tuple[list[tuple[str, str, float]], float]:
    """Returns (MST edges, total weight)."""
    tracer.emit(
        EventType.INITIALIZE,
        f"Kruskal on {len(nodes)} nodes, {len(edges)} edges",
        data={"nodes": nodes, "edges": edges},
    )

    sorted_edges = sorted(edges, key=lambda e: e[2])
    tracer.emit(
        EventType.STATE_CHANGE,
        "Edges sorted by weight",
        data={"sorted_edges": sorted_edges},
    )

    uf = UnionFind(nodes)
    mst: list[tuple[str, str, float]] = []
    total_weight = 0.0

    for u, v, w in sorted_edges:
        tracer.emit(
            EventType.SELECTION,
            f"Consider edge ({u}—{v}, w={w})",
            data={"edge": (u, v, w), "mst_size": len(mst)},
            highlight_nodes=[u, v],
            highlight_edges=[(u, v)],
        )

        if uf.union(u, v):
            mst.append((u, v, w))
            total_weight += w
            tracer.emit(
                EventType.EDGE_SELECTED,
                f"Edge ({u}—{v}, w={w}) added to MST",
                data={"edge": (u, v, w), "mst": mst, "total_weight": total_weight},
                highlight_nodes=[u, v],
                highlight_edges=[(u, v)],
            )
        else:
            tracer.emit(
                EventType.EDGE_REJECTED,
                f"Edge ({u}—{v}, w={w}) rejected — would form cycle",
                data={"edge": (u, v, w)},
                highlight_nodes=[u, v],
                highlight_edges=[(u, v)],
            )

        if len(mst) == len(nodes) - 1:
            break

    tracer.emit(
        EventType.COMPLETE,
        f"Kruskal complete. MST weight={total_weight}",
        data={"mst": mst, "total_weight": total_weight},
    )
    return mst, total_weight
