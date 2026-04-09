import { GRID, snap } from './systems/navigation';

const ROAD_COLOR = '#3f3f46';
const MARK_COLOR = '#f8fafc';

function Road({ position, size }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={ROAD_COLOR} roughness={0.95} />
    </mesh>
  );
}

export default function RoadSystem() {
  const lane = GRID;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[450, 450]} />
        <meshStandardMaterial color="#8db36f" roughness={1} />
      </mesh>

      {[-40, -20, 0, 20, 40].map((x) => (
        <Road key={`vertical-road-${x}`} position={[snap(x), 0.02, snap(-24)]} size={[lane, 0.08, 200]} />
      ))}

      {[-60, -30, 0, 30].map((z) => (
        <Road key={`horizontal-road-${z}`} position={[0, 0.02, snap(z)]} size={[220, 0.08, lane]} />
      ))}

      <mesh position={[snap(0), 0.03, snap(0)]}>
        <boxGeometry args={[lane + 1, 0.1, lane + 1]} />
        <meshStandardMaterial color="#52525b" roughness={0.92} />
      </mesh>

      {[-40, -20, 0, 20, 40].map((x) => (
        <mesh key={`x-mark-${x}`} position={[snap(x), 0.07, 0]}>
          <boxGeometry args={[4, 0.01, 0.5]} />
          <meshStandardMaterial color={MARK_COLOR} />
        </mesh>
      ))}

      {[-60, -30, 0, 30].map((z) => (
        <mesh key={`z-mark-${z}`} position={[0, 0.07, snap(z)]}>
          <boxGeometry args={[0.5, 0.01, 4]} />
          <meshStandardMaterial color={MARK_COLOR} />
        </mesh>
      ))}
    </group>
  );
}
