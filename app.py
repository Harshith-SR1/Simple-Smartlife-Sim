# pyright: reportMissingImports=false

import json
from pathlib import Path
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from environment.env import SmartLifeSimEnv
from grader.grader import TASKS, grade_performance, evaluate_all_tasks

app = FastAPI(title="SmartLifeSim", description="AI Digital Twin Simulation of Life Decisions")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BASE_DIR = Path(__file__).resolve().parent
env = SmartLifeSimEnv()


class StepRequest(BaseModel):
    action: str = Field(..., description="Action to apply in the simulation")
    target: Optional[str] = Field(None, description="Optional destination for travel actions")


class GraderRequest(BaseModel):
    task_id: Optional[str] = Field("easy", description="Task id for grading")
    task: Optional[str] = Field(None, description="Backward-compatible alias for task id")


@app.post("/reset")
@app.get("/reset")
def reset():
    return env.reset()


@app.post("/step")
def step(request: StepRequest):
    action = request.action.strip()
    if action == "travel" and request.target:
        action = f"travel_{request.target}"
    return env.step(action)


@app.get("/state")
def state():
    return env.state()


@app.get("/tasks")
def tasks():
    """Returns the 3 required tasks with explicit grader flag."""
    return [
        {
            "id": "daily_survival",
            "task_id": "daily_survival",
            "name": "Safe Haven (Survival)",
            "difficulty": "Easy",
            "grader": True,
            "objective": "Keep Health > 80% and Energy > 70%"
        },
        {
            "id": "career_growth",
            "task_id": "career_growth",
            "name": "Corporate Ladder (Economic)",
            "difficulty": "Medium",
            "grader": True,
            "objective": "Reach Rs 2000 balance without health dropping below 40%"
        },
        {
            "id": "agri_sustainability",
            "task_id": "agri_sustainability",
            "name": "Green Economy (Agriculture)",
            "difficulty": "Hard",
            "grader": True,
            "objective": "Harvest crops while maintaining a stable bank balance"
        }
    ]


@app.post("/grader")
@app.get("/grader")
def grader_legacy(request: Optional[GraderRequest] = None, task_id: Optional[str] = None):
    # Support both GET and POST for legacy '/grader'
    tid = (request.task_id if request else task_id) or "daily_survival"
    tid = tid.strip().lower()
    state = env.state()
    env.get_state()["current_task"] = tid
    score = grade_performance(state, tid)
    return {"task_id": tid, "score": float(score)}

@app.get("/grade/{task_id}")
@app.post("/grade/{task_id}")
def grade_task_endpoint(task_id: str):
    tid = task_id.strip().lower()
    state = env.state()
    env.get_state()["current_task"] = tid
    score = grade_performance(state, tid)
    return {"task_id": tid, "score": float(score)}


@app.get("/baseline")
def baseline():
    payload = json.loads((BASE_DIR / "data" / "grader.json").read_text())
    return payload


@app.get("/available-actions")
def available_actions(location: Optional[str] = None):
    state = env.state()
    current = (location or state.get("location") or "home").strip().lower()

    action_map = {
        "home": [
            {"id": "rest", "label": "Rest"},
            {"id": "eat", "label": "Eat"},
            {"id": "sleep", "label": "Sleep"},
        ],
        "office": [
            {"id": "work", "label": "Work"},
            {"id": "meeting", "label": "Meeting"},
            {"id": "deadline_task", "label": "Deadline Task"},
        ],
        "hospital": [
            {"id": "treatment", "label": "Treatment"},
            {"id": "consult", "label": "Consult"},
            {"id": "rest_hospital", "label": "Rest Hospital"},
        ],
        "farm": [
            {"id": "harvest", "label": "Harvest"},
            {"id": "plant", "label": "Plant"},
            {"id": "water", "label": "Water"},
            {"id": "farm_rest", "label": "Farm Rest"},
        ],
        "road": [
            {"id": "travel_home", "label": "Home"},
            {"id": "travel_office", "label": "Office"},
            {"id": "travel_hospital", "label": "Hospital"},
            {"id": "travel_farm", "label": "Farm"},
            {"id": "travel_village", "label": "Village"},
        ],
        "village": [
            {"id": "harvest", "label": "Harvest"},
            {"id": "plant", "label": "Plant"},
            {"id": "water", "label": "Water"},
            {"id": "farm_rest", "label": "Farm Rest"},
        ],
    }

    if current not in action_map:
        current = "road"

    return {
        "location": current,
        "actions": action_map[current],
        "salary": state.get("salary") if current == "office" else None,
    }


@app.get("/")
def api_root():
    return {
        "message": "SmartLifeSim backend API is running.",
        "endpoints": ["/state", "/step", "/reset", "/tasks", "/grader", "/grade/{task_id}", "/baseline", "/available-actions"],
    }
