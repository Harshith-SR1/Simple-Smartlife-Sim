import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import City from './City';
import Farm from './Farm';
import Village from './Village';
import Agent from './Agent';
import CameraController from './CameraController';
import RoadSystem from './RoadSystem';
import { LOCATIONS } from './systems/navigation';

function InteriorRoom({ type }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#f4f6f8" roughness={0.97} />
      </mesh>

      <mesh position={[0, 2.5, -9]}>
        <boxGeometry args={[18, 5, 0.2]} />
        <meshStandardMaterial color="#d7dee6" roughness={0.92} />
      </mesh>
      <mesh position={[-9, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 18]} />
        <meshStandardMaterial color="#d7dee6" roughness={0.92} />
      </mesh>
      <mesh position={[9, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 18]} />
        <meshStandardMaterial color="#d7dee6" roughness={0.92} />
      </mesh>

      <mesh position={[0, 4.95, 0]}>
        <boxGeometry args={[18, 0.1, 18]} />
        <meshStandardMaterial color="#edf2f7" roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.2, -8.9]}>
        <boxGeometry args={[4.4, 2.4, 0.08]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#bfdbfe" emissiveIntensity={0.12} />
      </mesh>

      {type === 'home' ? (
        <>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[10, 0.02, 10]} />
            <meshStandardMaterial color="#efe2ca" roughness={0.98} />
          </mesh>

          <mesh position={[-3.6, 0.42, -1.4]} castShadow>
            <boxGeometry args={[4.4, 0.84, 2.3]} />
            <meshStandardMaterial color="#b78552" roughness={0.86} />
          </mesh>

          <mesh position={[-3.6, 1.0, -1.4]} castShadow>
            <boxGeometry args={[4.0, 0.28, 1.9]} />
            <meshStandardMaterial color="#e6d3b7" roughness={0.84} />
          </mesh>

          <mesh position={[2.65, 0.45, 1.05]} castShadow>
            <boxGeometry args={[2.6, 0.9, 1.9]} />
            <meshStandardMaterial color="#86552f" roughness={0.82} />
          </mesh>

          <mesh position={[2.65, 1.02, 1.05]} castShadow>
            <boxGeometry args={[2.2, 0.22, 1.5]} />
            <meshStandardMaterial color="#dbc6a6" roughness={0.85} />
          </mesh>

          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[6.8, 0.05, 6.8]} />
            <meshStandardMaterial color="#f4e6cb" roughness={0.98} />
          </mesh>

          <mesh position={[0, 0.08, 2.8]}>
            <boxGeometry args={[3.2, 0.02, 1.6]} />
            <meshStandardMaterial color="#b3683d" roughness={0.84} />
          </mesh>

          <mesh position={[-0.5, 0.4, 0.4]} castShadow>
            <boxGeometry args={[1.8, 0.8, 0.9]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.75} />
          </mesh>

          <mesh position={[2.8, 0.6, -1.8]} castShadow>
            <boxGeometry args={[1.8, 0.66, 1.7]} />
            <meshStandardMaterial color="#ce7b2f" roughness={0.82} />
          </mesh>

          <mesh position={[3.9, 1.4, -1.7]} castShadow>
            <boxGeometry args={[0.2, 2.1, 0.2]} />
            <meshStandardMaterial color="#7b4f2b" roughness={0.84} />
          </mesh>

          <mesh position={[3.9, 2.5, -1.7]} castShadow>
            <boxGeometry args={[1.0, 0.12, 0.55]} />
            <meshStandardMaterial color="#8b5a2e" roughness={0.84} />
          </mesh>

          <mesh position={[3.9, 2.0, -1.68]}>
            <boxGeometry args={[0.85, 0.72, 0.08]} />
            <meshStandardMaterial color="#7dc0e6" emissive="#7dc0e6" emissiveIntensity={0.15} />
          </mesh>

          <mesh position={[0, 1.45, -8.86]}>
            <boxGeometry args={[6.2, 2.3, 0.07]} />
            <meshStandardMaterial color="#9ac8e4" emissive="#9ac8e4" emissiveIntensity={0.1} />
          </mesh>
        </>
      ) : null}

      {type === 'office' ? (
        <>
          <mesh position={[0, 0.45, -1]} castShadow>
            <boxGeometry args={[5.6, 0.9, 2.8]} />
            <meshStandardMaterial color="#8b5e34" roughness={0.82} />
          </mesh>
          <mesh position={[0, 1.35, -2.2]} castShadow>
            <boxGeometry args={[2.4, 1.1, 0.2]} />
            <meshStandardMaterial color="#111827" roughness={0.55} />
          </mesh>
          <mesh position={[-2.6, 0.7, 1.3]} castShadow>
            <boxGeometry args={[0.18, 1.4, 0.18]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          <mesh position={[-2.6, 1.4, 1.3]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.55]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[2.6, 0.8, 1.5]} castShadow>
            <boxGeometry args={[1.0, 1.6, 0.8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.1, 2.7]}>
            <boxGeometry args={[5.2, 0.04, 1.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.96} />
          </mesh>
        </>
      ) : null}

      {type === 'hospital' ? (
        <>
          <mesh position={[0, 0.45, -1]} castShadow>
            <boxGeometry args={[5.8, 0.9, 2.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.84} />
          </mesh>
          <mesh position={[0, 0.9, -1.2]} castShadow>
            <boxGeometry args={[1.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#dc2626" roughness={0.55} />
          </mesh>
          <mesh position={[0, 1.2, -1.2]} castShadow>
            <boxGeometry args={[0.3, 1.3, 0.3]} />
            <meshStandardMaterial color="#dc2626" roughness={0.55} />
          </mesh>
          <mesh position={[-2.2, 0.45, 1.5]} castShadow>
            <boxGeometry args={[1.7, 0.9, 2.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[2.2, 0.45, 1.5]} castShadow>
            <boxGeometry args={[1.4, 0.75, 1.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.84} />
          </mesh>
          <mesh position={[0, 0.1, 2.6]}>
            <boxGeometry args={[5.2, 0.04, 1.2]} />
            <meshStandardMaterial color="#bfdbfe" roughness={0.95} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

export default function Scene({
  currentLocation,
  targetLocation,
  targetPosition,
  metrics,
  sceneState,
  activeAction,
  timeOfDay,
  weather,
  cropStage = 0,
  currentTask = 'daily_survival',
  cameraMode,
  cameraView,
  onBuildingSelect,
  onVehicleProximityChange,
  onMovementChange,
  onArrive,
  isMoving,
}) {
  const agentPositionRef = useRef([0, 0, 0]);
  const directionRef = useRef();
  const vehicleStateRef = useRef({ car: false, bike: false });

  const interiorLocation = useMemo(() => {
    if (sceneState === 'HOME_INTERIOR') return 'home';
    if (sceneState === 'OFFICE_INTERIOR') return 'office';
    if (sceneState === 'HOSPITAL_INTERIOR') return 'hospital';
    return null;
  }, [sceneState]);

  const hideOutsideWorld = Boolean(interiorLocation);

  const lighting = useMemo(() => {
    const baseByTime = {
      morning: { ambient: 0.72, directional: 1.25, color: '#ffffff', sky: '#9fd4ff' },
      afternoon: { ambient: 0.78, directional: 1.28, color: '#fff8e8', sky: '#87CEEB' },
      evening: { ambient: 0.58, directional: 1.0, color: '#ffb56b', sky: '#f4a261' },
      night: { ambient: 0.34, directional: 0.62, color: '#8bb8ff', sky: '#1f2a44' },
    };

    const weatherMul = {
      sunny: { ambient: 1.0, directional: 1.0, tint: '#ffffff' },
      cloudy: { ambient: 0.88, directional: 0.82, tint: '#dbeafe' },
      rain: { ambient: 0.72, directional: 0.68, tint: '#93c5fd' },
      rainy: { ambient: 0.72, directional: 0.68, tint: '#93c5fd' },
    };

    const timePreset = baseByTime[String(timeOfDay || 'morning')] || baseByTime.morning;
    const weatherPreset = weatherMul[String(weather || 'sunny')] || weatherMul.sunny;

    // Champion Update: Theme lighting based on task
    let taskTint = '#ffffff';
    if (currentTask === 'career_growth') taskTint = '#ffeebb'; // High Noon / Warm
    if (currentTask === 'agri_sustainability') taskTint = '#ffd488'; // Golden Hour
    if (currentTask === 'daily_survival') taskTint = '#f4faff'; // Soft cool

    return {
      ambient: timePreset.ambient * weatherPreset.ambient,
      directional: timePreset.directional * weatherPreset.directional,
      lightColor: taskTint,
      sky: timePreset.sky,
    };
  }, [timeOfDay, weather, currentTask]);

  useFrame(() => {
    if (!onVehicleProximityChange) return;

    if (hideOutsideWorld) {
      if (vehicleStateRef.current.car || vehicleStateRef.current.bike) {
        vehicleStateRef.current = { car: false, bike: false };
        onVehicleProximityChange({ car: false, bike: false });
      }
      return;
    }

    const [ax, , az] = agentPositionRef.current;
    const nearCar = (ax + 2.2) * (ax + 2.2) + (az - 7.8) * (az - 7.8) < 20;
    const nearBike = (ax - 2.7) * (ax - 2.7) + (az - 7.4) * (az - 7.4) < 18;
    const next = { car: nearCar, bike: nearBike };

    if (next.car !== vehicleStateRef.current.car || next.bike !== vehicleStateRef.current.bike) {
      vehicleStateRef.current = next;
      onVehicleProximityChange(next);
    }
  });

  return (
    <>
      <color attach="background" args={[hideOutsideWorld ? '#e8edf2' : lighting.sky]} />

      <ambientLight intensity={lighting.ambient} />
      <directionalLight color={lighting.lightColor} position={[10, 20, 10]} intensity={lighting.directional} castShadow />

      {hideOutsideWorld ? <InteriorRoom type={interiorLocation} /> : null}

      {!hideOutsideWorld ? (
        <>
          <RoadSystem />
          <City timeOfDay={timeOfDay} onBuildingSelect={onBuildingSelect} />
          <Farm position={LOCATIONS.FARM.toArray()} onFarmSelect={onBuildingSelect} cropStage={cropStage} />
          <Village position={LOCATIONS.VILLAGE.toArray()} onVillageSelect={onBuildingSelect} />

          {/* Champion Destination Marker */}
          {targetPosition && (
            <mesh position={[targetPosition.x, 0.1, targetPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.8, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
          )}
          
          {/* Champion Tip: Bounding Box Glow */}
          {currentTask === 'career_growth' && (
             <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[140, 140]} />
               <meshStandardMaterial color="#60a5fa" transparent opacity={0.1} emissive="#60a5fa" emissiveIntensity={0.5} />
             </mesh>
          )}
          {currentTask === 'agri_sustainability' && (
             <mesh position={LOCATIONS.FARM.toArray()} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[100, 100]} />
               <meshStandardMaterial color="#34d399" transparent opacity={0.15} emissive="#34d399" emissiveIntensity={0.5} />
             </mesh>
          )}
           {currentTask === 'daily_survival' && (
             <mesh position={LOCATIONS.HOME.toArray()} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[80, 80]} />
               <meshStandardMaterial color="#f472b6" transparent opacity={0.15} emissive="#f472b6" emissiveIntensity={0.5} />
             </mesh>
          )}
        </>
      ) : null}

      {!hideOutsideWorld ? (
        <Agent
          currentLocation={currentLocation}
          targetLocation={targetLocation}
          targetPosition={targetPosition}
          activeAction={activeAction}
          metrics={metrics}
          weather={weather}
          onPositionChange={(position) => {
            agentPositionRef.current = position;
          }}
          onMovementChange={onMovementChange}
          onArrive={onArrive}
          onDirectionChange={(direction) => {
            directionRef.current = direction;
          }}
        />
      ) : null}

      <CameraController
        agentPositionRef={agentPositionRef}
        directionRef={directionRef}
        cameraMode={cameraMode}
        cameraView={cameraView}
        sceneState={sceneState}
        currentTask={currentTask}
        isMoving={isMoving}
      />
    </>
  );
}
