def update_trading(state):
    # Simple market simulation (safe: only if portfolio field exists)
    if "portfolio" in state and "profit_loss" in state:
        if state["market_condition"] == "bull":
            state["portfolio"] += 10
            state["profit_loss"] += 10
        elif state["market_condition"] == "bear":
            state["portfolio"] -= 10
            state["profit_loss"] -= 10

    # Update market condition deterministically
    conditions = ["stable", "bull", "bear"]
    index = (state["day"] % 3)
    state["market_condition"] = conditions[index]