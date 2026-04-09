export function clamp(v) {
  return Math.max(0, Math.min(1, v));
}

export const BASE_METRICS = {
  health: 0.9,
  energy: 0.85,
  stress: 0.2,
  productivity: 0.72,
  efficiency: 0.58,
};

export const TASKS = {
  easy: {
    id: 'task1',
    title: 'Health Stability',
    difficulty: 'Easy',
    objective: 'Maintain health > 0.7 and energy > 0.6',
    constraints: ['Keep recovery high', 'Avoid overwork', 'Travel sparingly when energy is low'],
    multiplier: 1.0,
  },
  medium: {
    id: 'task2',
    title: 'Work-Life Balance',
    difficulty: 'Medium',
    objective: 'Balance stress, productivity, and income',
    constraints: ['Stress should stay manageable', 'Maintain productivity', 'Keep salary healthy'],
    multiplier: 1.3,
  },
  hard: {
    id: 'task3',
    title: 'Agriculture Optimization',
    difficulty: 'Hard',
    objective: 'Manage farm yield, time, and resource usage',
    constraints: ['Increase agriculture output', 'Use time efficiently', 'Avoid high stress while farming'],
    multiplier: 1.7,
  },
  harvest_office: {
    id: 'task4',
    title: 'Harvest + Office Work',
    difficulty: 'Challenge',
    objective: 'Do a two-step combo: harvest then office work',
    constraints: ['Step 1: +Rs 300, -Energy, -Stress', 'Step 2: +Rs 200, -Energy, +Stress'],
    multiplier: 1.55,
  },
};

export const TRAVEL_SPEED = {
  walk: 0.05,
  bike: 0.1,
  car: 0.2,
};

export function normalizeWeather(weather) {
  const value = String(weather || 'sunny').toLowerCase();
  if (value === 'rain') return 'rain';
  if (value === 'rainy') return 'rain';
  if (value === 'cloudy') return 'cloudy';
  return 'sunny';
}

export function getTimeOfDay(hour = 6) {
  const normalizedHour = ((Number(hour) % 24) + 24) % 24;
  if (normalizedHour < 6) return 'night';
  if (normalizedHour < 12) return 'morning';
  if (normalizedHour < 17) return 'afternoon';
  if (normalizedHour < 21) return 'evening';
  return 'night';
}

export function calculateDerivedMetrics(metrics, weather = 'sunny', timeOfDay = 'morning') {
  const health = clamp(metrics.health);
  const energy = clamp(metrics.energy);
  const stress = clamp(metrics.stress);
  const productivity = clamp((energy * 0.5 + health * 0.3) - (stress * 0.4));
  const efficiency = clamp(productivity * (1 - stress));

  return {
    health,
    energy,
    stress,
    productivity,
    efficiency,
  };
}

export function explainAction(action, context = {}) {
  if (action === 'travel') {
    return {
      reason: ['destination selected', 'travel required for next objective'],
      expected: ['energy decrease', 'stress increase'],
    };
  }
  if (action === 'work') {
    return {
      reason: ['income needed', 'office productivity opportunity'],
      expected: ['stress increase', 'salary improvement'],
    };
  }
  if (action === 'work_online') {
    return {
      reason: ['income needed', 'remote office option selected'],
      expected: ['moderate stress increase', 'salary improvement'],
    };
  }
  if (action === 'rest' || action === 'sleep') {
    return {
      reason: ['energy low', 'stress high'],
      expected: ['energy recovery', 'stress decrease'],
    };
  }
  if (action === 'eat') {
    return {
      reason: ['energy recovery needed'],
      expected: ['energy increase', 'health stabilization'],
    };
  }
  if (action === 'hospital' || action === 'visit_doctor') {
    return {
      reason: ['health under pressure', 'medical recovery needed'],
      expected: ['health increase', 'stress decrease'],
    };
  }
  if (action === 'harvest_and_office_work') {
    return {
      reason: ['crop ready for harvest', 'office income opportunity after harvest'],
      expected: ['step 1 +Rs 300, step 2 +Rs 200', 'energy drops, stress mixed change'],
    };
  }
  return {
    reason: [context.currentLocation ? `context is ${context.currentLocation}` : 'simulation action'],
    expected: ['state update'],
  };
}

