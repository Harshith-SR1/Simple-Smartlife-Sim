def clamp(value, minimum=0.0, maximum=1.0):
    return min(maximum, max(minimum, value))


def update_needs(state):
    state["hunger"] = clamp(state["hunger"] + 0.05)
    state["thirst"] = clamp(state["thirst"] + 0.04)
    state["energy"] = clamp(state["energy"] - 0.04)

    if state["hunger"] > 0.7 or state["thirst"] > 0.7:
        state["health"] = clamp(state["health"] - 0.02)
        state["stress"] = clamp(state["stress"] + 0.04)
    else:
        state["stress"] = clamp(state["stress"] - 0.02)

    if state["stress"] > 0.7:
        efficiency_modifier = 0.55
    else:
        efficiency_modifier = 1.0

    state["productivity"] = clamp(
        state["energy"] * 0.4 + (1.0 - state["hunger"]) * 0.25 + state["skill_level"] * 0.2 - state["stress"] * 0.15
    )
    state["efficiency"] = clamp(
        (0.35 + state["energy"] * 0.3 + (1.0 - state["stress"]) * 0.25 + min(1.0, state["skill_level"] / 4.0) * 0.1)
        * efficiency_modifier
    )
