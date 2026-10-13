"""
Quick Sort — Divide and Conquer
Uses Lomuto partition scheme with last element as pivot.
Time:  Best/Avg O(n log n) | Worst O(n²) with bad pivot
Space: O(log n) average stack
"""
import random
from app.tracer import Tracer, EventType


def quick_sort(arr: list[int], tracer: Tracer, randomized: bool = False) -> list[int]:
    result = list(arr)

    label = "Randomized Quick Sort" if randomized else "Quick Sort"
    tracer.emit(
        EventType.INITIALIZE,
        f"Starting {label} on array of size {len(arr)}",
        data={"array": result, "randomized": randomized},
        snapshot=list(result),
    )

    _quick_sort_rec(result, 0, len(result) - 1, tracer, randomized)

    tracer.emit(
        EventType.COMPLETE,
        f"{label} complete",
        data={"sorted": result},
        snapshot=list(result),
    )
    return result


def _quick_sort_rec(
    arr: list[int], low: int, high: int, tracer: Tracer, randomized: bool
) -> None:
    if low >= high:
        return

    tracer.emit(
        EventType.RECURSIVE_CALL,
        f"Partitioning subarray [{low}..{high}]",
        data={"low": low, "high": high},
        highlight_indices=list(range(low, high + 1)),
        snapshot=list(arr),
    )

    pivot_idx = _partition(arr, low, high, tracer, randomized)

    tracer.emit(
        EventType.RECURSIVE_RETURN,
        f"Pivot {arr[pivot_idx]} placed at index {pivot_idx}",
        data={"pivot_index": pivot_idx, "pivot_value": arr[pivot_idx]},
        highlight_indices=[pivot_idx],
        snapshot=list(arr),
    )

    _quick_sort_rec(arr, low, pivot_idx - 1, tracer, randomized)
    _quick_sort_rec(arr, pivot_idx + 1, high, tracer, randomized)


def _partition(
    arr: list[int], low: int, high: int, tracer: Tracer, randomized: bool
) -> int:
    if randomized:
        rand_idx = random.randint(low, high)
        arr[rand_idx], arr[high] = arr[high], arr[rand_idx]
        tracer.emit(
            EventType.SWAP,
            f"Randomized: swap arr[{rand_idx}]={arr[high]} with arr[{high}]={arr[rand_idx]}",
            data={"i": rand_idx, "j": high},
            highlight_indices=[rand_idx, high],
            snapshot=list(arr),
        )

    pivot = arr[high]
    tracer.emit(
        EventType.PIVOT_SET,
        f"Pivot selected: arr[{high}]={pivot}",
        data={"pivot": pivot, "pivot_index": high},
        highlight_indices=[high],
        snapshot=list(arr),
    )

    i = low - 1

    for j in range(low, high):
        tracer.emit(
            EventType.COMPARISON,
            f"Comparing arr[{j}]={arr[j]} with pivot={pivot}",
            data={"j": j, "value": arr[j], "pivot": pivot, "i": i},
            highlight_indices=[j, high],
            snapshot=list(arr),
        )
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
            tracer.emit(
                EventType.SWAP,
                f"arr[{j}]={arr[j]} ≤ pivot: swap arr[{i}] and arr[{j}]",
                data={"i": i, "j": j},
                highlight_indices=[i, j],
                snapshot=list(arr),
            )

    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    tracer.emit(
        EventType.SWAP,
        f"Place pivot {pivot} at index {i + 1}",
        data={"pivot_final_index": i + 1},
        highlight_indices=[i + 1],
        snapshot=list(arr),
    )
    return i + 1


def randomized_quick_sort(arr: list[int], tracer: Tracer) -> list[int]:
    return quick_sort(arr, tracer, randomized=True)
