---
title: Smartsim
emoji: "🌍"
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

SmartLifeSim

SmartLifeSim is a realistic simulation platform designed to help train and test AI agents using everyday situations. It uses the familiar step(), reset(), and state() methods, and focuses on optimizing aspects of daily living like health, productivity, and agriculture.

The simulation follows this core loop:

Start with the current situation, make a decision, take an action, see what changes, get feedback, and learn from it.

Core Objective (Submission-Critical)

Build a practical, non-toy environment that exposes the standard API expected by OpenEnv runners:

* reset()
* step(action)
* state()

The environment is designed for training and evaluating agents that must balance:

* personal wellbeing (health, energy, stress)
* economic sustainability (money, salary progression)
* food/agriculture productivity (crop stage, agri output)
* temporal constraints (day/phase progression)

Real-World Task Being Simulated

The agent represents a digital twin living in a mixed urban-rural ecosystem:

* Home: recovery and wellbeing actions
* Office: productivity and income actions
* Hospital: healthcare and risk mitigation actions
* Village/Farm: planting, watering, harvesting, and rural workload management

This models real-world multi-objective planning under resource constraints, not a game loop.

OpenEnv API Contract

The backend exposes typed endpoints used by OpenEnv-style evaluation pipelines:

* POST /reset -> reset episode state
* POST /step -> apply one action and return transition payload
* GET /state -> return current observation/state snapshot
* GET /tasks -> list available benchmark tasks
* GET /grade/{task_id} -> retrieve task evaluation (OpenEnv auto-validation)
* POST /grader -> score current state for selected task (legacy/UI)
* GET /baseline -> baseline metadata for comparison
* GET /available-actions -> location-aware action options for UI/agents

step response (high level)

Returns updated state plus decision explainability fields:

* state
* action
* decision_source
* q_values
* reward
* suggestion
* done
* info

This supports transparent evaluation of both behavior quality and decision rationale.

Observation Space (State)

The environment state includes temporal, physiological, economic, agricultural, and decision-trace signals.

Primary state groups

* Time and context:
  * time, day, phase, weather, location
* Wellbeing:
  * health, energy, hunger, thirst, stress
* Economy and career:
  * money, bank_balance, salary, experience, skill_level, job_level, promotion_progress, salary_growth
* Productivity:
  * efficiency, productivity
* Agriculture:
  * agri_output, crop_stage, crop_progress, soil_quality, expected_agri_income
* Decision explainability:
  * decision_source, selected_action, decision_reason, q_values, suggestion, last_action, last_effect

Action Space

Global RL action set

* Home: sleep, rest, eat
* Office: work, meeting, deadline_task
* Hospital: treatment, consult, rest_hospital
* Village/Farm: harvest, plant, water, farm_rest

Compatibility actions

The environment also supports travel and legacy action aliases to preserve UI/API compatibility (for example travel_*, visit_doctor, plant_crop, harvest_crop, help_agriculture).

Reward Function (Meaningful Partial Progress)

The reward is continuous and provides partial progress signals every step:

reward = 2 * health + 1.5 * energy + 0.002 * money - 2 * stress

Additional shaping terms:

* bonus when crop stage reaches harvest readiness
* penalty if health is critically low
* penalty if stress exceeds high-risk threshold

This ensures dense, meaningful rewards instead of sparse terminal-only scoring, so agents receive progress feedback at every step.

Tasks and Agent Graders (Easy -> Medium -> Hard)

The benchmark includes at least three graded tasks with normalized scores in [0.0, 1.0].

Easy

* Goal: maintain health above threshold
* Score emphasizes health and energy stability

Medium

* Goal: maintain health while increasing money
* Score balances wellbeing and income growth

Hard

* Goal: optimize health, money, and agriculture outcomes together
* Score rewards balanced long-horizon performance

Additional scenario-specific tasks can exist, but easy/medium/hard are the core ladder.

Grading behavior

* Each task has a dedicated scoring function
* Scores are clipped/normalized into [0.0, 1.0]
* Task grading is accessible through POST /grader

Decision Engine and Explainability

SmartLifeSim includes RL-based decision scoring and transparent rationale output:

* Q-values for candidate actions
* selected action based on highest expected long-term utility
* natural-language reason text
* suggestions including alternative action and condition-specific hints

This allows clear auditability of why an action was selected.

Frontend Capabilities

The React + Three.js frontend provides:

* interactive 3D world (home, office, hospital, farm, village)
* transport selection with ETA modes (walk/bike/car)
* decision overlays and floating effect feedback
* dynamic day/phase and weather visual changes
* crop stage visualization and readiness cues
* action panel bound to current location context
Setup Instructions

Backend

pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 7863 --reload

Frontend

cd frontend
npm install
set VITE_API_URL=http://127.0.0.1:7863
npm run dev

Browser

* Frontend: http://localhost:5173 (or next available Vite port)
* Backend docs: http://127.0.0.1:7863/docs
* Backend state endpoint: http://127.0.0.1:7863/state

Inference Script Requirements

inference.py is root-level and emits strict structured logs required by evaluator pipelines:

* [START] task=<...> env=<...> model=<...>
* [STEP] step=<n> action=<...> reward=<0.00> done=<true|false> error=<msg|null>
* [END] success=<true|false> steps=<n> score=<0..1> rewards=<r1,...,rn>

Environment variables used by inference:

* API_BASE_URL (default allowed)
* MODEL_NAME (default allowed)
* HF_TOKEN (no default token value)
* LOCAL_IMAGE_NAME (optional, docker-image mode)

OpenAI client requirement:

* All LLM calls are routed through from openai import OpenAI

Docker and Deployment

The repository includes a multi-stage Docker build:

* stage 1: build frontend assets
* stage 2: Python API runtime with built frontend bundle

Run locally:

docker build .

Validation Workflow (Pre-Submission)

Recommended sequence:

1. docker build .
2. openenv validate
3. ping deployed Space reset endpoint (POST /reset returns 200)
4. run python inference.py and confirm score in [0, 1]

Expected acceptance evidence

* Docker build succeeds
* openenv validate returns OK
* HF Space /reset endpoint returns HTTP 200
* Inference logs show correct [START], [STEP], [END] format

Project Structure (Key Files)

* app.py -> FastAPI API surface
* environment/env.py -> environment step/reset/state and reward/learning integration
* environment/actions.py -> action effects
* grader/grader.py -> task grading functions
* inference.py -> structured benchmark runner
* openenv.yaml -> OpenEnv runtime config
* frontend/ -> 3D UI and decision panel

