from copy import deepcopy

from rl_agent import RLAgent, generate_suggestion

from .actions import ACTIONS
from grader.grader import evaluate_all_tasks
from .household_system import update_household
from .needs_system import update_needs
from .agents import update_agents
from .hospital_system import update_hospital_queue
from .state import INITIAL_STATE
from .time_system import update_phase, update_time
from .trading_system import update_trading
from .agriculture_system import update_agriculture
from .weather_system import update_weather


JOB_LEVELS = [
    ("Junior", 100.0, 0.3),
    ("Mid", 200.0, 0.6),
    ("Senior", 400.0, 0.9),
    ("Lead", 700.0, 1.2),
]

HARVEST_READY_STAGE = 4

RL_ACTIONS = {
    "sleep",
    "rest",
    "eat",
    "work",
    "meeting",
    "deadline_task",
    "treatment",
    "consult",
    "rest_hospital",
    "harvest",
    "plant",
    "water",
    "farm_rest",
}

ACTION_ALIAS_TO_RL = {
    "visit_doctor": "treatment",
    "get_treatment": "treatment",
    "plant_crop": "plant",
    "harvest_crop": "harvest",
    "help_agriculture": "water",
    "wait": "rest_hospital",
}


def clamp(value, minimum=0.0, maximum=1.0):
    return min(maximum, max(minimum, float(value)))


