def compute_reward(state, action):
    financial_gain = min(1.0, max(0.0, (state["money"] - 800.0) / 800.0))
    agriculture_output = min(1.0, max(0.0, state["agri_output"]))
    salary_growth = min(1.0, max(0.0, state.get("salary_growth", 0.0)))
    hunger_penalty = state["hunger"]
    stress_penalty = state["stress"]

    raw_reward = (
        0.18 * state["productivity"]
        + 0.18 * state["health"]
        + 0.14 * state["energy"]
        + 0.18 * financial_gain
        + 0.14 * agriculture_output
        + 0.18 * salary_growth
        - 0.1 * hunger_penalty
        - 0.1 * stress_penalty
    )
    return min(1.0, max(0.0, raw_reward))
