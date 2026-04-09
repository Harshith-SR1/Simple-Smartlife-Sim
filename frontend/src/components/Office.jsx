import { snap } from '../systems/navigation';

export default function Office({ position = [20, 0, 0], interiorActive = false, nightMode = false, highlighted = false }) {
  const basePosition = [snap(position[0]), 0, snap(position[2])];

  return (
    <group position={basePosition}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[8, 0.12, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.95} />
      </mesh>

      <mesh position={[-3.1, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 4.6, 7.6]} />
        <meshStandardMaterial color="#90a4b8" roughness={0.68} />
      </mesh>
      <mesh position={[3.1, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 4.6, 7.6]} />
        <meshStandardMaterial color="#90a4b8" roughness={0.68} />
      </mesh>
      <mesh position={[0, 2.3, -3.8]} castShadow receiveShadow>
        <boxGeometry args={[5.9, 4.6, 0.35]} />
        <meshStandardMaterial color="#90a4b8" roughness={0.68} />
      </mesh>
      {!interiorActive ? (
        <mesh position={[0, 2.3, 3.8]} castShadow receiveShadow>
          <boxGeometry args={[5.9, 4.6, 0.35]} />
          <meshStandardMaterial color="#90a4b8" roughness={0.68} />
        </mesh>
      ) : null}

      {!interiorActive ? (
        <mesh position={[0, 4.75, 0]} castShadow>
          <boxGeometry args={[6.8, 0.35, 8.0]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
      ) : null}

      {[-2, 0, 2].flatMap((x) => [1.1, 2.1, 3.1].map((y) => (
        <mesh key={`office-window-${x}-${y}`} position={[x, y, 3.95]} visible={!interiorActive}>
          <boxGeometry args={[0.75, 0.5, 0.08]} />
          <meshStandardMaterial color="#bde7ff" roughness={0.2} metalness={0.45} emissive={nightMode ? '#ffe9a8' : '#000000'} emissiveIntensity={nightMode ? 0.3 : 0} />
        </mesh>
      )))}

      <mesh position={[0, 0.8, 3.95]} visible={!interiorActive}>
        <boxGeometry args={[1.2, 1.6, 0.08]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.08, 7]} />
        <meshStandardMaterial color="#dbe4ec" roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.04, 6.2]} />
        <meshStandardMaterial color="#edf4fa" roughness={0.96} />
      </mesh>

      {interiorActive ? (
        <>
          {[-1.6, 1.6].map((x) => (
            <group key={`desk-${x}`} position={[x, 0, -0.5]}>
              <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[1.8, 0.12, 1.0]} />
                <meshStandardMaterial color="#7c5f43" roughness={0.82} />
              </mesh>
              {[-0.7, 0.7].flatMap((dx) => [-0.35, 0.35].map((dz) => (
                <mesh key={`desk-leg-${dx}-${dz}`} position={[dx, 0.35, dz]} castShadow>
                  <boxGeometry args={[0.1, 0.7, 0.1]} />
                  <meshStandardMaterial color="#475569" roughness={0.76} />
                </mesh>
              )))}
              <mesh position={[0, 0.98, -0.18]} castShadow>
                <boxGeometry args={[0.8, 0.46, 0.06]} />
                <meshStandardMaterial color="#111827" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.98, -0.22]} castShadow>
                <boxGeometry args={[0.66, 0.3, 0.02]} />
                <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.45} />
              </mesh>
              <mesh position={[0, 1.25, -0.2]} castShadow>
                <boxGeometry args={[0.12, 0.42, 0.18]} />
                <meshStandardMaterial color="#64748b" roughness={0.7} />
              </mesh>
            </group>
          ))}

          {[-1.6, 1.6].map((x) => (
            <mesh key={`chair-${x}`} position={[x, 0.42, 1.25]} castShadow>
              <boxGeometry args={[0.7, 0.82, 0.7]} />
              <meshStandardMaterial color="#0f172a" roughness={0.82} />
            </mesh>
          ))}

          <mesh position={[0, 1.4, -2.3]} castShadow>
            <boxGeometry args={[1.6, 0.1, 0.9]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.8, -2.27]} castShadow>
            <boxGeometry args={[1.8, 0.9, 0.08]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>

          <mesh position={[0, 1.2, 2.1]}>
            <boxGeometry args={[3.1, 0.12, 0.1]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} />
          </mesh>
        </>
      ) : null}

      {highlighted ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
            <ringGeometry args={[5.5, 6.15, 40]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.42} />
          </mesh>

          <mesh position={[0, 4.95, 4.02]} visible={!interiorActive}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#bbf7d0" emissive="#22c55e" emissiveIntensity={nightMode ? 0.85 : 0.38} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}
