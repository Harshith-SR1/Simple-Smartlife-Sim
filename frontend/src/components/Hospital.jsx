import { snap } from '../systems/navigation';

export default function Hospital({ position = [-20, 0, 0], interiorActive = false, nightMode = false }) {
  const basePosition = [snap(position[0]), 0, snap(position[2])];

  return (
    <group position={basePosition}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.12, 8.2]} />
        <meshStandardMaterial color="#d0d8df" roughness={0.92} />
      </mesh>

      <mesh position={[-3.25, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 3.8, 7.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.74} />
      </mesh>
      <mesh position={[3.25, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 3.8, 7.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.74} />
      </mesh>
      <mesh position={[0, 1.9, -3.9]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 3.8, 0.34]} />
        <meshStandardMaterial color="#ffffff" roughness={0.74} />
      </mesh>
      {!interiorActive ? (
        <mesh position={[0, 1.9, 3.9]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 3.8, 0.34]} />
          <meshStandardMaterial color="#ffffff" roughness={0.74} />
        </mesh>
      ) : null}

      {!interiorActive ? (
        <mesh position={[0, 4.15, 0]} castShadow>
          <boxGeometry args={[7.2, 0.3, 8.4]} />
          <meshStandardMaterial color="#edf2f7" roughness={0.8} />
        </mesh>
      ) : null}

      <mesh position={[0, 4.55, 4.1]} visible={!interiorActive}>
        <boxGeometry args={[1.0, 2.0, 0.15]} />
        <meshStandardMaterial color="#c41e3a" roughness={0.5} emissive="#c41e3a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 4.55, 4.1]} visible={!interiorActive}>
        <boxGeometry args={[2.0, 1.0, 0.15]} />
        <meshStandardMaterial color="#c41e3a" roughness={0.5} emissive="#c41e3a" emissiveIntensity={0.3} />
      </mesh>
      {[-2.1, 0, 2.1].flatMap((x) => [1.2, 2.1, 3.0].map((y) => (
        <mesh key={`hospital-window-${x}-${y}`} position={[x, y, 4.05]} visible={!interiorActive}>
          <boxGeometry args={[0.65, 0.48, 0.08]} />
          <meshStandardMaterial color="#b3d9ff" roughness={0.3} metalness={0.4} emissive={nightMode ? '#ffe9a8' : '#000000'} emissiveIntensity={nightMode ? 0.24 : 0} />
        </mesh>
      )))}

      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[6.3, 0.08, 7.0]} />
        <meshStandardMaterial color="#eff6ff" roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.04, 6.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.97} />
      </mesh>

      {interiorActive ? (
        <>
          <group position={[-1.4, 0, -0.6]}>
            <mesh position={[0, 0.56, 0]} castShadow>
              <boxGeometry args={[2.1, 0.18, 2.6]} />
              <meshStandardMaterial color="#dbe4ec" roughness={0.84} />
            </mesh>
            <mesh position={[0, 0.9, -0.85]} castShadow>
              <boxGeometry args={[2.1, 0.52, 0.22]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.78} />
            </mesh>
            <mesh position={[0, 1.02, 0.6]} castShadow>
              <boxGeometry args={[1.1, 0.08, 0.75]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.2} />
            </mesh>
          </group>

          <group position={[1.5, 0, -0.9]}>
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[1.6, 0.16, 0.9]} />
              <meshStandardMaterial color="#b6c1cb" roughness={0.86} />
            </mesh>
            {[-0.6, 0.6].flatMap((x) => [-0.3, 0.3].map((z) => (
              <mesh key={`med-desk-leg-${x}-${z}`} position={[x, 0.35, z]} castShadow>
                <boxGeometry args={[0.08, 0.7, 0.08]} />
                <meshStandardMaterial color="#64748b" roughness={0.82} />
              </mesh>
            )))}
            <mesh position={[0, 1.05, -0.42]} castShadow>
              <boxGeometry args={[0.9, 0.55, 0.08]} />
              <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.2} />
            </mesh>
          </group>

          <mesh position={[0, 1.2, 2.6]}>
            <boxGeometry args={[3.0, 0.12, 0.1]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.35} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}
