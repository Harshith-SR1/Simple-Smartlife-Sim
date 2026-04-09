import random
from typing import Dict, List, Tuple


GLOBAL_ACTIONS: List[str] = [
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
]

ACTION_SPACE = {
    "home": ["sleep", "rest", "eat"],
    "office": ["work", "meeting", "deadline_task"],
    "hospital": ["treatment", "consult", "rest_hospital"],
    "village": ["harvest", "plant", "water", "farm_rest"],
    "farm": ["harvest", "plant", "water", "farm_rest"],
}


class RLAgent:
    def __init__(self, alpha: float = 0.1, gamma: float = 0.9, epsilon: float = 0.1):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.q_table: Dict[Tuple, Dict[str, float]] = {}

    def get_state_key(self, state: Dict) -> Tuple:
        location = str(state.get("location", "home")).lower()
        if location not in ACTION_SPACE:
            location = "home"

        return (
            round(float(state.get("health", 0.0)), 1),
            round(float(state.get("energy", 0.0)), 1),
            round(float(state.get("stress", 0.0)), 1),
            int(round(float(state.get("money", 0.0)) / 100.0) * 100),
            location,
            int(state.get("crop_stage", 0)),
            str(state.get("weather", "sunny")).lower(),
            str(state.get("phase", state.get("time_phase", "morning"))).lower(),
        )

    def _available_actions(self, state: Dict) -> List[str]:
        location = str(state.get("location", "home")).lower()
        return ACTION_SPACE.get(location, ACTION_SPACE["home"])

    def _ensure_state(self, state_key: Tuple, actions: List[str]) -> Dict[str, float]:
        if state_key not in self.q_table:
            self.q_table[state_key] = {action: 0.0 for action in GLOBAL_ACTIONS}

        for action in GLOBAL_ACTIONS:
            self.q_table[state_key].setdefault(action, 0.0)

        # Return all actions so the UI can display broad decision scores.
        return self.q_table[state_key]

    def select_action(self, state: Dict, explore: bool = True):
        state_key = self.get_state_key(state)
        valid_actions = self._available_actions(state)
        state_q_values = self._ensure_state(state_key, valid_actions)

        # Champion Update: Inject task-specific baseline weights
        task = str(state.get("current_task", "daily_survival")).lower()
        baseline_weights = {}
        if task == "daily_survival":
            baseline_weights = {"sleep": 0.8, "rest": 0.6, "eat": 0.5, "rest_hospital": 0.4, "farm_rest": 0.3}
        elif task == "career_growth":
            baseline_weights = {"work": 0.9, "deadline_task": 0.8, "meeting": 0.7, "consult": 0.3}
        elif task == "agri_sustainability":
            baseline_weights = {"harvest": 0.9, "plant": 0.8, "water": 0.7, "farm_rest": 0.5, "work": 0.4}
            
        combined_q = {action: float(state_q_values.get(action, 0.0)) + baseline_weights.get(action, 0.0) for action in GLOBAL_ACTIONS}

        if explore and random.random() < self.epsilon:
            selected_action = random.choice(valid_actions)
        else:
            options = {a: combined_q.get(a, 0.0) for a in valid_actions}
            selected_action = max(options, key=options.get)

        return selected_action, combined_q

    def update(self, state: Dict, action: str, reward: float, next_state: Dict):
        state_key = self.get_state_key(state)
        next_state_key = self.get_state_key(next_state)

        state_actions = self._available_actions(state)
        next_actions = self._available_actions(next_state)

        self._ensure_state(state_key, state_actions)
        self._ensure_state(next_state_key, next_actions)

        current_q = self.q_table[state_key].get(action, 0.0)
        max_next_q = max((self.q_table[next_state_key].get(next_action, 0.0) for next_action in next_actions), default=0.0)

        updated_q = current_q + self.alpha * (reward + self.gamma * max_next_q - current_q)
        self.q_table[state_key][action] = float(updated_q)


def generate_suggestion(state: Dict, action: str, q_values: Dict[str, float]):
    messages = []
    energy = float(state.get("energy", 0.0))
    stress = float(state.get("stress", 0.0))
    crop_stage = int(state.get("crop_stage", 0))
    money = float(state.get("money", 0.0))
    health = float(state.get("health", 0.0))

    if energy < 0.3:
        messages.append("Energy critically low, consider rest or sleep.")
    if stress > 0.6:
        messages.append("Stress elevated, recovery-focused action is recommended.")
    if crop_stage >= 4:
        messages.append("Crop is near-ready, harvesting can improve returns.")
    if money < 900:
        messages.append("Money is below threshold, prioritize income actions.")
    if health < 0.5:
        messages.append("Health is low, hospital-related action is advisable.")

    sorted_actions = sorted(q_values.items(), key=lambda item: item[1], reverse=True)
    alternative_action = sorted_actions[1][0] if len(sorted_actions) > 1 else action

    return {
        "primary_action": action,
        "alternative_action": alternative_action,
        "messages": messages,
    }