class SmartLifeSimEnv:
    def __init__(self):
        self.step_count = 0
        self._state = deepcopy(INITIAL_STATE)
        self._rl_agent = RLAgent(alpha=0.1, gamma=0.9, epsilon=0.1)
        self._evaluate_decision()

    def reset(self):
        self.step_count = 0
        self._state = deepcopy(INITIAL_STATE)
        self._evaluate_decision()
        return self._state

    def _evaluate_decision(self):
        selected_action, q_values = self._rl_agent.select_action(self._state, explore=False)
        suggestion = generate_suggestion(self._state, selected_action, q_values)

        task = str(self._state.get("current_task", "daily_survival")).lower()
        location = str(self._state.get("location", "home")).lower()
        reason = "Selected due to highest expected reward based on current state"
        
        # Navigation Awareness Override
        if task == "agri_sustainability" and location not in {"farm", "village"}:
            selected_action = "travel_farm"
            reason = "Navigating to the village/farm to oversee agricultural output and sustainability."
        elif task == "career_growth" and location != "office" and self._state.get("energy", 1.0) > 0.4:
            selected_action = "travel_office"
            reason = "Traveling to the city center to maximize corporate productivity and earnings."
        elif task == "daily_survival" and (self._state.get("energy", 1.0) < 0.3 or self._state.get("health", 1.0) < 0.4) and location != "home":
            selected_action = "travel_home"
            reason = "Returning home to coordinate rest and stabilize critical wellbeing metrics."

        if selected_action in {"sleep", "rest", "rest_hospital", "farm_rest"}:
             reason = "Choosing rest to recover critical energy and stabilize wellbeing." if task == "daily_survival" else "Strategic recovery to maintain long-term productivity."
        elif selected_action in {"harvest", "plant", "water"}:
             reason = "Executing agricultural steps to maximize crop yield and sustainability." if task == "agri_sustainability" else "Diversifying income via rural output."
        elif selected_action in {"work", "deadline_task", "meeting"}:
             reason = "Prioritizing corporate output to maximize salary and bank balance." if task == "career_growth" else "Generating income for daily maintenance."

        self._state["decision_source"] = "RL Agent"
        self._state["selected_action"] = selected_action
        self._state["selected_decision"] = selected_action
        self._state["q_values"] = q_values
        self._state["decision_scores"] = {
            "sleep": float(q_values.get("sleep", 0.0)),
            "work": float(max(q_values.get("work", 0.0), q_values.get("meeting", 0.0), q_values.get("deadline_task", 0.0))),
            "farm": float(max(q_values.get("harvest", 0.0), q_values.get("plant", 0.0), q_values.get("water", 0.0), q_values.get("farm_rest", 0.0))),
            "hospital": float(max(q_values.get("treatment", 0.0), q_values.get("consult", 0.0), q_values.get("rest_hospital", 0.0))),
        }
        self._state["suggestion"] = suggestion
        self._state["decision_issue"] = f"Strategic Shift: {task.replace('_', ' ').title()}"
        self._state["decision_reason"] = reason
        return selected_action, q_values, suggestion

    def _update_career(self):
        state = self._state
        state["salary"] = round(state["career_base_salary"] * state["skill_level"], 2)

        current_index = next((index for index, level in enumerate(JOB_LEVELS) if level[0] == state["job_level"]), 0)
        threshold = JOB_LEVELS[current_index][2]

        if state["experience"] >= threshold and current_index < len(JOB_LEVELS) - 1:
            next_index = current_index + 1
            state["job_level"] = JOB_LEVELS[next_index][0]
            state["career_base_salary"] = JOB_LEVELS[next_index][1]
            state["salary"] = round(state["career_base_salary"] * state["skill_level"], 2)
            state["experience"] = 0.0
            state["promotion_progress"] = 0.0
            state["last_effect"] = f"Promoted to {state['job_level']}"
        else:
            state["promotion_progress"] = min(1.0, state["experience"] / threshold)

    def _normalize_requested_action(self, requested_action: str, selected_action: str):
        action = str(requested_action or "").strip().lower()
        if action in {"", "auto", "rl", "rl_auto"}:
            return selected_action
        if action in ACTION_ALIAS_TO_RL:
            return ACTION_ALIAS_TO_RL[action]
        return action

    def _apply_rl_action(self, action: str):
        state = self._state
        location = str(state.get("location", "home")).lower()

        if action in {"sleep", "rest", "eat"} and location != "home":
            state["location"] = "home"
        elif action in {"work", "meeting", "deadline_task"} and location != "office":
            state["location"] = "office"
        elif action in {"treatment", "consult", "rest_hospital"} and location != "hospital":
            state["location"] = "hospital"
        elif action in {"harvest", "plant", "water", "farm_rest"} and location not in {"farm", "village"}:
            state["location"] = "village"

        if action == "sleep":
            state["energy"] = clamp(state["energy"] + 0.3)
            state["stress"] = clamp(state["stress"] - 0.2)
            effect = "+Energy, -Stress"
        elif action == "rest":
            state["energy"] = clamp(state["energy"] + 0.15)
            state["stress"] = clamp(state["stress"] - 0.1)
            effect = "+Energy, -Stress"
        elif action == "eat":
            state["energy"] = clamp(state["energy"] + 0.1)
            state["health"] = clamp(state["health"] + 0.05)
            effect = "+Energy, +Health"
        elif action == "work":
            wc = state.get("work_count", 0) + 1
            state["work_count"] = wc
            if wc % 10 == 0:
                state["salary"] = float(state.get("salary", 100)) + 50.0
                state["skill_level"] = float(state.get("skill_level", 1.0)) + 1.0
            
            salary = float(state.get("salary", 100))
            state["money"] = max(0.0, float(state["money"]) + salary)
            state["bank_balance"] = state["money"]
            state["stress"] = clamp(state["stress"] + 0.1)
            state["energy"] = clamp(state["energy"] - 0.1)
            effect = f"+Rs {salary}, -Energy, +Stress"
        elif action == "meeting":
            state["stress"] = clamp(state["stress"] + 0.05)
            effect = "+Stress"
        elif action == "deadline_task":
            wc = state.get("work_count", 0) + 1
            state["work_count"] = wc
            if wc % 10 == 0:
                state["salary"] = float(state.get("salary", 100)) + 50.0
                state["skill_level"] = float(state.get("skill_level", 1.0)) + 1.0
            
            salary = float(state.get("salary", 100)) * 2
            state["money"] = max(0.0, float(state["money"]) + salary)
            state["bank_balance"] = state["money"]
            state["stress"] = clamp(state["stress"] + 0.3)
            state["energy"] = clamp(state["energy"] - 0.2)
            effect = f"+Rs {salary}, -Energy, +Stress"
        elif action == "treatment":
            state["health"] = clamp(state["health"] + 0.3)
            state["money"] = max(0.0, float(state["money"]) - 200.0)
            state["bank_balance"] = state["money"]
            effect = "+Health, -Rs 200"
        elif action == "consult":
            state["health"] = clamp(state["health"] + 0.1)
            state["money"] = max(0.0, float(state["money"]) - 50.0)
            state["bank_balance"] = state["money"]
            effect = "+Health, -Rs 50"
        elif action == "rest_hospital":
            state["energy"] = clamp(state["energy"] + 0.2)
            effect = "+Energy"
        elif action == "harvest":
            if state.get("water_level", 1.0) <= 0.0:
                effect = "Failed: Needs Water"
            else:
                state["water_level"] = max(0.0, state.get("water_level", 1.0) - 0.2)
                state["money"] = max(0.0, float(state["money"]) + 300.0)
                state["bank_balance"] = state["money"]
                state["energy"] = clamp(state["energy"] - 0.2)
                state["crop_stage"] = max(0, int(state.get("crop_stage", 0)) - 1)
                state["crop_progress"] = (float(state["crop_stage"]) / 5.0) * 100.0
                effect = "+Rs 300, -Energy, -Water"
        elif action == "plant":
            state["crop_stage"] = min(5, int(state.get("crop_stage", 0)) + 1)
            state["crop_progress"] = (float(state["crop_stage"]) / 5.0) * 100.0
            state["energy"] = clamp(state["energy"] - 0.1)
            state["water_level"] = min(1.0, state.get("water_level", 1.0) + 0.5)
            effect = "+Crop stage, -Energy, +Water"
        elif action == "water":
            state["crop_stage"] = min(5, int(state.get("crop_stage", 0)) + 1)
            state["crop_progress"] = (float(state["crop_stage"]) / 5.0) * 100.0
            state["water_level"] = 1.0
            effect = "+Crop stage, Water Full"
        elif action == "farm_rest":
            state["energy"] = clamp(state["energy"] + 0.1)
            effect = "+Energy"
        else:
            effect = "No effect"

        # Champion Move: Rain automatically grows crops in Green Economy
        if state.get("current_task") == "agri_sustainability" and state.get("weather") == "rain":
            state["crop_stage"] = min(5, int(state.get("crop_stage", 0)) + 1)
            state["crop_progress"] = (float(state["crop_stage"]) / 5.0) * 100.0
            state["water_level"] = 1.0

        state["last_action"] = action
        state["last_effect"] = effect

    def _compute_rl_reward(self):
        state = self._state
        health = clamp(state.get("health", 0.0))
        energy = clamp(state.get("energy", 0.0))
        stress = clamp(state.get("stress", 0.0))
        money = float(state.get("money", 0.0))
        crop_stage = int(state.get("crop_stage", 0))
        task = state.get("current_task", "daily_survival")
        location = str(state.get("location", "home")).lower()

        reward = (2.0 * health) + (1.5 * energy) + (0.002 * money) - (2.0 * stress)

        # Champion Task Rewards
        if task == "daily_survival" and location == "home":
             reward += 3.0
        elif task == "career_growth" and location == "office":
             reward += 3.0
        elif task == "agri_sustainability" and location in {"village", "farm"}:
             reward += 3.0

        if crop_stage >= HARVEST_READY_STAGE:
            reward += 5.0
        if health < 0.3:
            reward -= 5.0
        if stress > 0.8:
            reward -= 3.0

        return float(reward)

    def step(self, action: str):
        selected_action, q_values, suggestion = self._evaluate_decision()
        requested_action = self._normalize_requested_action(action, selected_action)

        is_travel_action = requested_action.startswith("travel_")
        is_rl_action = requested_action in RL_ACTIONS
        is_legacy_action = requested_action in ACTIONS

        if not is_travel_action and not is_rl_action and not is_legacy_action:
            task_scores = evaluate_all_tasks(self._state)
            return {
                "state": self._state,
                "action": selected_action,
                "decision_source": "RL Agent",
                "q_values": q_values,
                "reward": -0.05,
                "suggestion": suggestion,
                "done": False,
                "task_scores": task_scores,
                "info": {"error": f"Invalid action: {action}"},
            }

        prev_state = deepcopy(self._state)

        try:
            if is_travel_action or (is_legacy_action and not is_rl_action):
                ACTIONS[requested_action](self._state)
            else:
                self._apply_rl_action(requested_action)

            update_time(self._state)
            update_phase(self._state)
            update_weather(self._state)
            update_needs(self._state)
            self._update_career()
            update_trading(self._state)
            update_household(self._state)
            update_hospital_queue(self._state)
            update_agriculture(self._state)
            update_agents(self._state)

            reward = self._compute_rl_reward()
            self._state["current_score"] = reward
            self._state["current_task"] = self._state.get("current_task", "easy")
            task_scores = evaluate_all_tasks(self._state)

            self._rl_agent.update(prev_state, requested_action if requested_action in RL_ACTIONS else selected_action, reward, self._state)
            selected_action, q_values, suggestion = self._evaluate_decision()
        except Exception as error:
            return {
                "state": self._state,
                "action": selected_action,
                "decision_source": "RL Agent",
                "q_values": q_values,
                "reward": -0.01,
                "suggestion": suggestion,
                "done": False,
                "task_scores": {},
                "info": {"error": f"Simulation update failed: {error}"},
            }

        self.step_count += 1
        done = self._state.get("time", 0) >= 24 or self._state["health"] <= 0

        return {
            "state": self._state,
            "action": selected_action,
            "decision_source": "RL Agent",
            "q_values": q_values,
            "reward": reward,
            "suggestion": suggestion,
            "done": done,
            "task_scores": task_scores,
            "info": {},
            "decision_scores": self._state.get("decision_scores", {}),
        }

    def get_state(self):
        return self._state

    def state(self):
        return self.get_state()
