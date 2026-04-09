import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function createLoop(points) {
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.25);
}

const TRAFFIC = [
  {
    color: '#ef4444',
    scale: [1.0, 0.45, 2.1],
    speed: 0.016,
    variance: 0.003,
    curve: createLoop([
      new THREE.Vector3(-94, 0.25, 8),
      new THREE.Vector3(94, 0.25, 8),
      new THREE.Vector3(94, 0.25, 16),
      new THREE.Vector3(-94, 0.25, 16),
    ]),
    stops: [0.12, 0.38, 0.64, 0.88],
  },
  {
    color: '#f59e0b',
    scale: [0.9, 0.4, 1.8],
    speed: 0.013,
    variance: 0.002,
    curve: createLoop([
      new THREE.Vector3(-94, 0.25, -16),
      new THREE.Vector3(94, 0.25, -16),
      new THREE.Vector3(94, 0.25, -8),
      new THREE.Vector3(-94, 0.25, -8),
    ]),
    stops: [0.21, 0.48, 0.71, 0.96],
  },
  {
    color: '#38bdf8',
    scale: [1.1, 0.45, 2.2],
    speed: 0.011,
    variance: 0.0025,
    curve: createLoop([
      new THREE.Vector3(-4, 0.25, 60),
      new THREE.Vector3(-4, 0.25, 24),
      new THREE.Vector3(-4, 0.25, -12),
      new THREE.Vector3(-4, 0.25, -48),
      new THREE.Vector3(4, 0.25, -48),
      new THREE.Vector3(4, 0.25, -12),
      new THREE.Vector3(4, 0.25, 24),
      new THREE.Vector3(4, 0.25, 60),
    ]),
    stops: [0.18, 0.52, 0.82],
  },
];

export default function Vehicle({ weather = 'sunny' }) {
  const refs = useRef([]);
  const wheelRefs = useRef([]);
  const progressRef = useRef(TRAFFIC.map((_, index) => index / TRAFFIC.length));
  const pauseRef = useRef(TRAFFIC.map(() => 0));
  const weatherSlowdown = weather === 'rainy' ? 0.72 : 1;

  useFrame((_, delta) => {
    TRAFFIC.forEach((config, index) => {
      const group = refs.current[index];
      if (!group) return;

      if (pauseRef.current[index] > 0) {
        pauseRef.current[index] = Math.max(0, pauseRef.current[index] - delta);
      } else {
        const travelSpeed = config.speed + ((index % 2) * config.variance);
        progressRef.current[index] = (progressRef.current[index] + delta * travelSpeed * weatherSlowdown) % 1;
        const shouldStop = config.stops.some((stop) => Math.abs(progressRef.current[index] - stop) < 0.006);
        if (shouldStop) {
          pauseRef.current[index] = 0.55 + (index % 3) * 0.12;
        }
      }

      const t = progressRef.current[index];
      const point = config.curve.getPointAt(t);
      const tangent = config.curve.getTangentAt(t);
      group.position.copy(point);
      group.rotation.y = Math.atan2(tangent.x, tangent.z);

      const wheels = wheelRefs.current[index] || [];
      wheels.forEach((wheel) => {
        if (wheel) wheel.rotation.x -= delta * 12;
      });
    });
  });

  return (
    <group>
      {TRAFFIC.map((config, index) => (
        <group key={`traffic-${index}`} ref={(node) => (refs.current[index] = node)} castShadow>
          <mesh castShadow>
            <boxGeometry args={config.scale} />
            <meshStandardMaterial color={config.color} roughness={0.35} metalness={0.16} />
          </mesh>
          <mesh position={[0, 0.34, 0.18]} castShadow>
            <boxGeometry args={[config.scale[0] * 0.72, config.scale[1] * 0.7, config.scale[2] * 0.48]} />
            <meshStandardMaterial color="#d8f3ff" roughness={0.2} metalness={0.35} />
          </mesh>
          {[ 
            [-0.42, -0.2, 0.68],
            [0.42, -0.2, 0.68],
            [-0.42, -0.2, -0.68],
            [0.42, -0.2, -0.68],
          ].map((pos, wheelIndex) => (
            <mesh
              key={`wheel-${index}-${wheelIndex}`}
              ref={(node) => {
                wheelRefs.current[index] = wheelRefs.current[index] || [];
                wheelRefs.current[index][wheelIndex] = node;
              }}
              position={pos}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.13, 0.13, 0.18, 12]} />
              <meshStandardMaterial color="#111827" roughness={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
