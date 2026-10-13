"""
Binary Search — Divide and Conquer
Searches for a target value in a sorted array.
Time:  Best O(1) | Avg O(log n) | Worst O(log n)
Space: O(1) iterative
"""
from app.tracer import Tracer, EventType


def binary_search(arr: list[int], target: int, tracer: Tracer) -> int:
    """
    Returns the index of target in arr, or -1 if not found.
    Array must be sorted.
    """
    if not arr:
        tracer.emit(EventType.MESSAGE, "Empty array — nothing to search.")
        return -1

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting Binary Search for target={target} in array of size {len(arr)}",
        data={"array": arr, "target": target},
        snapshot=list(arr),
    )

    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        tracer.emit(
            EventType.COMPARISON,
            f"Checking arr[{mid}]={arr[mid]} against target={target}",
            data={"low": low, "high": high, "mid": mid, "mid_value": arr[mid]},
            highlight_indices=[mid],
            snapshot=list(arr),
        )

        if arr[mid] == target:
            tracer.emit(
                EventType.SOLUTION_FOUND,
                f"Found target={target} at index {mid}",
                data={"index": mid},
                highlight_indices=[mid],
                snapshot=list(arr),
            )
            return mid
        elif arr[mid] < target:
            tracer.emit(
                EventType.DECISION,
                f"arr[{mid}]={arr[mid]} < target={target}: search right half",
                data={"direction": "right", "new_low": mid + 1},
                highlight_indices=[mid],
            )
            low = mid + 1
        else:
            tracer.emit(
                EventType.DECISION,
                f"arr[{mid}]={arr[mid]} > target={target}: search left half",
                data={"direction": "left", "new_high": mid - 1},
                highlight_indices=[mid],
            )
            high = mid - 1

    tracer.emit(
        EventType.MESSAGE,
        f"Target={target} not found in array.",
        data={"result": -1},
        snapshot=list(arr),
    )
    return -1
