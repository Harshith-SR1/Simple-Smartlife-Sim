def update_agriculture(state):
    if 0 < state["crop_stage"] < 3:
        growth_rate = {
            "rainy": 0.5,
            "sunny": 0.35,
            "cloudy": 0.2,
        }.get(state["weather"], 0.2)
        state["crop_progress"] += growth_rate
        if state["crop_progress"] >= 1.0:
            state["crop_stage"] += 1
            state["crop_progress"] = 0.0

    if state["crop_stage"] == 1:
        state["agri_output"] = 0.25 * state["soil_quality"]
    elif state["crop_stage"] == 2:
        state["agri_output"] = 0.55 * state["soil_quality"]
    elif state["crop_stage"] == 3:
        state["agri_output"] = 1.0 * state["soil_quality"]
    else:
        state["agri_output"] = 0.0

    state["expected_agri_income"] = round(state["agri_output"] * 50.0, 2)

    if state["location"] == "farm":
        state["soil_quality"] = min(1.0, state["soil_quality"] + 0.004)
    else:
        state["soil_quality"] = max(0.0, state["soil_quality"] - 0.002)
