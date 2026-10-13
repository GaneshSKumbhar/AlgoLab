"""
Merge Sort — Divide and Conquer
Recursively divides array, sorts halves, then merges.
Time:  All cases O(n log n)
Space: O(n) auxiliary
"""
from app.tracer import Tracer, EventType


def merge_sort(arr: list[int], tracer: Tracer) -> list[int]:
    result = list(arr)

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting Merge Sort on array of size {len(arr)}",
        data={"array": result},
        snapshot=list(result),
    )

    _merge_sort_rec(result, 0, len(result) - 1, tracer)

    tracer.emit(
        EventType.COMPLETE,
        "Merge Sort complete",
        data={"sorted": result},
        snapshot=list(result),
    )
    return result


def _merge_sort_rec(arr: list[int], left: int, right: int, tracer: Tracer) -> None:
    if left >= right:
        return

    mid = (left + right) // 2

    tracer.emit(
        EventType.RECURSIVE_CALL,
        f"Dividing [{left}..{right}] → [{left}..{mid}] and [{mid+1}..{right}]",
        data={"left": left, "right": right, "mid": mid},
        highlight_indices=list(range(left, right + 1)),
        snapshot=list(arr),
    )

    _merge_sort_rec(arr, left, mid, tracer)
    _merge_sort_rec(arr, mid + 1, right, tracer)
    _merge(arr, left, mid, right, tracer)


def _merge(arr: list[int], left: int, mid: int, right: int, tracer: Tracer) -> None:
    left_part = arr[left:mid + 1]
    right_part = arr[mid + 1:right + 1]
    i = j = 0
    k = left

    tracer.emit(
        EventType.STATE_CHANGE,
        f"Merging [{left}..{mid}] and [{mid+1}..{right}]",
        data={"left_part": left_part, "right_part": right_part},
        highlight_indices=list(range(left, right + 1)),
        snapshot=list(arr),
    )

    while i < len(left_part) and j < len(right_part):
        tracer.emit(
            EventType.COMPARISON,
            f"Comparing {left_part[i]} and {right_part[j]}",
            data={"a": left_part[i], "b": right_part[j], "pos": k},
            highlight_indices=[left + i, mid + 1 + j],
            snapshot=list(arr),
        )
        if left_part[i] <= right_part[j]:
            arr[k] = left_part[i]
            i += 1
        else:
            arr[k] = right_part[j]
            j += 1

        tracer.emit(
            EventType.STATE_CHANGE,
            f"Placed {arr[k]} at index {k}",
            data={"index": k, "value": arr[k]},
            highlight_indices=[k],
            snapshot=list(arr),
        )
        k += 1

    while i < len(left_part):
        arr[k] = left_part[i]
        tracer.emit(
            EventType.STATE_CHANGE,
            f"Copying remaining left element {arr[k]} to index {k}",
            data={"index": k, "value": arr[k]},
            highlight_indices=[k],
            snapshot=list(arr),
        )
        i += 1
        k += 1

    while j < len(right_part):
        arr[k] = right_part[j]
        tracer.emit(
            EventType.STATE_CHANGE,
            f"Copying remaining right element {arr[k]} to index {k}",
            data={"index": k, "value": arr[k]},
            highlight_indices=[k],
            snapshot=list(arr),
        )
        j += 1
        k += 1

    tracer.emit(
        EventType.MARK_SORTED,
        f"Subarray [{left}..{right}] is now merged",
        data={"left": left, "right": right},
        highlight_indices=list(range(left, right + 1)),
        snapshot=list(arr),
    )
