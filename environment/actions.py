def clamp(value, minimum=0.0, maximum=1.0):
    return min(maximum, max(minimum, value))


def update_decision_trace(state, action, effect):
    state["last_action"] = action
    state["last_effect"] = effect
    history_entry = {
        "time": state["time"],
        "day": state["day"],
        "issue": state.get("decision_issue", "Unknown"),
        "reason": state.get("decision_reason", "Unknown"),
        "action": action,
        "effect": effect,
    }
    state["decision_history"] = (state.get("decision_history", []) + [history_entry])[-8:]


def credit_bank(state, amount):
    value = max(0.0, float(amount))
    state["money"] += value
    state["bank_balance"] = max(0.0, state.get("bank_balance", state["money"]) + value)


def debit_bank(state, amount):
    value = max(0.0, float(amount))
    state["money"] = max(0.0, state["money"] - value)
    state["bank_balance"] = max(0.0, state.get("bank_balance", state["money"]) - value)


def work(state):
    if state["location"] != "office":
        update_decision_trace(state, "work", "Must be at office")
        return

    effective_efficiency = state["efficiency"]
    if state["stress"] > 0.7:
        effective_efficiency *= 0.7
    income = state["salary"] * effective_efficiency
    credit_bank(state, income)
    state["energy"] = clamp(state["energy"] - 0.14)
    state["stress"] = clamp(state["stress"] + 0.08)
    state["experience"] += 0.1
    state["promotion_progress"] = min(1.0, state["promotion_progress"] + 0.1)
    state["salary_growth"] = income / max(1.0, state["salary"] * 4.0)
    update_decision_trace(state, "work", f"+Rs {income:.0f}, +EXP")


def work_online(state):
    if state["location"] not in ["home", "village", "farm", "office"]:
        update_decision_trace(state, "work_online", "Need home, village, farm or office")
        return

    effective_efficiency = state["efficiency"] * (0.9 if state["location"] == "office" else 0.72)
    if state["stress"] > 0.7:
        effective_efficiency *= 0.75

    income = state["salary"] * effective_efficiency
    credit_bank(state, income)
    state["energy"] = clamp(state["energy"] - 0.1)
    state["stress"] = clamp(state["stress"] + 0.05)
    state["experience"] += 0.06
    state["promotion_progress"] = min(1.0, state["promotion_progress"] + 0.06)
    state["salary_growth"] = income / max(1.0, state["salary"] * 4.0)
    update_decision_trace(state, "work_online", f"+Rs {income:.0f}, remote work")


def rest(state):
    state["energy"] = clamp(state["energy"] + 0.22)
    if state["location"] == "hospital":
        state["stress"] = clamp(state["stress"] - 0.24)
        state["health"] = clamp(state["health"] + 0.06)
        update_decision_trace(state, "rest", "+Energy, -Stress, +Health (hospital)")
        return

    state["stress"] = clamp(state["stress"] - 0.18)
    state["health"] = clamp(state["health"] + 0.03)
    update_decision_trace(state, "rest", "+Energy, -Stress")


def eat(state):
    if state["food_available"] > 0:
        state["food_available"] -= 1
        state["hunger"] = clamp(state["hunger"] - 0.35)
        state["energy"] = clamp(state["energy"] + 0.08)
        effect = "-Hunger, +Energy"
    else:
        debit_bank(state, 10.0)
        state["hunger"] = clamp(state["hunger"] - 0.15)
        effect = "-Rs 10, emergency meal"
    update_decision_trace(state, "eat", effect)


def visit_doctor(state):
    if state["location"] != "hospital":
        state["location"] = "hospital"
        effect = "Moved to hospital"
    else:
        debit_bank(state, 50.0)
        state["health"] = clamp(state["health"] + 0.25)
        state["stress"] = clamp(state["stress"] - 0.12)
        effect = "+Health, -Stress, -Rs 50"
    update_decision_trace(state, "visit_doctor", effect)


