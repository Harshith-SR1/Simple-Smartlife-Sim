def update_household(state):
    # Cleanliness decreases over time (safe: uses .get to handle missing field)
    if "cleanliness" in state:
        state["cleanliness"] -= 0.01
        state["cleanliness"] = max(0.0, state["cleanliness"])

    # Laundry increases if not done (safe: uses .get to handle missing field)
    if state["phase"] == "night" and "laundry_pending" in state:
        state["laundry_pending"] += 1