export function applyActionState(previousMetrics, action, context = {}) {
  const previous = calculateDerivedMetrics(previousMetrics);
  const next = { ...previous };
  const location = String(context.currentLocation || '').toUpperCase();
  const reasons = {
    health: [],
    energy: [],
    stress: [],
    productivity: [],
    efficiency: [],
  };

  if (action === 'work') {
    next.energy -= 0.05;
    next.stress += 0.05;
    reasons.energy.push('workload cost');
    reasons.stress.push('work pressure');

    if (location === 'OFFICE') {
      next.stress += 0.02;
      next.efficiency += 0.03;
      reasons.stress.push('office task intensity');
      reasons.efficiency.push('office infrastructure boost');
    }
  }

  if (action === 'work_online') {
    next.energy -= 0.04;
    next.stress += 0.03;
    next.efficiency += 0.015;
    reasons.energy.push('screen-time fatigue');
    reasons.stress.push('remote workload');
    reasons.efficiency.push('remote routine focus');
  }

  if (action === 'rest') {
    next.energy += 0.06;
    next.stress -= 0.04;
    reasons.energy.push('rest recovery');
    reasons.stress.push('rest lowered tension');

    if (location === 'HOME') {
      next.stress -= 0.02;
      next.efficiency += 0.02;
      reasons.stress.push('home comfort');
      reasons.efficiency.push('recovery improved focus');
    }

    if (location === 'HOSPITAL') {
      next.stress -= 0.03;
      next.health += 0.05;
      next.efficiency += 0.01;
      reasons.stress.push('medical supervision');
      reasons.health.push('hospital monitored recovery');
      reasons.efficiency.push('stabilized condition');
    }
  }

  if (action === 'sleep') {
    next.energy += 0.06;
    next.stress -= 0.04;
    reasons.energy.push('sleep recovery');
    reasons.stress.push('sleep reduced overload');

    if (location === 'HOME') {
      next.stress -= 0.03;
      next.efficiency += 0.02;
      reasons.stress.push('deep home rest');
      reasons.efficiency.push('better morning readiness');
    }
  }

  if (action === 'eat' || action === 'food') {
    next.energy += 0.04;
    reasons.energy.push('food intake');
  }

  if (action === 'hospital' || action === 'visit_doctor' || action === 'get_treatment') {
    next.health += 0.06;
    next.stress -= 0.05;
    next.efficiency += 0.01;
    reasons.health.push('hospital recovery');
    reasons.stress.push('medical support reduced anxiety');
    reasons.efficiency.push('recovery improved output');
  }

  if (action === 'help_agriculture' || action === 'plant_crop' || action === 'harvest_crop') {
    next.energy -= 0.04;
    next.stress -= 0.015;
    next.efficiency += 0.02;
    reasons.energy.push('field work exertion');
    reasons.stress.push('outdoor farming balance');
    reasons.efficiency.push('hands-on farming rhythm');
  }

  if (action === 'harvest_and_office_work') {
    next.energy -= 0.14;
    next.stress += 0.0;
    next.efficiency += 0.03;
    reasons.energy.push('two-step combo workload');
    reasons.stress.push('harvest relief and office pressure balanced');
    reasons.efficiency.push('combo action throughput boost');
  }

  if (action === 'travel') {
    next.energy -= 0.02;
    reasons.energy.push('travel movement');
  }

  if (next.energy < 0.3 || next.stress > 0.7) {
    next.health -= 0.04;
    reasons.health.push(next.energy < 0.3 ? 'low energy penalty' : 'high stress penalty');
  }

  const finalMetrics = calculateDerivedMetrics(
    {
      health: clamp(next.health),
      energy: clamp(next.energy),
      stress: clamp(next.stress),
      productivity: next.productivity,
      efficiency: next.efficiency,
    },
  );

  if (Math.abs(finalMetrics.productivity - previous.productivity) > 0.001) {
    reasons.productivity.push(finalMetrics.productivity > previous.productivity ? 'better state mix' : 'fatigue and stress load');
  }

  if (Math.abs(finalMetrics.efficiency - previous.efficiency) > 0.001) {
    reasons.efficiency.push(finalMetrics.efficiency > previous.efficiency ? 'improved productivity' : 'stress reduced output');
  }

  return {
    previous,
    next: finalMetrics,
    delta: {
      health: finalMetrics.health - previous.health,
      energy: finalMetrics.energy - previous.energy,
      stress: finalMetrics.stress - previous.stress,
      productivity: finalMetrics.productivity - previous.productivity,
      efficiency: finalMetrics.efficiency - previous.efficiency,
    },
    reasons,
  };
}

