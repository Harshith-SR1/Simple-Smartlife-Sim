import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const PATHS = [
  [new THREE.Vector3(-72, 0, 32), new THREE.Vector3(72, 0, 32), new THREE.Vector3(72, 0, 12), new THREE.Vector3(-72, 0, 12)],
  [new THREE.Vector3(-58, 0, 54), new THREE.Vector3(58, 0, 54), new THREE.Vector3(58, 0, 36), new THREE.Vector3(-58, 0, 36)],
  [new THREE.Vector3(-20, 0, -84), new THREE.Vector3(20, 0, -84), new THREE.Vector3(20, 0, -118), new THREE.Vector3(-20, 0, -118)],
  [new THREE.Vector3(-36, 0, -98), new THREE.Vector3(-10, 0, -122), new THREE.Vector3(16, 0, -122), new THREE.Vector3(34, 0, -98), new THREE.Vector3(0, 0, -86)],
];

export default function NPC({ count = 8, weather = 'sunny' }) {
  const refs = useRef([]);
  const states = useRef(
    Array.from({ length: count }, (_, index) => ({
      pathIndex: index % PATHS.length,
      targetIndex: 1,
      speed: 0.018 + (index % 3) * 0.004,
      stride: Math.random() * Math.PI,
    })),
  );

  const slowdown = weather === 'rainy' ? 0.78 : 1;
  const palette = useMemo(() => ['#5b8def', '#f97316', '#10b981', '#ec4899', '#eab308', '#a78bfa'], []);

  useFrame((_, delta) => {
    states.current.forEach((npcState, index) => {
      const npc = refs.current[index];
      if (!npc) return;

      const path = PATHS[npcState.pathIndex];
      const target = path[npcState.targetIndex];
      const direction = target.clone().sub(npc.position);
      const distance = direction.length();

      if (distance > 0.01) {
        direction.normalize();
        npc.position.addScaledVector(direction, npcState.speed * slowdown * delta * 60);
        npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, Math.atan2(direction.x, direction.z), 0.1);
      }

      if (distance < 0.35) {
        npcState.targetIndex = (npcState.targetIndex + 1) % path.length;
      }

      npcState.stride += delta * 8;
      npc.position.y = 0.42 + Math.sin(npcState.stride) * 0.06;
    });
  });

  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <group
          key={`npc-${index}`}
          ref={(node) => (refs.current[index] = node)}
          position={PATHS[index % PATHS.length][0].toArray()}
        >
          <mesh position={[0, 0.28, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.44, 4, 8]} />
            <meshStandardMaterial color={palette[index % palette.length]} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.84, 0]} castShadow>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshStandardMaterial color="#f1c89b" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.18, -0.18]} castShadow>
            <boxGeometry args={[0.34, 0.08, 0.22]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#0f172a' : '#7c3aed'} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
