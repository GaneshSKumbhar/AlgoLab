"""
Unit tests for sorting algorithms.
Tests algorithm correctness independently from visualization.
"""
import pytest
from app.tracer import Tracer
from app.algorithms.sorting.merge_sort import merge_sort
from app.algorithms.sorting.quick_sort import quick_sort, randomized_quick_sort
from app.algorithms.searching.binary_search import binary_search
from app.algorithms.searching.linear_search import linear_search


# ── Merge Sort ─────────────────────────────────────────────────────────────────

class TestMergeSort:
    def test_normal(self):
        arr = [5, 2, 8, 1, 9, 3]
        assert merge_sort(arr, Tracer()) == sorted(arr)

    def test_already_sorted(self):
        arr = [1, 2, 3, 4, 5]
        assert merge_sort(arr, Tracer()) == [1, 2, 3, 4, 5]

    def test_reverse_sorted(self):
        arr = [5, 4, 3, 2, 1]
        assert merge_sort(arr, Tracer()) == [1, 2, 3, 4, 5]

    def test_single_element(self):
        assert merge_sort([42], Tracer()) == [42]

    def test_duplicates(self):
        arr = [3, 1, 4, 1, 5, 9, 2, 6, 5]
        assert merge_sort(arr, Tracer()) == sorted(arr)

    def test_large(self):
        import random
        arr = [random.randint(1, 1000) for _ in range(500)]
        assert merge_sort(arr, Tracer()) == sorted(arr)

    def test_tracer_events_nonempty(self):
        tracer = Tracer()
        merge_sort([3, 1, 2], tracer)
        assert len(tracer.events) > 0

    def test_tracer_metrics_comparisons(self):
        tracer = Tracer()
        merge_sort([4, 3, 2, 1], tracer)
        assert tracer.metrics["comparisons"] > 0


# ── Quick Sort ─────────────────────────────────────────────────────────────────

class TestQuickSort:
    def test_normal(self):
        arr = [5, 2, 8, 1, 9, 3]
        assert quick_sort(arr, Tracer()) == sorted(arr)

    def test_already_sorted(self):
        arr = [1, 2, 3, 4, 5]
        assert quick_sort(arr, Tracer()) == [1, 2, 3, 4, 5]

    def test_single_element(self):
        assert quick_sort([7], Tracer()) == [7]

    def test_duplicates(self):
        arr = [3, 3, 1, 1, 2]
        assert quick_sort(arr, Tracer()) == sorted(arr)

    def test_randomized_variant(self):
        arr = [5, 2, 8, 1, 9, 3]
        assert randomized_quick_sort(arr, Tracer()) == sorted(arr)


# ── Binary Search ──────────────────────────────────────────────────────────────

class TestBinarySearch:
    def test_found_middle(self):
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 5, Tracer()) == 2

    def test_found_first(self):
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 1, Tracer()) == 0

    def test_found_last(self):
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 9, Tracer()) == 4

    def test_not_found(self):
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 4, Tracer()) == -1

    def test_empty(self):
        assert binary_search([], 5, Tracer()) == -1

    def test_single_found(self):
        assert binary_search([42], 42, Tracer()) == 0

    def test_single_not_found(self):
        assert binary_search([42], 1, Tracer()) == -1

    def test_tracer_has_comparisons(self):
        tracer = Tracer()
        binary_search([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 7, tracer)
        assert tracer.metrics["comparisons"] > 0
        assert tracer.metrics["comparisons"] <= 4  # log2(10) ≈ 3.3


# ── Linear Search ──────────────────────────────────────────────────────────────

class TestLinearSearch:
    def test_found(self):
        arr = [10, 20, 30, 40]
        assert linear_search(arr, 30, Tracer()) == 2

    def test_not_found(self):
        assert linear_search([1, 2, 3], 99, Tracer()) == -1

    def test_empty(self):
        assert linear_search([], 1, Tracer()) == -1

    def test_first_element(self):
        assert linear_search([7, 1, 2], 7, Tracer()) == 0
