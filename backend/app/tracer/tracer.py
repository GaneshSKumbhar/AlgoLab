"""
AlgoLab Tracer System
=====================
Every algorithm receives a Tracer instance. It emits structured events
during execution. The frontend replays these events step-by-step.
"""
from __future__ import annotations
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel


class EventType(str, Enum):
    COMPARISON      = "comparison"
    SWAP            = "swap"
    VISIT           = "visit"
    ENQUEUE         = "enqueue"
    DEQUEUE         = "dequeue"
    RELAXATION      = "relaxation"
    SELECTION       = "selection"
    PARTITION       = "partition"
    RECURSIVE_CALL  = "recursive_call"
    RECURSIVE_RETURN= "recursive_return"
    DP_UPDATE       = "dp_update"
    DECISION        = "decision"
    BACKTRACK       = "backtrack"
    INCLUDE         = "include"
    EXCLUDE         = "exclude"
    EDGE_SELECTED   = "edge_selected"
    EDGE_REJECTED   = "edge_rejected"
    FLOW_UPDATE     = "flow_update"
    STATE_CHANGE    = "state_change"
    SOLUTION_FOUND  = "solution_found"
    PIVOT_SET       = "pivot_set"
    HIGHLIGHT       = "highlight"
    MARK_SORTED     = "mark_sorted"
    MESSAGE         = "message"
    INITIALIZE      = "initialize"
    COMPLETE        = "complete"


class TraceEvent(BaseModel):
    step: int
    type: EventType
    message: str
    data: dict[str, Any] = {}
    highlight_indices: list[int] = []
    highlight_nodes: list[str] = []
    highlight_edges: list[tuple[str, str]] = []
    snapshot: Optional[list[Any]] = None   # Array snapshot at this step
    dp_table_snapshot: Optional[list[list[Any]]] = None


class Tracer:
    """
    Collects execution events from algorithms.
    Pass an instance to each algorithm function.
    The algorithm calls tracer.emit(...) to record events.
    """

    def __init__(self) -> None:
        self.events: list[TraceEvent] = []
        self._step = 0
        self.metrics: dict[str, int] = {
            "comparisons": 0,
            "swaps": 0,
            "visits": 0,
            "recursive_calls": 0,
            "dp_updates": 0,
            "edge_relaxations": 0,
            "backtrack_steps": 0,
            "array_accesses": 0,
        }

    def emit(
        self,
        event_type: EventType,
        message: str,
        data: dict[str, Any] | None = None,
        highlight_indices: list[int] | None = None,
        highlight_nodes: list[str] | None = None,
        highlight_edges: list[tuple[str, str]] | None = None,
        snapshot: list[Any] | None = None,
        dp_table_snapshot: list[list[Any]] | None = None,
    ) -> None:
        self._step += 1
        self._update_metrics(event_type)
        event = TraceEvent(
            step=self._step,
            type=event_type,
            message=message,
            data=data or {},
            highlight_indices=highlight_indices or [],
            highlight_nodes=highlight_nodes or [],
            highlight_edges=highlight_edges or [],
            snapshot=snapshot,
            dp_table_snapshot=dp_table_snapshot,
        )
        self.events.append(event)

    def _update_metrics(self, et: EventType) -> None:
        if et == EventType.COMPARISON:
            self.metrics["comparisons"] += 1
        elif et == EventType.SWAP:
            self.metrics["swaps"] += 1
        elif et == EventType.VISIT:
            self.metrics["visits"] += 1
        elif et == EventType.RECURSIVE_CALL:
            self.metrics["recursive_calls"] += 1
        elif et == EventType.DP_UPDATE:
            self.metrics["dp_updates"] += 1
        elif et == EventType.RELAXATION:
            self.metrics["edge_relaxations"] += 1
        elif et == EventType.BACKTRACK:
            self.metrics["backtrack_steps"] += 1

    def get_events(self) -> list[dict]:
        return [e.model_dump() for e in self.events]

    def get_metrics(self) -> dict[str, int]:
        return dict(self.metrics)
