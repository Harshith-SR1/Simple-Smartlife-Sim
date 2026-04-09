def update_hospital_queue(state):
    # Only process if queue_position field exists
    if "queue_position" in state and "being_served" in state:
        if state["queue_position"] is not None and not state["being_served"]:
            state["queue_position"] -= 1
            if state["queue_position"] <= 0:
                state["being_served"] = True