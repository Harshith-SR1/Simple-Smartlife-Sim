import numpy as np

def grade_daily_survival(state):
    """Easy Task: Focus on Physiological Maintenance."""
    health = state.get('health', 0)
    energy = state.get('energy', 0)
    # Score heavily weighted on survival metrics. Normalize health/energy if they are on 0-1 scale.
    # If state provides them as 0.0-1.0, we use them as is.
    h = float(health) if health <= 1.0 else float(health) / 100.0
    e = float(energy) if energy <= 1.0 else float(energy) / 100.0
    
    score = (h * 0.6 + e * 0.4)
    return float(np.clip(score, 0.0, 1.0))

def grade_career_growth(state):
    """Medium Task: Focus on Economic Progression."""
    balance = float(state.get('bank_balance', 0))
    health = float(state.get('health', 0))
    h = health if health <= 1.0 else health / 100.0
    
    # Target 2000 units for a perfect score
    balance_score = min(balance / 2000.0, 1.0)
    # Safety check: if health is critical, score is halved
    multiplier = 1.0 if h > 0.3 else 0.5
    return float(np.clip(balance_score * multiplier, 0.0, 1.0))

def grade_agri_sustainability(state):
    """Hard Task: Balance Urban Job with Rural Farming."""
    # Handle crop_progress (0-100) or crop_stage (0-5)
    crop_progress = float(state.get('crop_progress', 0))
    if crop_progress <= 1.0 and state.get('crop_stage', 0) > 0:
        crop_progress = (float(state.get('crop_stage', 0)) / 5.0) * 100.0
    
    balance = float(state.get('bank_balance', 0))
    health = float(state.get('health', 0))
    h = health if health <= 1.0 else health / 100.0
    
    # 50% from farming, 30% from money (target 1000), 20% from staying healthy
    score = (crop_progress / 100.0 * 0.5) + (min(balance/1000.0, 1.0) * 0.3) + (h * 0.2)
    return float(np.clip(score, 0.0, 1.0))

TASKS = [
    {
        "id": "daily_survival",
        "task_id": "daily_survival",
        "name": "Safe Haven (Survival)",
        "difficulty": "Easy",
        "objective": "Keep Health > 80% and Energy > 70%",
        "goal": "Keep health and energy high",
        "grader": True,
    },
    {
        "id": "career_growth",
        "task_id": "career_growth",
        "name": "Corporate Ladder (Economic)",
        "difficulty": "Medium",
        "objective": "Reach Rs 2000 balance without health dropping below 40%",
        "goal": "Grow career and money",
        "grader": True,
    },
    {
        "id": "agri_sustainability",
        "task_id": "agri_sustainability",
        "name": "Green Economy (Agriculture)",
        "difficulty": "Hard",
        "objective": "Harvest crops while maintaining a stable bank balance",
        "goal": "Balance urban and rural economy",
        "grader": True,
    },
]

def evaluate_all_tasks(state):
    """Evaluate all 3 primary tasks and return scores."""
    return {
        "daily_survival": grade_daily_survival(state),
        "career_growth": grade_career_growth(state),
        "agri_sustainability": grade_agri_sustainability(state),
    }

def grade_performance(state, task_id):
    """Legacy/Main grading router."""
    task = str(task_id or "daily_survival").lower()
    if task == "daily_survival" or task == "easy":
        return grade_daily_survival(state)
    elif task == "career_growth" or task == "economic_productivity" or task == "medium":
        return grade_career_growth(state)
    elif task == "agri_sustainability" or task == "agriculture_optimization" or task == "hard":
        return grade_agri_sustainability(state)
    return grade_daily_survival(state)
