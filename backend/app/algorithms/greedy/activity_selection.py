"""
Activity Selection — Greedy
Select maximum number of non-overlapping activities.
Time:  O(n log n)
Space: O(n)
"""
from app.tracer import Tracer, EventType


def activity_selection(
    activities: list[tuple[int, int, str]],  # (start, finish, name)
    tracer: Tracer,
) -> list[tuple[int, int, str]]:
    """Returns selected non-overlapping activities."""
    if not activities:
        tracer.emit(EventType.MESSAGE, "No activities provided.")
        return []

    sorted_acts = sorted(activities, key=lambda a: a[1])

    tracer.emit(
        EventType.INITIALIZE,
        f"Activity Selection: {len(activities)} activities sorted by finish time",
        data={"activities": [(a[2], a[0], a[1]) for a in sorted_acts]},
    )

    selected = [sorted_acts[0]]
    last_finish = sorted_acts[0][1]

    tracer.emit(
        EventType.INCLUDE,
        f"Select first activity '{sorted_acts[0][2]}' [start={sorted_acts[0][0]}, finish={sorted_acts[0][1]}]",
        data={"activity": sorted_acts[0]},
    )

    for i in range(1, len(sorted_acts)):
        act = sorted_acts[i]
        start, finish, name = act

        tracer.emit(
            EventType.COMPARISON,
            f"Consider '{name}' [start={start}, finish={finish}] vs last_finish={last_finish}",
            data={"activity": act, "last_finish": last_finish},
        )

        if start >= last_finish:
            selected.append(act)
            last_finish = finish
            tracer.emit(
                EventType.INCLUDE,
                f"Select '{name}' — start {start} ≥ last_finish {last_finish - (finish - start)}",
                data={"activity": act, "selected": [(a[2], a[0], a[1]) for a in selected]},
            )
        else:
            tracer.emit(
                EventType.EXCLUDE,
                f"Skip '{name}' — start {start} < last_finish {last_finish}",
                data={"activity": act},
            )

    tracer.emit(
        EventType.COMPLETE,
        f"Selected {len(selected)} activities",
        data={"selected": [(a[2], a[0], a[1]) for a in selected]},
    )
    return selected


def fractional_knapsack(
    weights: list[float],
    values: list[float],
    capacity: float,
    tracer: Tracer,
) -> tuple[float, list[tuple[int, float]]]:
    """
    Returns (total_value, [(item_index, fraction_taken)]).
    """
    n = len(weights)
    items = [(values[i] / weights[i], weights[i], values[i], i) for i in range(n)]
    items.sort(reverse=True)

    tracer.emit(
        EventType.INITIALIZE,
        f"Fractional Knapsack: {n} items, capacity={capacity}",
        data={"weights": weights, "values": values, "capacity": capacity},
    )

    total = 0.0
    remaining = capacity
    taken: list[tuple[int, float]] = []

    for ratio, w, v, idx in items:
        tracer.emit(
            EventType.SELECTION,
            f"Item {idx} (v/w ratio={ratio:.3f}, w={w}, v={v})",
            data={"item": idx, "ratio": ratio, "weight": w, "value": v, "remaining": remaining},
        )
        if remaining <= 0:
            break
        if w <= remaining:
            taken.append((idx, 1.0))
            total += v
            remaining -= w
            tracer.emit(
                EventType.INCLUDE,
                f"Take full item {idx}: value += {v}",
                data={"item": idx, "fraction": 1.0, "total": total},
            )
        else:
            fraction = remaining / w
            total += fraction * v
            taken.append((idx, fraction))
            remaining = 0
            tracer.emit(
                EventType.INCLUDE,
                f"Take {fraction:.3f} of item {idx}: value += {fraction * v:.3f}",
                data={"item": idx, "fraction": fraction, "total": total},
            )

    tracer.emit(
        EventType.COMPLETE,
        f"Fractional Knapsack complete. Total value={total:.4f}",
        data={"total_value": total, "taken": taken},
    )
    return total, taken