def travel(state, destination):
    if destination in ["home", "office", "hospital", "farm", "village"] and state["location"] != destination:
        cost = {"home": 0, "office": 10, "hospital": 12, "farm": 14, "village": 16}[destination]
        debit_bank(state, cost)
        state["location"] = destination
        travel_penalty = 0.05 if state["weather"] == "rainy" else 0.03
        state["energy"] = clamp(state["energy"] - travel_penalty)
        state["stress"] = clamp(state["stress"] + 0.02)
        update_decision_trace(state, f"travel_{destination}", f"Moved to {destination}, -Rs {cost}")
    else:
        update_decision_trace(state, f"travel_{destination}", "No movement needed")


def help_agriculture(state):
    if state["location"] in ["farm", "village"]:
        state["energy"] = clamp(state["energy"] - 0.2)
        state["agri_output"] = clamp(state["agri_output"] + 0.12)
        state["soil_quality"] = clamp(state["soil_quality"] + 0.04)
        state["stress"] = clamp(state["stress"] - 0.04)
        effect = "+Agri output"
    else:
        effect = "Must be at farm or village"
    update_decision_trace(state, "help_agriculture", effect)


def plant_crop(state):
    if state["location"] in ["farm", "village"]:
        state["energy"] = clamp(state["energy"] - 0.1)
        state["crop_stage"] = 1
        state["crop_progress"] = 0.0
        effect = "Crop planted"
    else:
        effect = "Must be at farm or village"
    update_decision_trace(state, "plant_crop", effect)


def harvest_crop(state):
    if state["location"] in ["farm", "village"] and state["crop_stage"] == 3:
        income = state["agri_output"] * 50.0
        credit_bank(state, income)
        state["agri_output"] = 0.0
        state["crop_stage"] = 0
        state["crop_progress"] = 0.0
        state["energy"] = clamp(state["energy"] - 0.08)
        effect = f"+Rs {income:.0f} harvest credited to bank"
    else:
        effect = "Crop not ready"
    update_decision_trace(state, "harvest_crop", effect)


def learn_skill(state):
    state["skill_level"] += 0.1
    state["energy"] = clamp(state["energy"] - 0.1)
    state["stress"] = clamp(state["stress"] + 0.02)
    update_decision_trace(state, "learn_skill", "+Skill level")


def harvest_and_office_work(state):
    if state["location"] not in ["farm", "village"]:
        update_decision_trace(state, "harvest_and_office_work", "Must be at farm or village")
        return

    state["current_task"] = "harvest_office"

    if state.get("crop_stage", 0) != 3:
        update_decision_trace(state, "harvest_and_office_work", "Crop not ready for harvest")
        return

    credit_bank(state, 300.0)
    state["crop_stage"] = 0
    state["crop_progress"] = 0.0
    state["agri_output"] = 0.0
    state["energy"] = clamp(state["energy"] - 0.08)
    state["stress"] = clamp(state["stress"] - 0.05)

    state["location"] = "office"
    credit_bank(state, 200.0)
    state["energy"] = clamp(state["energy"] - 0.06)
    state["stress"] = clamp(state["stress"] + 0.05)
    state["experience"] += 0.08
    state["promotion_progress"] = min(1.0, state.get("promotion_progress", 0.0) + 0.08)
    state["salary_growth"] = 200.0 / max(1.0, state.get("salary", 100.0) * 4.0)

    update_decision_trace(
        state,
        "harvest_and_office_work",
        "Step 1: Crop ready -> harvesting (+Rs 300, -Energy, -Stress) | Step 2: Harvest complete -> going to office (+Rs 200, -Energy, +Stress)",
    )


ACTIONS = {
    "work": work,
    "work_online": work_online,
    "rest": rest,
    "wait": rest,
    "eat": eat,
    "visit_doctor": visit_doctor,
    "consult": visit_doctor,
    "travel_home": lambda state: travel(state, "home"),
    "travel_office": lambda state: travel(state, "office"),
    "travel_hospital": lambda state: travel(state, "hospital"),
    "travel_farm": lambda state: travel(state, "farm"),
    "travel_village": lambda state: travel(state, "village"),
    "help_agriculture": help_agriculture,
    "water": help_agriculture,
    "plant_crop": plant_crop,
    "plant": plant_crop,
    "harvest_crop": harvest_crop,
    "harvest": harvest_crop,
    "harvest_and_office_work": harvest_and_office_work,
    "learn_skill": learn_skill,
}
