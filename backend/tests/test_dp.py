"""
Unit tests for DP and backtracking algorithms.
"""
import pytest
from app.tracer import Tracer
from app.algorithms.dp.knapsack_01 import knapsack_01
from app.algorithms.dp.lcs import lcs
from app.algorithms.dp.coin_change import coin_change
from app.algorithms.dp.floyd_warshall import floyd_warshall
from app.algorithms.backtracking.n_queens import n_queens
from app.algorithms.greedy.activity_selection import activity_selection, fractional_knapsack
from app.algorithms.greedy.huffman import huffman


class TestKnapsack:
    def test_basic(self):
        weights = [2, 3, 4, 5]
        values = [3, 4, 5, 6]
        val, items, _ = knapsack_01(weights, values, 5, Tracer())
        assert val == 7  # items 0 and 1 (w=2+3=5, v=3+4=7)

    def test_empty(self):
        val, items, _ = knapsack_01([], [], 10, Tracer())
        assert val == 0
        assert items == []

    def test_capacity_zero(self):
        val, items, _ = knapsack_01([1, 2], [10, 20], 0, Tracer())
        assert val == 0

    def test_all_fit(self):
        weights = [1, 2, 3]
        values = [10, 20, 30]
        val, items, _ = knapsack_01(weights, values, 100, Tracer())
        assert val == 60


class TestLCS:
    def test_basic(self):
        length, seq, _ = lcs("ABCBDAB", "BDCABA", Tracer())
        assert length == 4

    def test_identical(self):
        length, seq, _ = lcs("ABC", "ABC", Tracer())
        assert length == 3
        assert seq == "ABC"

    def test_no_common(self):
        length, seq, _ = lcs("ABC", "XYZ", Tracer())
        assert length == 0
        assert seq == ""

    def test_empty_string(self):
        length, seq, _ = lcs("", "ABC", Tracer())
        assert length == 0


class TestCoinChange:
    def test_basic(self):
        result, coins = coin_change([1, 5, 10, 25], 36, Tracer())
        assert result == 3  # 25 + 10 + 1

    def test_impossible(self):
        result, coins = coin_change([3, 5], 7, Tracer())
        # 7 = impossible with only 3 and 5? No: 5+... wait 3+... no. 5+? impossible.
        # Actually 3+... can't make 7 with {3,5}: 3*2=6, 3*1+5=8. Not possible.
        # Actually wait: we need 7 = 5+? no. 3+4? no. So -1.
        # Correction: test impossible case
        result2, _ = coin_change([3, 5], 1, Tracer())
        assert result2 == -1

    def test_single_coin(self):
        result, coins = coin_change([2], 6, Tracer())
        assert result == 3

    def test_amount_zero(self):
        result, coins = coin_change([1, 2, 5], 0, Tracer())
        assert result == 0


class TestFloydWarshall:
    def test_basic(self):
        nodes = ["A", "B", "C"]
        edges = [("A", "B", 3.0), ("B", "C", 2.0), ("A", "C", 10.0)]
        dist, _ = floyd_warshall(nodes, edges, Tracer())
        assert dist["A"]["C"] == 5.0  # A→B→C is shorter


class TestNQueens:
    def test_n4_has_solutions(self):
        solutions = n_queens(4, Tracer(), max_solutions=10)
        assert len(solutions) == 2

    def test_n1_has_one_solution(self):
        solutions = n_queens(1, Tracer())
        assert len(solutions) == 1
        assert solutions[0] == [0]

    def test_n2_no_solution(self):
        solutions = n_queens(2, Tracer())
        assert len(solutions) == 0

    def test_n8_solutions(self):
        solutions = n_queens(8, Tracer(), max_solutions=20)
        assert len(solutions) > 0  # 92 solutions exist

    def test_solution_validity(self):
        """Check that each returned solution is actually valid."""
        for sol in n_queens(8, Tracer(), max_solutions=5):
            n = len(sol)
            for r1 in range(n):
                for r2 in range(r1 + 1, n):
                    c1, c2 = sol[r1], sol[r2]
                    assert c1 != c2
                    assert abs(c1 - c2) != abs(r1 - r2)


class TestActivitySelection:
    def test_basic(self):
        acts = [(1, 4, "A"), (3, 5, "B"), (0, 6, "C"), (5, 7, "D"), (3, 9, "E"), (5, 9, "F"), (6, 10, "G"), (8, 11, "H"), (8, 12, "I"), (2, 14, "J"), (12, 16, "K")]
        selected = activity_selection(acts, Tracer())
        # Maximum selection should be 4 activities
        # Just verify no overlaps
        sorted_sel = sorted(selected, key=lambda a: a[1])
        for i in range(len(sorted_sel) - 1):
            assert sorted_sel[i][1] <= sorted_sel[i + 1][0], "Overlap detected!"

    def test_no_overlaps_in_result(self):
        acts = [(0, 3, "A"), (1, 4, "B"), (2, 5, "C"), (3, 6, "D")]
        selected = activity_selection(acts, Tracer())
        sorted_sel = sorted(selected, key=lambda a: a[1])
        for i in range(len(sorted_sel) - 1):
            assert sorted_sel[i][1] <= sorted_sel[i + 1][0]


class TestHuffman:
    def test_produces_codes(self):
        codes, root, freq = huffman("hello", Tracer())
        assert set(codes.keys()) == {"h", "e", "l", "o"}

    def test_prefix_free(self):
        codes, _, _ = huffman("abracadabra", Tracer())
        code_list = list(codes.values())
        for i, c1 in enumerate(code_list):
            for j, c2 in enumerate(code_list):
                if i != j:
                    assert not c1.startswith(c2) and not c2.startswith(c1), \
                        f"Codes not prefix-free: {c1} and {c2}"

    def test_single_char(self):
        codes, _, freq = huffman("aaaa", Tracer())
        assert "a" in codes
