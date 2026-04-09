import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import DecisionOverlay from './components/DecisionOverlay';
import FloatingEffects from './components/FloatingEffects';
import { getAvailableActions, getBaseline, getState, getTasks, gradeTask, reset as resetEnv, step as stepEnv } from './api';
import { LOCATIONS, toLocationId, toLocationKey } from './systems/navigation';
import {
  applyActionState,
  BASE_METRICS,
  calculateDerivedMetrics,
  explainAction,
  getFloatingChangeTags,
  getSalaryBreakdown,
  getTaskProgress,
  getTimeOfDay,
  normalizeWeather,
} from './systems/simulation';

const Scene = lazy(() => import('./Scene'));

const initialBackendState = {
  time: 6,
  day: 1,
  phase: 'morning',
  location: 'home',
  weather: 'sunny',
  current_task: 'easy',
  money: 1000,
  salary: 100,
  skill_level: 1,
  salary_growth: 0,
  agri_output: 0,
  last_effect: 'Environment initialized',
  decision_source: 'RL Agent',
  decision_reason: 'Selected due to highest expected reward based on current state',
  selected_action: 'work',
  q_values: {},
  suggestion: {
    primary_action: 'work',
    alternative_action: 'sleep',
    messages: [],
  },
};

function ProgressBar({ value, tone = 'blue' }) {
  return (
    <div className="progress-track">
      <div className={`progress-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

function App() {
  const [backendState, setBackendState] = useState(initialBackendState);
  const [tasks, setTasks] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState(BASE_METRICS);
  const [previousMetrics, setPreviousMetrics] = useState(BASE_METRICS);
  const [metricDelta, setMetricDelta] = useState({ health: 0, energy: 0, stress: 0, productivity: 0, efficiency: 0 });
  const [currentLocation, setCurrentLocation] = useState('HOME');
  const [targetLocation, setTargetLocation] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [sceneState, setSceneState] = useState('WORLD');
  const [activeAction, setActiveAction] = useState('idle');
  const [isMoving, setIsMoving] = useState(false);
  const [logs, setLogs] = useState(['Ready']);
  const [reasonMap, setReasonMap] = useState({ health: [], energy: [], stress: [], productivity: [], efficiency: [] });
  const [decisionReason, setDecisionReason] = useState([]);
  const [expectedOutcome, setExpectedOutcome] = useState([]);
  const [cameraMode, setCameraMode] = useState('free');
  const [cameraView, setCameraView] = useState('iso');
  const [lastAction, setLastAction] = useState('reset');
  const [lastState, setLastState] = useState(initialBackendState);
  const [decisionEvent, setDecisionEvent] = useState(null);
  const [floatingEffects, setFloatingEffects] = useState([]);
  const [travelPrompt, setTravelPrompt] = useState(null);
  const autoDecisionCooldownRef = useRef(0);
  const buildingSelectCooldownRef = useRef(0);

  const weather = normalizeWeather(backendState.weather);
  const timeOfDay = getTimeOfDay(backendState.time);
  const normalizedTask = String(backendState.current_task || 'daily_survival').toLowerCase();
  const taskKey = ['daily_survival', 'career_growth', 'agri_sustainability', 'easy', 'medium', 'hard'].includes(normalizedTask) ? normalizedTask : 'daily_survival';
  const effectiveMetrics = useMemo(() => calculateDerivedMetrics(metrics, weather, timeOfDay), [metrics, weather, timeOfDay]);
  const taskStatus = useMemo(() => getTaskProgress(taskKey, effectiveMetrics, backendState), [taskKey, effectiveMetrics, backendState]);
  const currentTask = taskStatus.task;
  const taskFromApi = useMemo(
    () => (Array.isArray(tasks) ? tasks.find((task) => task.task_id === taskKey) : null),
    [tasks, taskKey],
  );
  const salaryBreakdown = useMemo(() => getSalaryBreakdown(taskKey, effectiveMetrics), [taskKey, effectiveMetrics]);
  const locationContext = useMemo(() => {
    return String(backendState.location || currentLocation || 'home').toLowerCase();
  }, [backendState.location, currentLocation]);

  useEffect(() => {
    getState().then((result) => {
      setBackendState(result);
      setLastState(result);
      setCurrentLocation(toLocationKey(result.location || 'home'));
    }).catch(() => setLogs(['Unable to fetch state.']));
    getTasks().then(setTasks).catch(() => null);
    getBaseline().then(setBaseline).catch(() => null);
  }, []);

  useEffect(() => {
    gradeTask(backendState.current_task || 'easy').then((result) => setScore(result.score ?? 0)).catch(() => null);
  }, [backendState.current_task, backendState.time, backendState.day, backendState.money]);

  useEffect(() => {
    setScore(taskStatus.reward);
  }, [taskStatus]);


  const applyMetricsForAction = (action, nextLocation = currentLocation) => {
    const explanation = explainAction(action, { currentLocation: nextLocation });
    setDecisionReason(explanation.reason);
    setExpectedOutcome(explanation.expected);
    const update = applyActionState(effectiveMetrics, action, {
      weather,
      timeOfDay,
      currentLocation: nextLocation,
    });
    setPreviousMetrics(update.previous);
    setMetrics(update.next);
    setMetricDelta(update.delta);
    setReasonMap(update.reasons);
    return update;
  };

  const pushDecisionAndEffects = (actionLabel, stateSnapshot, delta = null, reasons = null, moneyDelta = 0) => {
    const reasonText = stateSnapshot?.decision_issue
      ? `${stateSnapshot.decision_issue} -> ${stateSnapshot.decision_reason || 'Decision update'}`
      : (decisionReason.join(', ') || 'State changed');
    const effectText = stateSnapshot?.last_effect || expectedOutcome.join(', ') || 'Metrics updated';
    setDecisionEvent({
      id: Date.now(),
      reason: reasonText,
      action: actionLabel,
      effect: effectText,
    });

    const nextEffects = [];
    if (moneyDelta !== 0) {
      nextEffects.push({
        id: `cash-${Date.now()}`,
        text: `${moneyDelta > 0 ? '+' : '-'}Rs ${Math.abs(moneyDelta).toFixed(0)}`,
        tone: moneyDelta > 0 ? 'positive' : 'negative',
      });
    }

    const tags = getFloatingChangeTags(delta || metricDelta, reasons || reasonMap)
      .map((tag, index) => ({
        id: `tag-${Date.now()}-${index}`,
        text: tag.label,
        tone: tag.tone,
      }));

    const merged = [...nextEffects, ...tags].slice(0, 4);
    if (merged.length) {
      setFloatingEffects((previous) => [...previous, ...merged]);
      setTimeout(() => {
        setFloatingEffects((previous) => previous.filter((item) => !merged.some((entry) => entry.id === item.id)));
      }, 1900);
    }
  };

  const getTravelEstimate = (destination, mode = 'walk') => {
    const origin = LOCATIONS[currentLocation] || LOCATIONS.HOME;
    const target = LOCATIONS[destination] || LOCATIONS.HOME;
    const distance = origin.distanceTo(target);
    const speed = mode === 'car' ? 18 : mode === 'bike' ? 9 : 4.8;
    return Math.max(1, Math.round(distance / speed));
  };

  const handleTravel = (place, explicitTarget = null, mode = 'walk', fromAutoDecision = false) => {
    const key = String(place).toUpperCase();
    const target = explicitTarget || LOCATIONS[key];
    if (!target) return;

    const targetVector = target.clone
      ? target.clone()
      : Array.isArray(target)
        ? new THREE.Vector3(target[0] || 0, target[1] || 0, target[2] || 0)
        : new THREE.Vector3(target.x || 0, target.y || 0, target.z || 0);

    setTargetLocation(key);
    setTargetPosition(targetVector);
    setSceneState('WORLD_TRAVEL');
    setActiveAction('travel');
    setCameraMode('agent-follow');
    applyMetricsForAction('travel', currentLocation);
    if (!fromAutoDecision) {
      setTravelPrompt(null);
    }
    setLogs([
      `Action: TRAVEL to ${key} (${mode})`,
      `ETA: ~${getTravelEstimate(key, mode)} min`,
      'Energy -0.02, Stress +0.02',
      'Transition in progress',
    ]);
  };

  const getDefaultActionForLocation = (location, state = backendState) => {
    const selected = String(state.selected_action || '').toLowerCase();
    if (location === 'HOME' && ['sleep', 'rest', 'eat'].includes(selected)) return selected;
    if (location === 'OFFICE' && ['work', 'meeting', 'deadline_task'].includes(selected)) return selected;
    if (location === 'HOSPITAL' && ['treatment', 'consult', 'rest_hospital'].includes(selected)) return selected;
    if ((location === 'FARM' || location === 'VILLAGE') && ['harvest', 'plant', 'water', 'farm_rest'].includes(selected)) return selected;
    return null;
  };

  const handleArrival = async (arrivedLocation) => {
    const nextLocation = arrivedLocation || currentLocation;
    setCurrentLocation(nextLocation);
    setTargetLocation(null);
    setTargetPosition(null);
    setActiveAction('idle');

    setSceneState('WORLD');
    setCameraMode('free');
    setDecisionReason(['destination reached', `arrived at ${nextLocation.toLowerCase()}`]);
    setExpectedOutcome(['interaction unlocked', 'state stabilizes based on context']);

    const serverAction = `travel_${toLocationId(nextLocation)}`;
    try {
      const prevMoney = Number(backendState.money || 0);
      const response = await stepEnv(serverAction);
      if (response?.state) {
        const mergedState = {
          ...response.state,
          q_values: response.q_values || response.state.q_values || {},
          task_scores: response.task_scores || response.state.task_scores || {},
        };
        setBackendState(mergedState);
        setLastAction(serverAction);
        setLastState(mergedState);
        pushDecisionAndEffects(serverAction, mergedState, null, null, Number(mergedState.money || 0) - prevMoney);

        // Champion Strategy: Auto-start the task when you arrive
        const task = String(mergedState.current_task || 'daily_survival').toLowerCase();
        let autoAction = null;
        if (task === 'career_growth' && nextLocation === 'OFFICE') autoAction = 'work';
        if (task === 'agri_sustainability' && (nextLocation === 'VILLAGE' || nextLocation === 'FARM')) autoAction = 'plant';
        if (task === 'daily_survival' && nextLocation === 'HOME') autoAction = 'sleep';

        if (autoAction) {
           setTimeout(() => handleAction(autoAction), 300);
        } else {
           // Default AI decide
           setTimeout(() => handleAction('auto'), 500);
        }
      }
    } catch (error) {
      console.error('Arrival sync error:', error);
    }
  };

  const handleBuildingSelect = useCallback((building) => {
    const now = Date.now();
    if (now < buildingSelectCooldownRef.current) return;
    buildingSelectCooldownRef.current = now + 300;

    const destination = typeof building === 'string'
      ? String(building || '').toUpperCase()
      : String(building?.id || '').toUpperCase();
    if (!destination) return;

    if (currentLocation === destination && !isMoving) {
      setLogs([`Already at ${destination}`, 'Use location actions to interact']);
      return;
    }

    const explicitTarget = building && typeof building === 'object' && building.target
      ? (Array.isArray(building.target)
          ? new THREE.Vector3(building.target[0] || 0, building.target[1] || 0, building.target[2] || 0)
          : new THREE.Vector3(building.target.x || 0, building.target.y || 0, building.target.z || 0))
      : null;

    setTravelPrompt({
      destination,
      explicitTarget,
      eta: {
        walk: getTravelEstimate(destination, 'walk'),
        bike: getTravelEstimate(destination, 'bike'),
        car: getTravelEstimate(destination, 'car'),
      },
    });
  }, [currentLocation, isMoving, getTravelEstimate]);

  const handleAction = async (action) => {
    if (action.startsWith('travel_')) {
      const destination = action.replace('travel_', '').toUpperCase();
      setTravelPrompt({
        destination,
        explicitTarget: LOCATIONS[destination] || null,
        eta: {
          walk: getTravelEstimate(destination, 'walk'),
          bike: getTravelEstimate(destination, 'bike'),
          car: getTravelEstimate(destination, 'car'),
        },
      });
      return;
    }

    const mappedAction = action === 'get_treatment'
      ? 'treatment'
      : action === 'visit_doctor'
        ? 'treatment'
        : action === 'plant_crop'
          ? 'plant'
          : action === 'harvest_crop'
            ? 'harvest'
            : action === 'help_agriculture'
              ? 'water'
              : action;
    const effectiveAction = mappedAction;

    setActiveAction(mappedAction);
    const stateUpdate = applyMetricsForAction(effectiveAction, currentLocation);
    if (mappedAction === 'work') {
      setLogs(['Action: WORK', 'Energy -0.05', 'Stress +0.05', 'Health stable']);
    } else if (mappedAction === 'meeting') {
      setLogs(['Action: MEETING', 'Coordination in progress', 'Stress slightly increased']);
    } else if (mappedAction === 'deadline_task') {
      setLogs(['Action: DEADLINE TASK', 'Income spike expected', 'Stress and energy impact increased']);
    } else if (mappedAction === 'rest') {
      setLogs(['Action: REST', 'Energy +0.06', 'Stress -0.04', 'Health stable']);
    } else if (mappedAction === 'treatment') {
      setLogs(['Action: TREATMENT', 'Health recovery in progress', 'Medical cost applied']);
    } else if (mappedAction === 'rest_hospital') {
      setLogs(['Action: REST HOSPITAL', 'Energy recovery in supervised care']);
    } else if (mappedAction === 'farm_rest') {
      setLogs(['Action: FARM REST', 'Short recovery break in farm area']);
    } else if (mappedAction === 'sleep') {
      setLogs(['Action: SLEEP', 'Energy +0.06', 'Stress -0.04', 'Health stable']);
    } else {
      setLogs([`Action: ${mappedAction.toUpperCase()}`, 'State updated', 'Metrics recalculated', 'Health stable']);
    }

    try {
      const prevMoney = Number(backendState.money || 0);
      const response = await stepEnv(effectiveAction);
      if (response?.state) {
        const mergedState = {
          ...response.state,
          q_values: response.q_values || response.state.q_values || {},
          task_scores: response.task_scores || response.state.task_scores || {},
        };
        setBackendState(mergedState);
        setLastAction(mappedAction);
        setLastState(mergedState);
        pushDecisionAndEffects(mappedAction, mergedState, stateUpdate.delta, stateUpdate.reasons, Number(mergedState.money || 0) - prevMoney);
      }
    } catch (error) {
      console.error('Action error:', error);
      setLogs(['Action error', 'Backend unavailable']);
    }

    setActiveAction('idle');
    setMetricDelta(stateUpdate.delta);
  };

  const handleReset = async () => {
    try {
      const response = await resetEnv();
      setBackendState({
        ...response,
        q_values: response?.q_values || {},
        task_scores: response?.task_scores || {},
      });
      setCurrentLocation('HOME');
      setTargetLocation(null);
      setTargetPosition(null);
      setTravelPrompt(null);
      setSceneState('WORLD');
      setMetrics(BASE_METRICS);
      setPreviousMetrics(BASE_METRICS);
      setMetricDelta({ health: 0, energy: 0, stress: 0, productivity: 0, efficiency: 0 });
      setLogs(['Environment reset']);
    } catch (error) {
      console.error('Reset error:', error);
      setLogs(['Reset failed']);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now < autoDecisionCooldownRef.current) return;
    if (isMoving || targetLocation || travelPrompt) return;

    let destination = null;
    let reason = '';
    const selectedDecision = String(backendState.selected_action || '').toLowerCase();
    if (['treatment', 'consult', 'rest_hospital'].includes(selectedDecision)) {
      destination = 'HOSPITAL';
      reason = `q-value highest: ${selectedDecision}`;
    } else if (['work', 'meeting', 'deadline_task'].includes(selectedDecision)) {
      destination = 'OFFICE';
      reason = `q-value highest: ${selectedDecision}`;
    } else if (['harvest', 'plant', 'water', 'farm_rest'].includes(selectedDecision)) {
      destination = 'FARM';
      reason = `q-value highest: ${selectedDecision}`;
    } else if (['sleep', 'rest', 'eat'].includes(selectedDecision)) {
      destination = 'HOME';
      reason = `q-value highest: ${selectedDecision}`;
    }

    if (!destination || destination === currentLocation) return;

    autoDecisionCooldownRef.current = now + 5000;
    setDecisionEvent({
      id: now,
      reason: `Auto decision: ${reason}`,
      action: `Travel to ${destination}`,
      effect: 'Agent rerouted to optimal location',
    });
    handleTravel(destination.toLowerCase(), LOCATIONS[destination], 'walk', true);
  }, [backendState, currentLocation, isMoving, targetLocation, travelPrompt]);

  return (
    <div className="app-shell">
      <header>
        <h1>SmartLifeSim</h1>
        <button className="reset-button" onClick={handleReset}>Reset</button>
      </header>

      <div className="main-grid">
        <div className="scene-panel">
          <DecisionOverlay event={decisionEvent} />
          <FloatingEffects effects={floatingEffects} />
          <Suspense fallback={<div className="scene-loading">Loading 3D world...</div>}>
            <Canvas shadows camera={{ position: [100, 120, 100], fov: 60, near: 0.1, far: 2000 }} gl={{ antialias: true }}>
              <Scene
                currentLocation={currentLocation}
                targetLocation={targetLocation}
                targetPosition={targetPosition}
                metrics={effectiveMetrics}
                day={backendState.day}
                sceneState={sceneState}
                activeAction={activeAction}
                timeOfDay={timeOfDay}
                weather={weather}
                cropStage={backendState.crop_stage || 0}
                currentTask={backendState.current_task || 'daily_survival'}
                cameraMode={cameraMode}
                cameraView={cameraView}
                onBuildingSelect={handleBuildingSelect}
                onMovementChange={setIsMoving}
                isMoving={isMoving}
                onTraderProximityChange={() => null}
                onArrive={handleArrival}
              />
            </Canvas>
          </Suspense>
        </div>

        <div className="control-panel">
          <div className="status-card">
            <span className="panel-kicker">Active Challenge</span>
            <select 
              className="task-select" 
              value={backendState.current_task || 'daily_survival'}
              onChange={async (e) => {
                const newTask = e.target.value;
                try {
                  const result = await gradeTask(newTask);
                  const state = await getState();
                  setBackendState({ ...state, current_task: newTask });
                  setScore(result.score ?? 0);
                  setLogs([`Switched task to: ${newTask}`]);

                  // Champion Strategy: Auto-navigate to task objective area
                  if (newTask === 'daily_survival' && state.location !== 'home') {
                    handleTravel('home', null, 'walk');
                  } else if (newTask === 'career_growth' && state.location !== 'office') {
                    handleTravel('office', null, 'car');
                  } else if (newTask === 'agri_sustainability' && !['village', 'village_center', 'farm'].includes(state.location)) {
                    handleTravel('village', null, 'bike');
                  }
                } catch (err) {
                  console.error("Task switch error:", err);
                }
              }}
            >
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <div className="goal-tracker">
              <div 
                className={`goal-ring ${backendState.current_task === 'daily_survival' && score < 0.3 ? 'pulse-red' : ''}`}
                style={{ borderColor: backendState.current_task === 'daily_survival' && score > 0.8 ? '#34d399' : '' }}
              >
                {Math.round(score * 100)}%
              </div>
              <div className="goal-info">
                <h3>{tasks.find(t => t.id === backendState.current_task)?.name || 'Survival'}</h3>
                <p>
                  {backendState.current_task === 'career_growth' 
                    ? "Maximize salary and bank balance without burnout."
                    : tasks.find(t => t.id === backendState.current_task)?.objective || 'Keep health and energy high'}
                </p>
              </div>
            </div>

            <h2>Wellbeing</h2>
            <div className="stat-grid">
               <div className="stat-gauge">
                 <div className="stat-header">
                   <span className="stat-label">Health</span>
                   <span className="stat-value">{Math.round(effectiveMetrics.health * 100)}%</span>
                 </div>
                 <ProgressBar value={effectiveMetrics.health} tone={effectiveMetrics.health > 0.6 ? 'green' : effectiveMetrics.health > 0.3 ? 'yellow' : 'red'} />
               </div>
               <div className="stat-gauge">
                 <div className="stat-header">
                   <span className="stat-label">Energy</span>
                   <span className="stat-value">{Math.round(effectiveMetrics.energy * 100)}%</span>
                 </div>
                 <ProgressBar value={effectiveMetrics.energy} tone={effectiveMetrics.energy > 0.5 ? 'blue' : 'yellow'} />
               </div>
            </div>

            <h2 style={{ marginTop: 12 }}>Advanced Metrics</h2>
            <div className="stat-grid">
                <div className="stat-gauge">
                   <div className="stat-header">
                     <span className="stat-label">Bank Balance</span>
                     <span className="stat-value">Rs {Number(backendState.money || 0).toFixed(0)}</span>
                   </div>
                   <ProgressBar value={Number(backendState.money || 0) / 2000} tone="green" />
                   {backendState.current_task === 'career_growth' && (
                     <div className="stat-subtext">Skill Lvl: {backendState.skill_level || 1}</div>
                   )}
                </div>
                <div className="stat-gauge">
                   <div className="stat-header">
                     <span className="stat-label">Crop Growth</span>
                     <span className="stat-value">{Math.round((backendState.crop_stage || 0) / 5 * 100)}%</span>
                   </div>
                   <ProgressBar value={(backendState.crop_stage || 0) / 5} tone="blue" />
                   {backendState.current_task === 'agri_sustainability' && (
                     <div className="stat-subtext">Water: {Math.round((backendState.water_level || 0) * 100)}%</div>
                   )}
                </div>
            </div>
          </div>

          <div className="status-card">
            <h2>Transportation Impact</h2>
            <table className="transport-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Speed</th>
                  <th>Cost</th>
                  <th>Energy</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: backendState.current_task === 'daily_survival' ? 'rgba(52, 211, 153, 0.15)' : '' }}>
                  <td>🚶 Walk {backendState.current_task === 'daily_survival' && <span className="stat-badge">Recommended</span>}</td>
                  <td>Slow</td>
                  <td>Rs 0</td>
                  <td style={{ color: '#f87171' }}>-10%</td>
                </tr>
                <tr style={{ background: backendState.current_task === 'agri_sustainability' ? 'rgba(52, 211, 153, 0.15)' : '' }}>
                  <td>🚲 Bike {backendState.current_task === 'agri_sustainability' && <span className="stat-badge">Balanced</span>}</td>
                  <td>Med</td>
                  <td>Rs 5</td>
                  <td style={{ color: '#fbbf24' }}>-5%</td>
                </tr>
                <tr style={{ background: backendState.current_task === 'career_growth' ? 'rgba(52, 211, 153, 0.15)' : '' }}>
                  <td>🚗 Car {backendState.current_task === 'career_growth' && <span className="stat-badge priority">Priority</span>}</td>
                  <td>Fast</td>
                  <td>Rs 50</td>
                  <td style={{ color: '#34d399' }}>-2%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {travelPrompt ? (
            <div className="status-card">
              <h2>Travel Selection</h2>
              <p className="panel-note">Destination: {travelPrompt.destination}</p>
              <div className="button-grid contextual">
                <button className="action-button" onClick={() => handleTravel(travelPrompt.destination.toLowerCase(), travelPrompt.explicitTarget, 'walk')}>
                  Walk ({travelPrompt.eta.walk}m)
                </button>
                <button className="action-button" onClick={() => handleTravel(travelPrompt.destination.toLowerCase(), travelPrompt.explicitTarget, 'bike')}>
                  Bike ({travelPrompt.eta.bike}m)
                </button>
                <button className="action-button" onClick={() => handleTravel(travelPrompt.destination.toLowerCase(), travelPrompt.explicitTarget, 'car')}>
                  Car ({travelPrompt.eta.car}m)
                </button>
                <button className="action-button" onClick={() => setTravelPrompt(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Task Actions Panel */}
          <div className="status-card">
            <h2>Challenge Controls</h2>
            <div className="button-grid">
              {backendState.current_task === 'daily_survival' && (
                <>
                  <button className="action-button" onClick={() => handleAction('sleep')}>Sleep</button>
                  <button className="action-button" onClick={() => handleAction('eat')}>Eat</button>
                </>
              )}
              {backendState.current_task === 'career_growth' && (
                <>
                  <button className="action-button" onClick={() => handleAction('work')}>Work</button>
                  <button className="action-button" onClick={() => handleAction('deadline_task')}>Deadline</button>
                </>
              )}
              {backendState.current_task === 'agri_sustainability' && (
                <>
                  <button className="action-button" onClick={() => handleAction('plant')}>Plant</button>
                  <button 
                    className="action-button" 
                    onClick={() => handleAction('harvest')}
                    disabled={Number(backendState.water_level || 0) <= 0}
                  >
                    Harvest
                  </button>
                </>
              )}
              <button 
                className="action-button" 
                style={{ gridColumn: 'span 2' }}
                onClick={() => handleAction('auto')}
              >
                Let AI Decide (RL)
              </button>
            </div>
          </div>


          <div className="log-card">
            <h2>Decision Explainability</h2>
            <div className="decision-flow">
              <div><span className="stat-label">Action Reason</span><p>{backendState.decision_reason || 'Evaluating optimal utility...'}</p></div>
              <div><span className="stat-label">Last Effect</span><p>{lastState?.last_effect || 'Waiting for action'}</p></div>
              <div className="full" style={{ marginTop: 8 }}>
                 <span className="stat-label">Q-Value Evaluation</span>
                 {Object.entries(backendState?.q_values || {}).length === 0 ? (
                   <p className="log-text">No Q-values available.</p>
                 ) : Object.entries(backendState?.q_values || {}).map(([actionKey, value]) => {
                   const val = Number(value ?? 0);
                   const isSelected = String(backendState?.selected_action || '').toLowerCase() === String(actionKey).toLowerCase();
                   const label = String(actionKey).replaceAll('_', ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
                   return (
                     <div key={`q-bar-${actionKey}`} className="q-bar-container">
                       <div className="q-bar-label">
                         <span>{label}</span>
                         <span>{val.toFixed(2)}</span>
                       </div>
                       <div className="q-bar-track">
                         <div 
                           className={`q-bar-fill ${isSelected ? 'selected' : ''}`} 
                           style={{ width: `${Math.max(5, Math.min(100, Math.abs(val) * 100))}%` }}
                         />
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
            
            <div className="decision-flow" style={{ marginTop: 12 }}>
              <div className="full">
                <span className="stat-label">Scenario Context</span>
                <p className="log-text">{`Location: ${String(backendState.location || 'Home').toUpperCase()} | Time: ${backendState.time}:00 | Weather: ${weather}`}</p>
                {logs.slice(-2).map((entry, index) => (
                  <p key={`log-footer-${index}`} className="log-text">{`• ${entry}`}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
