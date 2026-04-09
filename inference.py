import os
from typing import Any, Dict, List, Optional

from openai import OpenAI

from environment.env import SmartLifeSimEnv
from grader.grader import TASKS, grade_performance

# Optional when using docker-image based runners.
LOCAL_IMAGE_NAME = os.getenv("LOCAL_IMAGE_NAME")

API_KEY = os.getenv("HF_TOKEN") or os.getenv("API_KEY")
API_BASE_URL = os.getenv("API_BASE_URL", "https://router.huggingface.co/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen/Qwen2.5-72B-Instruct")
TASK_NAME = os.getenv("SMARTLIFESIM_TASK", "hard")
BENCHMARK = os.getenv("SMARTLIFESIM_BENCHMARK", "smartlifesim")
MAX_STEPS = int(os.getenv("MAX_STEPS", "24"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "64"))

RL_ACTIONS_BY_LOCATION = {
    "home": ["sleep", "rest", "eat"],
    "office": ["work", "meeting", "deadline_task"],
    "hospital": ["treatment", "consult", "rest_hospital"],
    "farm": ["harvest", "plant", "water", "farm_rest"],
    "village": ["harvest", "plant", "water", "farm_rest"],
}


def log_start(task: str, env: str, model: str) -> None:
    print(f"[START] task={task} env={env} model={model}", flush=True)


def log_step(step: int, action: str, reward: float, done: bool, error: Optional[str]) -> None:
    done_str = str(bool(done)).lower()
    error_str = error if error else "null"
    print(
        f"[STEP] step={step} action={action} reward={reward:.2f} done={done_str} error={error_str}",
        flush=True,
    )


def log_end(success: bool, steps: int, score: float, rewards: List[float]) -> None:
    rewards_str = ",".join(f"{value:.2f}" for value in rewards)
    print(
        f"[END] success={str(bool(success)).lower()} steps={steps} score={score:.2f} rewards={rewards_str}",
        flush=True,
    )


def _task_exists(task_id: str) -> bool:
    return any(entry.get("task_id") == task_id for entry in TASKS)


def _allowed_actions_for_state(state: Dict) -> List[str]:
    location = str(state.get("location", "home")).lower()
    return RL_ACTIONS_BY_LOCATION.get(location, RL_ACTIONS_BY_LOCATION["home"])


def _fallback_action(state: Dict) -> str:
    options = _allowed_actions_for_state(state)
    if not options:
        return "rest"

    energy = float(state.get("energy", 1.0))
    stress = float(state.get("stress", 0.0))
    health = float(state.get("health", 1.0))
    money = float(state.get("money", 1000.0))
    crop_stage = int(state.get("crop_stage", 0))

    if energy < 0.35:
        for candidate in ["sleep", "rest", "rest_hospital", "farm_rest"]:
            if candidate in options:
                return candidate

    if health < 0.5:
        for candidate in ["treatment", "consult", "rest_hospital"]:
            if candidate in options:
                return candidate

    if crop_stage >= 4 and "harvest" in options:
        return "harvest"

    if money < 1000:
        for candidate in ["work", "deadline_task", "meeting"]:
            if candidate in options:
                return candidate

    if stress > 0.7:
        for candidate in ["rest", "sleep", "farm_rest", "rest_hospital"]:
            if candidate in options:
                return candidate

    return options[0]


def _llm_action(client: Any, state: Dict, step: int) -> str:
    options = _allowed_actions_for_state(state)
    if not options:
        return "rest"

    prompt = (
        "You are choosing one action for SmartLifeSim. Return exactly one action token from allowed actions.\n"
        f"Step={step}\n"
        f"State={{health:{state.get('health')}, energy:{state.get('energy')}, stress:{state.get('stress')}, money:{state.get('money')}, "
        f"location:{state.get('location')}, crop_stage:{state.get('crop_stage')}, weather:{state.get('weather')}, phase:{state.get('phase')}}}\n"
        f"Allowed actions={options}\n"
        "Output only one action token with no explanation."
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You output a single valid action token only."},
                {"role": "user", "content": prompt},
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            stream=False,
        )
        raw = (completion.choices[0].message.content or "").strip().lower()
        action = raw.split()[0] if raw else ""
        if action in options:
            return action
    except Exception:
        pass

    return _fallback_action(state)


def run_episode(max_steps: int = MAX_STEPS, task_name: str = TASK_NAME) -> None:
    task_id = str(task_name).strip().lower()
    if not _task_exists(task_id):
        task_id = "hard"

    client = OpenAI(base_url=API_BASE_URL, api_key=API_KEY or "")
    env = SmartLifeSimEnv()

    rewards: List[float] = []
    steps_taken = 0
    success = False
    score = 0.0

    log_start(task=task_id, env=BENCHMARK, model=MODEL_NAME)

    try:
        state = env.reset()
        state["current_task"] = task_id

        for step in range(1, max_steps + 1):
            action = _llm_action(client, state, step)
            result = env.step(action)

            reward = float(result.get("reward", 0.0) or 0.0)
            done = bool(result.get("done", False))
            info = result.get("info") or {}
            error = None
            if isinstance(info, dict):
                error = info.get("last_action_error") or info.get("error")

            rewards.append(reward)
            steps_taken = step

            log_step(step=step, action=action, reward=reward, done=done, error=error)

            state = result.get("state", state)
            if done:
                break

        score = float(grade_performance(state, task_id))
        score = max(0.0, min(1.0, score))
        success = True
    except Exception as exc:
        # Keep output format strict and always end with [END].
        rewards.append(0.0)
        steps_taken = max(steps_taken, 1)
        log_step(step=steps_taken, action="error", reward=0.0, done=True, error=str(exc))
        success = False
        score = 0.0
    finally:
        close_fn = getattr(env, "close", None)
        if callable(close_fn):
            try:
                close_fn()
            except Exception:
                pass
        log_end(success=success, steps=steps_taken, score=score, rewards=rewards)


# OpenEnv-style helper functions
_ENV_SINGLETON = SmartLifeSimEnv()


def reset():
    return _ENV_SINGLETON.reset()


def step(action):
    return _ENV_SINGLETON.step(action)


def state():
    return _ENV_SINGLETON.get_state()


if __name__ == "__main__":
    for task in ["daily_survival", "career_growth", "agri_sustainability"]:
        run_episode(task_name=task)
