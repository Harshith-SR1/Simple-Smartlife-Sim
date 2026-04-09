import { snap } from './systems/navigation';
import { Html } from '@react-three/drei';

const FIELD_LAYOUT = [
  [-14, -8],
  [14, -8],
  [-14, 8],
  [14, 8],
];

const CATTLE_LAYOUT = [
  [-22, -16], [-10, -18], [4, -16], [16, -18],
  [-20, 16], [-8, 18], [8, 16], [20, 18],
  [-2, -22], [12, -22], [-12, 22], [2, 22],
];

const FARMER_LAYOUT = [
  [-26, -2], [-18, 10], [-2, -4], [10, 6], [24, 0],
];

function Fence({ width, depth }) {
  return (
    <group>
      <mesh position={[0, 0.4, -depth / 2]} castShadow>
        <boxGeometry args={[width, 0.5, 0.2]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.4, depth / 2]} castShadow>
        <boxGeometry args={[width, 0.5, 0.2]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.92} />
      </mesh>
      <mesh position={[-width / 2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, depth]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.92} />
      </mesh>
      <mesh position={[width / 2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, depth]} />
        <meshStandardMaterial color="#8b6a43" roughness={0.92} />
      </mesh>
    </group>
  );
}

function Cattle({ x, z, rotation = 0 }) {
  return (
    <group position={[snap(x), 0, snap(z)]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.5, 0.78, 0.58]} />
        <meshStandardMaterial color="#d8b189" roughness={0.9} />
      </mesh>
      <mesh position={[0.85, 0.53, 0]} castShadow>
        <boxGeometry args={[0.48, 0.46, 0.42]} />
        <meshStandardMaterial color="#c99c72" roughness={0.9} />
      </mesh>
      {[-0.45, 0.45].flatMap((lx) => [-0.2, 0.2].map((lz) => (
        <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.18, lz]} castShadow>
          <boxGeometry args={[0.12, 0.34, 0.12]} />
          <meshStandardMaterial color="#7a5738" roughness={0.92} />
        </mesh>
      )))}
    </group>
  );
}

function Farmer({ x, z, color = '#2563eb' }) {
  return (
    <group position={[snap(x), 0, snap(z)]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.72, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#f0c6a5" roughness={0.82} />
      </mesh>
      <mesh position={[0.12, 1.7, 0]} castShadow>
        <coneGeometry args={[0.28, 0.15, 12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.85} />
      </mesh>
    </group>
  );
}

export default function Farm({ position = [0, 0, -30], onFarmSelect = () => {}, cropStage = 0 }) {
  const basePosition = [snap(position[0]), 0, snap(position[2])];
  const plantHeight = cropStage === 0 ? 0 : cropStage === 1 ? 0.45 : cropStage === 2 ? 0.95 : 1.45;
  const plantColor = cropStage < 3 ? '#4ade80' : '#facc15';

  return (
    <group position={basePosition}>
      <mesh
        position={[0, 2, 0]}
        onClick={(event) => {
          onFarmSelect({
            id: 'FARM',
            target: [basePosition[0], 0, basePosition[2]],
          });
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[64, 4, 52]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 48]} />
        <meshStandardMaterial color="#95b56f" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[8, 48]} />
        <meshStandardMaterial color="#8a6539" roughness={0.98} />
      </mesh>

      {FIELD_LAYOUT.map(([x, z], index) => (
        <group key={`field-${index}`} position={[snap(x), 0, snap(z)]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
            <planeGeometry args={[16, 12]} />
            <meshStandardMaterial color="#8a6539" roughness={0.97} />
          </mesh>
          {[-4, 0, 4].map((line) => (
            <mesh key={`row-${line}`} position={[line, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.06, 11]} />
              <meshStandardMaterial color="#6b4f2d" roughness={0.95} />
            </mesh>
          ))}

          {cropStage > 0 ? [-4, -2, 0, 2, 4].map((line) => (
            <mesh key={`plant-${index}-${line}`} position={[line, 0.08 + plantHeight / 2, 0]} castShadow>
              <boxGeometry args={[0.18, plantHeight, 0.18]} />
              <meshStandardMaterial color={plantColor} roughness={0.78} />
            </mesh>
          )) : null}

          <Fence width={16.5} depth={12.5} />
        </group>
      ))}

      {CATTLE_LAYOUT.map(([x, z], index) => (
        <Cattle key={`farm-cattle-${index}`} x={x} z={z} rotation={index % 3 === 0 ? 0.4 : -0.35} />
      ))}

      {FARMER_LAYOUT.map(([x, z], index) => (
        <Farmer key={`farmer-${index}`} x={x} z={z} color={index % 2 === 0 ? '#1d4ed8' : '#b45309'} />
      ))}

      <Fence width={54} depth={42} />

      {cropStage === 3 ? (
        <group position={[0, 4.2, 0]}>
          <Html center distanceFactor={24} style={{ pointerEvents: 'none' }}>
            <div style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.86)',
              border: '1px solid rgba(250, 204, 21, 0.5)',
              color: '#fde68a',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              Ready to Harvest
            </div>
          </Html>
        </group>
      ) : null}
    </group>
  );
}
