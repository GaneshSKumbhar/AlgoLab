"""
Unit tests for graph algorithms.
"""
import pytest
from app.tracer import Tracer
from app.algorithms.graph.bfs import bfs
from app.algorithms.graph.dfs import dfs, topological_sort
from app.algorithms.graph.dijkstra import dijkstra, reconstruct_path
from app.algorithms.graph.bellman_ford import bellman_ford
from app.algorithms.graph.kruskal import kruskal
from app.algorithms.graph.prim import prim


SIMPLE_GRAPH = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}

WEIGHTED_GRAPH = {
    "A": {"B": 4.0, "C": 2.0},
    "B": {"A": 4.0, "C": 1.0, "D": 5.0},
    "C": {"A": 2.0, "B": 1.0, "D": 8.0, "E": 10.0},
    "D": {"B": 5.0, "C": 8.0, "E": 2.0},
    "E": {"C": 10.0, "D": 2.0},
}


class TestBFS:
    def test_visits_all_connected_nodes(self):
        order = bfs(SIMPLE_GRAPH, "A", Tracer())
        assert set(order) == set(SIMPLE_GRAPH.keys())

    def test_start_is_first(self):
        order = bfs(SIMPLE_GRAPH, "A", Tracer())
        assert order[0] == "A"

    def test_invalid_start(self):
        order = bfs(SIMPLE_GRAPH, "Z", Tracer())
        assert order == []

    def test_single_node(self):
        g = {"A": []}
        assert bfs(g, "A", Tracer()) == ["A"]


class TestDFS:
    def test_visits_all_nodes(self):
        order = dfs(SIMPLE_GRAPH, "A", Tracer())
        assert set(order) == set(SIMPLE_GRAPH.keys())

    def test_start_is_first(self):
        order = dfs(SIMPLE_GRAPH, "A", Tracer())
        assert order[0] == "A"


class TestTopologicalSort:
    def test_dag(self):
        dag = {
            "A": ["C"],
            "B": ["C", "D"],
            "C": ["E"],
            "D": ["F"],
            "E": ["F"],
            "F": [],
        }
        order = topological_sort(dag, Tracer())
        # Verify ordering: for each edge u→v, u appears before v
        idx = {n: i for i, n in enumerate(order)}
        for u, neighbors in dag.items():
            for v in neighbors:
                assert idx[u] < idx[v], f"{u} should appear before {v}"


class TestDijkstra:
    def test_correct_distances(self):
        dist, _ = dijkstra(WEIGHTED_GRAPH, "A", Tracer())
        assert dist["A"] == 0.0
        assert dist["C"] == 2.0   # A→C
        assert dist["B"] == 3.0   # A→C→B
        assert dist["D"] == 8.0   # A→C→B→D

    def test_path_reconstruction(self):
        dist, pred = dijkstra(WEIGHTED_GRAPH, "A", Tracer())
        path = reconstruct_path(pred, "A", "D")
        assert path[0] == "A"
        assert path[-1] == "D"

    def test_unreachable(self):
        g = {"A": {"B": 1.0}, "B": {}, "C": {}}
        dist, _ = dijkstra(g, "A", Tracer())
        assert dist["C"] == float("inf")


class TestBellmanFord:
    def test_correct_distances(self):
        nodes = ["A", "B", "C", "D"]
        edges = [("A", "B", 1.0), ("B", "C", 2.0), ("A", "C", 10.0), ("C", "D", -1.0)]
        dist, _, neg = bellman_ford(nodes, edges, "A", Tracer())
        assert neg is False
        assert dist["B"] == 1.0
        assert dist["C"] == 3.0
        assert dist["D"] == 2.0

    def test_negative_cycle_detected(self):
        nodes = ["A", "B", "C"]
        edges = [("A", "B", 1.0), ("B", "C", -3.0), ("C", "A", 1.0)]
        _, _, neg = bellman_ford(nodes, edges, "A", Tracer())
        assert neg is True


class TestKruskal:
    def test_mst_weight(self):
        nodes = ["A", "B", "C", "D"]
        edges = [
            ("A", "B", 1.0), ("B", "C", 2.0),
            ("A", "C", 3.0), ("C", "D", 1.0), ("B", "D", 4.0),
        ]
        mst, weight = kruskal(nodes, edges, Tracer())
        assert len(mst) == 3  # n-1 edges
        assert weight == 4.0  # 1+2+1

    def test_single_node(self):
        mst, weight = kruskal(["A"], [], Tracer())
        assert mst == []
        assert weight == 0.0


class TestPrim:
    def test_mst_edges_count(self):
        mst, _ = prim(WEIGHTED_GRAPH, "A", Tracer())
        assert len(mst) == len(WEIGHTED_GRAPH) - 1
