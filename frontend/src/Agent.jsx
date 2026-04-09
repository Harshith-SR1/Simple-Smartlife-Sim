import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LOCATION_TARGETS } from './systems/navigation';

export default function Agent({
  currentLocation,
  targetLocation,
  targetPosition,
  activeAction,
  metrics,
  weather,
  onPositionChange,
  onMovementChange,
  onArrive,
  onDirectionChange,
}) {
  const agentRef = useRef();
  const currentTargetRef = useRef(null);
  const keyStateRef = useRef(new Set());
  const hasInitialBaseSyncRef = useRef(false);
  const arrivalLockUntilRef = useRef(0);
  const agentHeight = 1.2;
  const homeFrontOffset = useMemo(() => new THREE.Vector3(0, 0, 10), []);
  const officeFrontOffset = useMemo(() => new THREE.Vector3(0, 0, 10), []);
  const hospitalFrontOffset = useMemo(() => new THREE.Vector3(0, 0, 10), []);

  const OBSTACLES = useMemo(() => {
    const blocks = [
      [-78, 0, -26, 4.6, 7.8], [-66, 0, -26, 4.2, 7.1], [-54, 0, -26, 4.4, 7.4], [-42, 0, -26, 4.2, 7.2], [-30, 0, -26, 4.8, 8.2], [-18, 0, -26, 4.4, 7.9], [-6, 0, -26, 4.6, 8.0], [6, 0, -26, 4.2, 7.1], [18, 0, -26, 4.5, 7.8], [30, 0, -26, 4.3, 7.2], [42, 0, -26, 4.7, 8.0], [54, 0, -26, 4.4, 7.6], [66, 0, -26, 4.6, 7.8], [78, 0, -26, 4.2, 7.1],
      [-78, 0, -6, 4.5, 8], [-66, 0, -6, 3.6, 6.5], [-54, 0, -6, 4.2, 7.6], [-42, 0, -6, 3.8, 6.8], [-30, 0, -6, 4.8, 8.2], [-18, 0, -6, 4.2, 7.2], [-6, 0, -6, 4.1, 7.2], [6, 0, -6, 3.4, 6.1], [18, 0, -6, 3.8, 6.8], [30, 0, -6, 3.7, 6.6], [42, 0, -6, 4.4, 7.8], [54, 0, -6, 4.2, 7.0], [66, 0, -6, 4.5, 8], [78, 0, -6, 3.6, 6.5],
      [-78, 0, 18, 4.1, 7.2], [-66, 0, 18, 3.4, 6.1], [-54, 0, 18, 3.8, 6.8], [-42, 0, 18, 3.7, 6.6], [-30, 0, 18, 4.4, 7.8], [-18, 0, 18, 4.2, 7.0], [-6, 0, 18, 4.1, 7.2], [6, 0, 18, 3.4, 6.1], [18, 0, 18, 3.8, 6.8], [30, 0, 18, 3.7, 6.6], [42, 0, 18, 4.4, 7.8], [54, 0, 18, 4.2, 7.0], [66, 0, 18, 4.1, 7.2], [78, 0, 18, 3.4, 6.1],
      [-78, 0, 38, 4.4, 7.7], [-66, 0, 38, 3.8, 6.3], [-54, 0, 38, 4.0, 6.9], [-42, 0, 38, 3.8, 6.2], [-30, 0, 38, 4.1, 7.3], [-18, 0, 38, 4.4, 7.6], [-6, 0, 38, 4.2, 7.2], [6, 0, 38, 3.8, 6.3], [18, 0, 38, 4.0, 6.9], [30, 0, 38, 3.8, 6.2], [42, 0, 38, 4.1, 7.3], [54, 0, 38, 4.4, 7.6], [66, 0, 38, 4.2, 7.2], [78, 0, 38, 3.8, 6.3],
      [-78, 0, -44, 4.5, 7.8], [-66, 0, -44, 4.0, 6.9], [-54, 0, -44, 4.3, 7.2], [-42, 0, -44, 4.1, 6.8], [-30, 0, -44, 4.4, 7.5], [-18, 0, -44, 4.6, 7.8], [-6, 0, -44, 4.2, 7.2], [6, 0, -44, 3.9, 6.8], [18, 0, -44, 4.4, 7.5], [30, 0, -44, 4.0, 6.9], [42, 0, -44, 4.3, 7.4], [54, 0, -44, 4.5, 7.7], [66, 0, -44, 4.2, 7.2], [78, 0, -44, 3.9, 6.8],
    ];

    const staticObs = [
      { pos: new THREE.Vector3(0, 0, 0), radius: 6 },    // Home
      { pos: new THREE.Vector3(80, 0, 0), radius: 8 },   // Office
      { pos: new THREE.Vector3(-20, 0, 0), radius: 8 },  // Hospital
      { pos: new THREE.Vector3(0, 0, -90), radius: 12 }, // Farm Area
      { pos: new THREE.Vector3(0, 0, -130), radius: 10 } // Village
    ];

    // Convert blocks to circular obstacles for simple collision
    const blockObs = blocks.map(b => ({
      pos: new THREE.Vector3(b[0], 0, b[2]),
      radius: Math.sqrt(b[3] * b[3] + b[4] * b[4]) * 0.5 + 1.5 // Diagonal radius + buffer
    }));

    return [...staticObs, ...blockObs];
  }, []);

  const checkCollision = (newPos, currentPos) => {
    for (const obs of OBSTACLES) {
      if (newPos.distanceTo(obs.pos) < obs.radius) {
        // If distance to target is less than radius, only allow if currentPos was already closer
        // (to allow arriving at the front door)
        if (currentPos.distanceTo(obs.pos) > obs.radius) return true;
      }
    }
    return false;
  };

  const getAdjustedBase = (locationVector, locationName) => {
    if (!locationVector) return new THREE.Vector3(0, agentHeight, 0);
    const base = locationVector.clone();
    const key = String(locationName || '').toLowerCase();
    if (key === 'home') {
      base.add(homeFrontOffset);
    } else if (key === 'office') {
      base.add(officeFrontOffset);
    } else if (key === 'hospital') {
      base.add(hospitalFrontOffset);
    }
    base.y = agentHeight;
    return base;
  };

  const currentBase = useMemo(
    () => {
      const locationName = String(currentLocation || 'home').toLowerCase();
      const rawBase = LOCATION_TARGETS[locationName] || LOCATION_TARGETS.home;
      return getAdjustedBase(rawBase, locationName);
    },
    [currentLocation, homeFrontOffset, officeFrontOffset, hospitalFrontOffset],
  );

  useEffect(() => {
    const target = targetPosition
      ? (targetPosition.clone?.() || new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z))
      : null;
    if (target) {
      const locationKey = String(targetLocation || '').toLowerCase();
      if (locationKey === 'home') {
        target.add(homeFrontOffset);
      } else if (locationKey === 'office') {
        target.add(officeFrontOffset);
      } else if (locationKey === 'hospital') {
        target.add(hospitalFrontOffset);
      }
      target.y = agentHeight;
    }
    currentTargetRef.current = target;
    onMovementChange?.(Boolean(target));
  }, [targetPosition, targetLocation, onMovementChange, homeFrontOffset, officeFrontOffset, hospitalFrontOffset]);

  useEffect(() => {
    if (!agentRef.current || currentTargetRef.current) return;
    agentRef.current.position.set(currentBase.x, agentHeight, currentBase.z);
    onPositionChange?.([currentBase.x, agentHeight, currentBase.z]);
  }, [currentBase]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (performance.now() < arrivalLockUntilRef.current) return;
      const tagName = String(event.target?.tagName || '').toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || event.target?.isContentEditable) {
        return;
      }
      keyStateRef.current.add(String(event.key || '').toLowerCase());
    };

    const onKeyUp = (event) => {
      keyStateRef.current.delete(String(event.key || '').toLowerCase());
    };

    const onWindowBlur = () => {
      keyStateRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, []);

  useFrame(() => {
    const agent = agentRef.current;
    if (!agent) return;
    const now = performance.now();

    const target = currentTargetRef.current;
    if (target) {
      const dir = target.clone().sub(agent.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.2) {
        dir.normalize();
        const stepSize = Math.min(dist, Math.min(0.24, Math.max(0.09, dist * 0.035)));
        const move = dir.clone().multiplyScalar(stepSize);
        const nextPos = agent.position.clone().add(move);

        if (!checkCollision(nextPos, agent.position)) {
           agent.position.add(move);
        } else {
           // Champion Strategy: Try sliding either left or right of the obstacle
           const perpL = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(stepSize);
           const perpR = new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(stepSize);
           
           if (!checkCollision(agent.position.clone().add(perpL), agent.position)) {
             agent.position.add(perpL);
           } else if (!checkCollision(agent.position.clone().add(perpR), agent.position)) {
             agent.position.add(perpR);
           }
        }
        
        agent.lookAt(target);
        onDirectionChange?.(dir.clone());
      } else {
        agent.position.copy(target);
        currentTargetRef.current = null;
        keyStateRef.current.clear();
        arrivalLockUntilRef.current = performance.now() + 260;
        onMovementChange?.(false);
        onArrive?.(targetLocation);
      }
    } else {
      if (now < arrivalLockUntilRef.current) {
        onPositionChange?.([agent.position.x, agentHeight, agent.position.z]);
        return;
      }

      const keys = keyStateRef.current;
      let dx = 0;
      let dz = 0;

      if (keys.has('w') || keys.has('arrowup')) dz -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dz += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;

      if (dx !== 0 || dz !== 0) {
        const move = new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(0.12);
        agent.position.add(move);

        const lookPoint = agent.position.clone().add(move);
        lookPoint.y = agent.position.y;
        agent.lookAt(lookPoint);
        onDirectionChange?.(move.clone().normalize());
      }
    }

    let animationOffset = 0;
    if (activeAction === 'work' || activeAction === 'work_online') {
      animationOffset = Math.sin(now * 0.01) * 0.05;
    } else if (activeAction === 'help_agriculture' || activeAction === 'plant_crop' || activeAction === 'harvest_crop') {
      animationOffset = Math.sin(now * 0.012) * 0.035;
    } else if (activeAction === 'rest' || activeAction === 'sleep') {
      animationOffset = 0;
    }

    agent.position.y = agentHeight + animationOffset;

    onPositionChange?.([agent.position.x, agentHeight, agent.position.z]);
  });

  return (
    <group ref={agentRef} position={[currentBase.x, agentHeight, currentBase.z]} renderOrder={20}>
      {/* Ground Indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -agentHeight + 0.05, 0]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.95, 10]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.6} emissive="#3b82f6" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#f1c6a7" roughness={0.82} />
      </mesh>

      <mesh position={[0, 1.2, 0.2]} castShadow>
        <boxGeometry args={[0.25, 0.12, 0.12]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.74, 0.28]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.04]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.68} />
      </mesh>

      <mesh position={[-0.33, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.52, 4, 8]} />
        <meshStandardMaterial color="#f1c6a7" roughness={0.82} />
      </mesh>

      <mesh position={[0.33, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.52, 4, 8]} />
        <meshStandardMaterial color="#f1c6a7" roughness={0.82} />
      </mesh>

      <mesh position={[-0.12, -0.45, 0]} castShadow>
        <capsuleGeometry args={[0.085, 0.76, 4, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.82} />
      </mesh>

      <mesh position={[0.12, -0.45, 0]} castShadow>
        <capsuleGeometry args={[0.085, 0.76, 4, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.82} />
      </mesh>

      <mesh position={[-0.12, -0.93, 0.08]} castShadow>
        <boxGeometry args={[0.18, 0.07, 0.28]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>

      <mesh position={[0.12, -0.93, 0.08]} castShadow>
        <boxGeometry args={[0.18, 0.07, 0.28]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
    </group>
  );
}
