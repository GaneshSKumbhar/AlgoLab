"""
Coin Change — Dynamic Programming
Minimum coins to make target amount.
Time:  O(amount * len(coins))
Space: O(amount)
"""
from app.tracer import Tracer, EventType


INF = float("inf")


def coin_change(
    coins: list[int],
    amount: int,
    tracer: Tracer,
) -> tuple[int, list[int]]:
    """
    Returns (min_coins, coins_used).
    Returns (-1, []) if not possible.
    """
    dp = [INF] * (amount + 1)
    dp[0] = 0
    coin_used: list[int] = [-1] * (amount + 1)

    tracer.emit(
        EventType.INITIALIZE,
        f"Coin Change: coins={coins}, amount={amount}",
        data={"coins": coins, "amount": amount},
        snapshot=list(dp),
    )

    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                tracer.emit(
                    EventType.COMPARISON,
                    f"Try coin {c} for amount {a}: dp[{a-c}]+1={dp[a-c]+1} vs dp[{a}]={dp[a]}",
                    data={"amount": a, "coin": c, "prev": dp[a - c], "current": dp[a]},
                    snapshot=list(dp),
                )
                if dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1
                    coin_used[a] = c
                    tracer.emit(
                        EventType.DP_UPDATE,
                        f"dp[{a}] = {dp[a]} using coin {c}",
                        data={"amount": a, "value": dp[a], "coin": c},
                        snapshot=list(dp),
                    )

    if dp[amount] == INF:
        tracer.emit(
            EventType.COMPLETE,
            f"Cannot make amount={amount} with given coins.",
            data={"result": -1},
        )
        return -1, []

    # Reconstruct
    used: list[int] = []
    a = amount
    while a > 0:
        used.append(coin_used[a])
        a -= coin_used[a]

    tracer.emit(
        EventType.COMPLETE,
        f"Minimum {int(dp[amount])} coins: {used}",
        data={"min_coins": int(dp[amount]), "coins_used": used},
        snapshot=list(dp),
    )
    return int(dp[amount]), used
