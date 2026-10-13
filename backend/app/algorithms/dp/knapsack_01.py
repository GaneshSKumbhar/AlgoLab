"""
0/1 Knapsack — Dynamic Programming
Maximize total value given weight constraint.
Time:  O(n·W)
Space: O(n·W)
"""
from app.tracer import Tracer, EventType


def knapsack_01(
    weights: list[int],
    values: list[int],
    capacity: int,
    tracer: Tracer,
) -> tuple[int, list[int], list[list[int]]]:
    """
    Returns (max_value, selected_items, dp_table).
    selected_items: indices of chosen items (0-indexed).
    """
    n = len(weights)
    # dp[i][w] = max value using first i items with capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    tracer.emit(
        EventType.INITIALIZE,
        f"0/1 Knapsack: {n} items, capacity={capacity}",
        data={"weights": weights, "values": values, "capacity": capacity},
        dp_table_snapshot=[row[:] for row in dp],
    )

    for i in range(1, n + 1):
        item_idx = i - 1
        w_i = weights[item_idx]
        v_i = values[item_idx]

        for w in range(capacity + 1):
            if w_i > w:
                dp[i][w] = dp[i - 1][w]
                tracer.emit(
                    EventType.DP_UPDATE,
                    f"Item {i} (w={w_i}, v={v_i}): too heavy for cap={w}, carry dp[{i-1}][{w}]={dp[i][w]}",
                    data={"i": i, "w": w, "value": dp[i][w], "action": "skip"},
                    dp_table_snapshot=[row[:] for row in dp],
                )
            else:
                without = dp[i - 1][w]
                with_item = dp[i - 1][w - w_i] + v_i
                tracer.emit(
                    EventType.COMPARISON,
                    f"Item {i} (w={w_i}, v={v_i}), cap={w}: include={with_item} vs exclude={without}",
                    data={"i": i, "w": w, "include": with_item, "exclude": without},
                    dp_table_snapshot=[row[:] for row in dp],
                )
                dp[i][w] = max(without, with_item)
                action = "include" if with_item > without else "exclude"
                tracer.emit(
                    EventType.DP_UPDATE,
                    f"dp[{i}][{w}] = {dp[i][w]} ({action} item {i})",
                    data={"i": i, "w": w, "value": dp[i][w], "action": action},
                    dp_table_snapshot=[row[:] for row in dp],
                )

    # Backtrack to find selected items
    selected: list[int] = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)
            w -= weights[i - 1]

    selected.reverse()
    max_value = dp[n][capacity]

    tracer.emit(
        EventType.COMPLETE,
        f"Max value={max_value}, selected items: {selected}",
        data={"max_value": max_value, "selected_items": selected},
        dp_table_snapshot=[row[:] for row in dp],
    )
    return max_value, selected, dp


def knapsack_naive(
    weights: list[int],
    values: list[int],
    capacity: int,
    tracer: Tracer,
) -> tuple[int, list[int]]:
    """Brute force: try all 2^n subsets."""
    n = len(weights)
    best_val = 0
    best_subset: list[int] = []

    tracer.emit(
        EventType.INITIALIZE,
        f"Naive Knapsack: {n} items, 2^{n}={2**n} subsets",
        data={"weights": weights, "values": values, "capacity": capacity},
    )

    for mask in range(1 << n):
        subset = [i for i in range(n) if mask & (1 << i)]
        total_w = sum(weights[i] for i in subset)
        total_v = sum(values[i] for i in subset)

        tracer.emit(
            EventType.COMPARISON,
            f"Subset {subset}: weight={total_w}, value={total_v}",
            data={"subset": subset, "weight": total_w, "value": total_v, "feasible": total_w <= capacity},
        )

        if total_w <= capacity and total_v > best_val:
            best_val = total_v
            best_subset = subset
            tracer.emit(
                EventType.SOLUTION_FOUND,
                f"New best: value={best_val}, items={best_subset}",
                data={"value": best_val, "items": best_subset},
            )

    tracer.emit(
        EventType.COMPLETE,
        f"Naive knapsack done. Best={best_val}",
        data={"max_value": best_val, "selected_items": best_subset},
    )
    return best_val, best_subset
