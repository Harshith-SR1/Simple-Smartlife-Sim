import { snap } from '../systems/navigation';

export default function Home({ position = [0, 0, 0], nightMode = false, interiorActive = false, highlighted = true }) {
  const basePosition = [snap(position[0]), 0, snap(position[2])];

  return (
    <group position={basePosition}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.12, 10]} />
        <meshStandardMaterial color="#756452" roughness={0.98} />
      </mesh>

      <mesh position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[7.8, 0.08, 7.8]} />
        <meshStandardMaterial color="#e8dac0" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 0.06, 8.4]} />
        <meshStandardMaterial color="#f6e7c8" roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.28, 4.65]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.08, 1.9]} />
        <meshStandardMaterial color="#dcc4a0" roughness={0.9} />
      </mesh>

      {[-1.7, 1.7].map((x) => (
        <mesh key={`porch-pillar-${x}`} position={[x, 1.2, 4.65]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 2.4, 0.25]} />
          <meshStandardMaterial color="#be9565" roughness={0.86} />
        </mesh>
      ))}

      <mesh position={[-3.75, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 3.2, 7.2]} />
        <meshStandardMaterial color="#d6b27f" roughness={0.8} />
      </mesh>
      <mesh position={[3.75, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 3.2, 7.2]} />
        <meshStandardMaterial color="#d6b27f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, -3.75]} castShadow receiveShadow>
        <boxGeometry args={[7.1, 3.2, 0.28]} />
        <meshStandardMaterial color="#d6b27f" roughness={0.8} />
      </mesh>
      {interiorActive ? null : (
        <mesh position={[0, 1.6, 3.75]} castShadow receiveShadow>
          <boxGeometry args={[7.1, 3.2, 0.28]} />
          <meshStandardMaterial color="#d6b27f" roughness={0.8} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[0, 4.1, 0]} castShadow>
          <coneGeometry args={[5.2, 1.8, 4]} />
          <meshStandardMaterial color="#8b5e34" roughness={0.86} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[0, 4.7, 0]} castShadow>
          <coneGeometry args={[4.9, 0.42, 4]} />
          <meshStandardMaterial color="#5c3b20" roughness={0.8} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[0, 1.15, 3.75]}>
          <boxGeometry args={[1.45, 2.15, 0.14]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[0, 2.8, 3.8]}>
          <boxGeometry args={[2.8, 0.2, 0.12]} />
          <meshStandardMaterial color="#6b4b2b" roughness={0.86} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[-2.2, 1.9, 3.76]}>
          <boxGeometry args={[0.9, 0.7, 0.08]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.28} />
        </mesh>
      )}

      {interiorActive ? null : (
        <mesh position={[2.15, 1.9, 3.76]}>
          <boxGeometry args={[0.9, 0.7, 0.08]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.28} />
        </mesh>
      )}

      {[-2.1, 2.1].map((x) => (
        <mesh key={`window-${x}`} position={[x, 2.1, 3.75]} visible={!interiorActive}>
          <boxGeometry args={[0.95, 0.95, 0.08]} />
          <meshStandardMaterial color="#b9e5ff" roughness={0.28} emissive={nightMode ? '#ffe9a8' : '#000000'} emissiveIntensity={nightMode ? 0.45 : 0} />
        </mesh>
      ))}

      {interiorActive ? null : (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[5.2, 0.04, 5.2]} />
          <meshStandardMaterial color="#f7edd7" roughness={0.96} />
        </mesh>
      )}

      {interiorActive ? (
        <>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[7.2, 0.03, 7.2]} />
            <meshStandardMaterial color="#f8ebcf" roughness={0.98} />
          </mesh>

          <mesh position={[-2.2, 0.42, -1.9]} castShadow>
            <boxGeometry args={[2.7, 0.26, 1.35]} />
            <meshStandardMaterial color="#8f6941" roughness={0.82} />
          </mesh>
          <mesh position={[-2.2, 0.68, -1.9]} castShadow>
            <boxGeometry args={[2.5, 0.2, 1.12]} />
            <meshStandardMaterial color="#ddcab0" roughness={0.85} />
          </mesh>
          <mesh position={[-3.15, 0.74, -1.9]} castShadow>
            <boxGeometry args={[0.2, 0.58, 1.12]} />
            <meshStandardMaterial color="#a67c52" roughness={0.84} />
          </mesh>

          <mesh position={[1.55, 0.6, -1.0]} castShadow>
            <boxGeometry args={[1.8, 0.12, 1.0]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.82} />
          </mesh>

          <mesh position={[1.55, 0.4, -1.0]} castShadow>
            <boxGeometry args={[1.5, 0.08, 1.1]} />
            <meshStandardMaterial color="#5c3b20" roughness={0.84} />
          </mesh>

          <mesh position={[0.4, 0.35, 1.0]} castShadow>
            <boxGeometry args={[1.7, 0.08, 1.2]} />
            <meshStandardMaterial color="#c97d4d" roughness={0.9} />
          </mesh>

          <mesh position={[0.4, 0.8, 1.0]} castShadow>
            <boxGeometry args={[1.0, 0.55, 0.6]} />
            <meshStandardMaterial color="#9f6b3d" roughness={0.88} />
          </mesh>

          <mesh position={[2.55, 0.95, -1.9]} castShadow>
            <boxGeometry args={[1.25, 1.6, 0.45]} />
            <meshStandardMaterial color="#7f5530" roughness={0.85} />
          </mesh>

          <mesh position={[2.55, 1.7, -1.9]}>
            <boxGeometry args={[1.05, 0.8, 0.25]} />
            <meshStandardMaterial color="#c7dff4" emissive="#c7dff4" emissiveIntensity={0.12} />
          </mesh>

          <mesh position={[-0.55, 0.5, 2.15]} castShadow>
            <boxGeometry args={[2.6, 0.16, 1.1]} />
            <meshStandardMaterial color="#7a532d" roughness={0.82} />
          </mesh>

          <mesh position={[-1.55, 0.75, 2.15]} castShadow>
            <boxGeometry args={[0.75, 0.58, 0.9]} />
            <meshStandardMaterial color="#ad7d4f" roughness={0.84} />
          </mesh>

          <mesh position={[0.45, 0.75, 2.15]} castShadow>
            <boxGeometry args={[0.75, 0.58, 0.9]} />
            <meshStandardMaterial color="#ad7d4f" roughness={0.84} />
          </mesh>
        </>
      ) : null}

      {highlighted ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
            <ringGeometry args={[6.2, 6.75, 40]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.42} />
          </mesh>

          <mesh position={[0, 3.0, 3.98]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={nightMode ? 0.9 : 0.35} />
          </mesh>
        </>
      ) : null}

      {[-4.2, -1.4, 1.4, 4.2].map((x) => (
        <mesh key={`fence-front-${x}`} position={[x, 0.4, 5.0]} castShadow>
          <boxGeometry args={[1.7, 0.45, 0.08]} />
          <meshStandardMaterial color="#8b6a43" roughness={0.92} />
        </mesh>
      ))}
      {[-4.7, 4.7].map((x) => (
        <mesh key={`fence-side-${x}`} position={[x, 0.4, 0]} castShadow>
          <boxGeometry args={[0.08, 0.45, 10]} />
          <meshStandardMaterial color="#8b6a43" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, -5.0]} castShadow>
        <boxGeometry args={[9.4, 0.45, 0.08]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.92} />
      </mesh>

      {[-3.3, -2.2, 2.2, 3.3].map((x) => (
        <mesh key={`flower-bed-${x}`} position={[x, 0.16, 5.58]}>
          <boxGeometry args={[0.8, 0.14, 0.35]} />
          <meshStandardMaterial color="#3f7b3f" roughness={0.92} />
        </mesh>
      ))}

      <group position={[-2.2, 0, 7.8]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[2.9, 0.78, 1.45]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.76} />
        </mesh>
        <mesh position={[0.7, 0.9, 0]} castShadow>
          <boxGeometry args={[1.05, 0.5, 1.05]} />
          <meshStandardMaterial color="#2563eb" roughness={0.72} />
        </mesh>
        <mesh position={[-1.05, 0.25, 0.66]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.92} />
        </mesh>
        <mesh position={[1.0, 0.25, 0.66]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.92} />
        </mesh>
        <mesh position={[-1.05, 0.25, -0.66]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.92} />
        </mesh>
        <mesh position={[1.0, 0.25, -0.66]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.92} />
        </mesh>
      </group>

      <group position={[2.7, 0, 7.4]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[1.25, 0.2, 0.35]} />
          <meshStandardMaterial color="#dc2626" roughness={0.8} />
        </mesh>
        <mesh position={[0.28, 0.78, 0]} castShadow>
          <boxGeometry args={[0.42, 0.28, 0.25]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.82} />
        </mesh>
        <mesh position={[-0.45, 0.38, 0]} castShadow>
          <boxGeometry args={[0.12, 0.65, 0.12]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
        <mesh position={[0.62, 0.38, 0]} castShadow>
          <boxGeometry args={[0.12, 0.65, 0.12]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
        <mesh position={[-0.65, 0.2, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.95} />
        </mesh>
        <mesh position={[0.7, 0.2, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.95} />
        </mesh>
        <mesh position={[-0.65, 0.2, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.95} />
        </mesh>
        <mesh position={[0.7, 0.2, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}
