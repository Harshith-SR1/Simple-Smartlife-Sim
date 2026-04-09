import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Trader({ agentPositionRef, traderPosition = [1.2, 0, -1.2], onProximityChange, nightMode = false }) {
  const groupRef = useRef();
  const [active, setActive] = useState(false);
  const proximityRef = useRef(false);
  const trader = useMemo(() => new THREE.Vector3(...traderPosition), [traderPosition]);

  useFrame(() => {
    const agent = new THREE.Vector3(...(agentPositionRef?.current || [0, 0, 0]));
    const nextActive = trader.distanceTo(agent) < 2.5;
    if (nextActive !== proximityRef.current) {
      proximityRef.current = nextActive;
      setActive(nextActive);
      onProximityChange?.(nextActive);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={traderPosition}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.12, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.46, 4, 8]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#f1c89b" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.12, -0.55]} castShadow>
        <boxGeometry args={[0.62, 0.38, 0.05]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.12, -0.58]}>
        <boxGeometry args={[0.48, 0.26, 0.02]} />
        <meshStandardMaterial color={active ? '#38bdf8' : '#1e293b'} emissive="#38bdf8" emissiveIntensity={active ? 1.2 : 0} />
      </mesh>
      {active ? (
        <>
          <mesh position={[0, 2.06, 0]}>
            <boxGeometry args={[1.95, 0.42, 0.08]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.82} />
          </mesh>
          <Text position={[0, 2.05, 0.06]} fontSize={0.2} color="#34d399" anchorX="center">Press E to trade</Text>
        </>
      ) : null}
      {nightMode ? (
        <mesh position={[0, 1.3, -0.62]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#fff3c4" emissive="#fff3c4" emissiveIntensity={0.7} />
        </mesh>
      ) : null}
    </group>
  );
}
