"""
BFS — Breadth-First Search
Explores graph level by level using a queue.
Time:  O(V + E)
Space: O(V)
"""
from collections import deque
from app.tracer import Tracer, EventType


def bfs(
    graph: dict[str, list[str]],
    start: str,
    tracer: Tracer,
) -> list[str]:
    """
    graph: adjacency list { node: [neighbors] }
    Returns nodes in BFS order.
    """
    if start not in graph:
        tracer.emit(EventType.MESSAGE, f"Start node '{start}' not in graph.")
        return []

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting BFS from '{start}'",
        data={"graph": graph, "start": start},
        highlight_nodes=[start],
    )

    visited: set[str] = set()
    queue: deque[str] = deque([start])
    visited.add(start)
    order: list[str] = []

    tracer.emit(
        EventType.ENQUEUE,
        f"Enqueue start node '{start}'",
        data={"queue": [start]},
        highlight_nodes=[start],
    )

    while queue:
        node = queue.popleft()
        order.append(node)

        tracer.emit(
            EventType.DEQUEUE,
            f"Dequeue '{node}' — visiting",
            data={"node": node, "visited_order": list(order)},
            highlight_nodes=[node],
        )

        tracer.emit(
            EventType.VISIT,
            f"Visit node '{node}'",
            data={"node": node},
            highlight_nodes=[node],
        )

        for neighbor in graph.get(node, []):
            tracer.emit(
                EventType.COMPARISON,
                f"Check neighbor '{neighbor}' of '{node}': {'already visited' if neighbor in visited else 'not visited'}",
                data={"node": node, "neighbor": neighbor, "visited": neighbor in visited},
                highlight_nodes=[node, neighbor],
                highlight_edges=[(node, neighbor)],
            )
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                tracer.emit(
                    EventType.ENQUEUE,
                    f"Enqueue '{neighbor}'",
                    data={"neighbor": neighbor, "queue": list(queue)},
                    highlight_nodes=[neighbor],
                    highlight_edges=[(node, neighbor)],
                )

    tracer.emit(
        EventType.COMPLETE,
        f"BFS complete. Order: {order}",
        data={"traversal_order": order},
        highlight_nodes=order,
    )
    return order
