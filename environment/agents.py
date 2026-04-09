# Simple agent definitions
AGENTS = {
    "trader": {"visible": False},
    "farmer": {"active": False}
}

def update_agents(state):
    # Trader visible during market hours
    if 9 <= state["time"] <= 17:
        state["trader_visible"] = True
    else:
        state["trader_visible"] = False

    # Farmer active in morning/afternoon
    if state["phase"] in ["morning", "afternoon"]:
        state["farmer_active"] = True
    else:
        state["farmer_active"] = False