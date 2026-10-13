"""
Linear Search
Sequentially checks each element.
Time:  Best O(1) | Avg O(n) | Worst O(n)
Space: O(1)
"""
from app.tracer import Tracer, EventType


def linear_search(arr: list[int], target: int, tracer: Tracer) -> int:
    if not arr:
        tracer.emit(EventType.MESSAGE, "Empty array.")
        return -1

    tracer.emit(
        EventType.INITIALIZE,
        f"Starting Linear Search for target={target} in array of size {len(arr)}",
        data={"array": arr, "target": target},
        snapshot=list(arr),
    )

    for i, val in enumerate(arr):
        tracer.emit(
            EventType.COMPARISON,
            f"Comparing arr[{i}]={val} with target={target}",
            data={"index": i, "value": val},
            highlight_indices=[i],
            snapshot=list(arr),
        )
        if val == target:
            tracer.emit(
                EventType.SOLUTION_FOUND,
                f"Found target={target} at index {i}",
                data={"index": i},
                highlight_indices=[i],
                snapshot=list(arr),
            )
            return i

    tracer.emit(
        EventType.MESSAGE,
        f"Target={target} not found.",
        data={"result": -1},
        snapshot=list(arr),
    )
    return -1
