"""
DFS — Depth-First Search (iterative and recursive variants).
Time:  O(V + E)
Space: O(V)
"""
from app.tracer import Tracer, EventType


def dfs(
    graph: dict[str, list[str]],
    start: str,
    tracer: Tracer,
) -> list[str]:
    """Iterative DFS using an explicit stack."""
    if start not in graph:
        tracer.emit(EventType.MESSAGE, f"Start node '{start}' not in graph.")
        return []

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting DFS from '{start}'",
        data={"graph": graph, "start": start},
        highlight_nodes=[start],
    )

    visited: set[str] = set()
    stack: list[str] = [start]
    order: list[str] = []

    while stack:
        node = stack.pop()

        if node in visited:
            tracer.emit(
                EventType.COMPARISON,
                f"Node '{node}' already visited, skip",
                data={"node": node},
                highlight_nodes=[node],
            )
            continue

        visited.add(node)
        order.append(node)

        tracer.emit(
            EventType.VISIT,
            f"Visit node '{node}'",
            data={"node": node, "visited_order": list(order)},
            highlight_nodes=[node],
        )

        for neighbor in reversed(graph.get(node, [])):
            if neighbor not in visited:
                stack.append(neighbor)
                tracer.emit(
                    EventType.STATE_CHANGE,
                    f"Push '{neighbor}' onto stack",
                    data={"neighbor": neighbor, "stack": list(stack)},
                    highlight_nodes=[node, neighbor],
                    highlight_edges=[(node, neighbor)],
                )

    tracer.emit(
        EventType.COMPLETE,
        f"DFS complete. Order: {order}",
        data={"traversal_order": order},
        highlight_nodes=order,
    )
    return order


def topological_sort(
    graph: dict[str, list[str]],
    tracer: Tracer,
) -> list[str]:
    """
    Topological sort using DFS on a DAG.
    Returns nodes in topological order.
    """
    visited: set[str] = set()
    result: list[str] = []
    nodes = list(graph.keys())

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting Topological Sort on {len(nodes)} nodes",
        data={"graph": graph},
    )

    def dfs_visit(node: str) -> None:
        visited.add(node)
        tracer.emit(
            EventType.VISIT,
            f"DFS visiting '{node}'",
            data={"node": node},
            highlight_nodes=[node],
        )
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                tracer.emit(
                    EventType.RECURSIVE_CALL,
                    f"Recurse into neighbor '{neighbor}'",
                    data={"from": node, "to": neighbor},
                    highlight_nodes=[node, neighbor],
                    highlight_edges=[(node, neighbor)],
                )
                dfs_visit(neighbor)
        result.append(node)
        tracer.emit(
            EventType.RECURSIVE_RETURN,
            f"Finished '{node}', appended to result",
            data={"node": node, "result_so_far": list(result)},
            highlight_nodes=[node],
        )

    for node in nodes:
        if node not in visited:
            dfs_visit(node)

    result.reverse()
    tracer.emit(
        EventType.COMPLETE,
        f"Topological order: {result}",
        data={"topological_order": result},
        highlight_nodes=result,
    )
    return result
