"""
N-Queens — Backtracking
Place N queens on an N×N board with no conflicts.
Time:  O(N!)  Space: O(N)
"""
from app.tracer import Tracer, EventType


def n_queens(n: int, tracer: Tracer, max_solutions: int = 10) -> list[list[int]]:
    """
    Returns list of solutions. Each solution is a list of length n
    where solution[row] = column of the queen in that row.
    """
    tracer.emit(
        EventType.INITIALIZE,
        f"N-Queens: N={n}. Finding up to {max_solutions} solutions.",
        data={"n": n},
    )

    solutions: list[list[int]] = []
    board: list[int] = [-1] * n  # board[row] = col

    def is_safe(row: int, col: int) -> bool:
        for r in range(row):
            c = board[r]
            if c == col or abs(c - col) == abs(r - row):
                return False
        return True

    def solve(row: int) -> None:
        if len(solutions) >= max_solutions:
            return

        if row == n:
            solutions.append(list(board))
            tracer.emit(
                EventType.SOLUTION_FOUND,
                f"Solution #{len(solutions)} found: {board}",
                data={"solution": list(board), "solution_num": len(solutions)},
                snapshot=list(board),
            )
            return

        for col in range(n):
            board[row] = col
            tracer.emit(
                EventType.DECISION,
                f"Try placing queen at row={row}, col={col}",
                data={"row": row, "col": col, "board": list(board)},
                snapshot=list(board),
            )

            if is_safe(row, col):
                tracer.emit(
                    EventType.INCLUDE,
                    f"Queen at ({row},{col}) is safe — continue",
                    data={"row": row, "col": col, "board": list(board)},
                    snapshot=list(board),
                )
                solve(row + 1)
            else:
                tracer.emit(
                    EventType.BACKTRACK,
                    f"Conflict at ({row},{col}) — backtrack",
                    data={"row": row, "col": col, "board": list(board)},
                    snapshot=list(board),
                )

        board[row] = -1
        if row > 0:
            tracer.emit(
                EventType.BACKTRACK,
                f"All columns exhausted at row={row}, backtrack to row={row - 1}",
                data={"row": row, "board": list(board)},
                snapshot=list(board),
            )

    solve(0)

    tracer.emit(
        EventType.COMPLETE,
        f"N-Queens complete. Found {len(solutions)} solutions.",
        data={"num_solutions": len(solutions), "solutions": solutions},
    )
    return solutions
