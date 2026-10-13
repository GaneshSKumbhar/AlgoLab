"""
Longest Common Subsequence — Dynamic Programming
Time:  O(m·n)
Space: O(m·n)
"""
from app.tracer import Tracer, EventType


def lcs(
    s1: str,
    s2: str,
    tracer: Tracer,
) -> tuple[int, str, list[list[int]]]:
    """
    Returns (lcs_length, lcs_string, dp_table).
    """
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    tracer.emit(
        EventType.INITIALIZE,
        f"LCS of '{s1}' (len={m}) and '{s2}' (len={n})",
        data={"s1": s1, "s2": s2},
        dp_table_snapshot=[row[:] for row in dp],
    )

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            tracer.emit(
                EventType.COMPARISON,
                f"Compare s1[{i-1}]='{s1[i-1]}' with s2[{j-1}]='{s2[j-1]}'",
                data={"i": i, "j": j, "c1": s1[i-1], "c2": s2[j-1]},
                dp_table_snapshot=[row[:] for row in dp],
            )
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                tracer.emit(
                    EventType.DP_UPDATE,
                    f"Match! dp[{i}][{j}] = dp[{i-1}][{j-1}] + 1 = {dp[i][j]}",
                    data={"i": i, "j": j, "value": dp[i][j], "match": True},
                    dp_table_snapshot=[row[:] for row in dp],
                )
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                tracer.emit(
                    EventType.DP_UPDATE,
                    f"No match: dp[{i}][{j}] = max({dp[i-1][j]}, {dp[i][j-1]}) = {dp[i][j]}",
                    data={"i": i, "j": j, "value": dp[i][j], "match": False},
                    dp_table_snapshot=[row[:] for row in dp],
                )

    # Backtrack
    lcs_chars: list[str] = []
    i, j = m, n
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            lcs_chars.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    lcs_string = "".join(reversed(lcs_chars))

    tracer.emit(
        EventType.COMPLETE,
        f"LCS = '{lcs_string}', length = {dp[m][n]}",
        data={"lcs": lcs_string, "length": dp[m][n]},
        dp_table_snapshot=[row[:] for row in dp],
    )
    return dp[m][n], lcs_string, dp