export function getMovementSpeed(transportMode = 'walk', weather = 'sunny') {
  const base = TRAVEL_SPEED[transportMode] || TRAVEL_SPEED.walk;
  return normalizeWeather(weather) === 'rain' ? base * 0.8 : base;
}

export function getTaskProgress(taskKey, metrics, backendState = {}) {
  const task = TASKS[taskKey] || TASKS.easy;
  const money = Number(backendState.money ?? 1000);
  const agri = clamp(Number(backendState.agri_output ?? 0));

  if (taskKey === 'easy') {
    const reward = clamp(((metrics.health >= 0.7 ? 0.5 : metrics.health / 1.4) + (metrics.energy >= 0.6 ? 0.5 : metrics.energy / 1.2)));
    return { task, reward, progress: reward };
  }

  if (taskKey === 'medium') {
    const reward = clamp((clamp(1 - metrics.stress) * 0.35) + (metrics.productivity * 0.35) + (clamp(money / 1500) * 0.3));
    return { task, reward, progress: reward };
  }

  if (taskKey === 'harvest_office') {
    const cropDone = backendState.crop_stage === 0 ? 1 : 0;
    const reward = clamp((clamp(money / 1800) * 0.45) + (cropDone * 0.25) + (metrics.energy * 0.15) + (clamp(1 - metrics.stress) * 0.15));
    return { task, reward, progress: reward };
  }

  const reward = clamp((agri * 0.45) + (metrics.efficiency * 0.3) + (clamp(1 - metrics.stress) * 0.25));
  return { task, reward, progress: reward };
}

export function getSalaryBreakdown(taskKey, metrics) {
  const task = TASKS[taskKey] || TASKS.easy;
  const baseSalary = 100;
  const efficiencyFactor = metrics.efficiency;
  const stressFactor = 1 - metrics.stress;
  const bonus = metrics.efficiency > 0.8 ? 20 : 0;
  const penalty = metrics.stress > 0.7 ? 15 : 0;
  const finalSalary = Math.max(0, (baseSalary * efficiencyFactor * stressFactor * task.multiplier) + bonus - penalty);

  return {
    baseSalary,
    efficiencyFactor,
    stressFactor,
    multiplier: task.multiplier,
    bonus,
    penalty,
    finalSalary,
  };
}

export function getFloatingChangeTags(delta, reasons) {
  const tags = [];
  if (Math.abs(delta.stress) > 0.001) tags.push({ label: `Stress ${delta.stress > 0 ? '↑' : '↓'} (${(reasons.stress[0] || 'update')})`, tone: delta.stress > 0 ? 'negative' : 'positive' });
  if (Math.abs(delta.energy) > 0.001) tags.push({ label: `Energy ${delta.energy > 0 ? '↑' : '↓'} (${(reasons.energy[0] || 'update')})`, tone: delta.energy > 0 ? 'positive' : 'negative' });
  if (Math.abs(delta.efficiency) > 0.001) tags.push({ label: `Efficiency ${delta.efficiency > 0 ? '↑' : '↓'} (${(reasons.efficiency[0] || reasons.stress[0] || 'state')})`, tone: delta.efficiency > 0 ? 'positive' : 'negative' });
  return tags.slice(0, 3);
}
