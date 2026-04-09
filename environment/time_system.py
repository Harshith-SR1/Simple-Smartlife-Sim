def update_time(state):
    state["time"] = state["time"] + 1
    if state["time"] % 24 == 0:
        state["day"] += 1

def update_phase(state):
    time = state["time"] % 24
    if 5 <= time <= 11:
        state["phase"] = "morning"
    elif 12 <= time <= 16:
        state["phase"] = "afternoon"
    elif 17 <= time <= 20:
        state["phase"] = "evening"
    else:
        state["phase"] = "night"