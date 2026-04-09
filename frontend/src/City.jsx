import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Home from './components/Home';
import Office from './components/Office';
import Hospital from './components/Hospital';
import Vehicle from './Vehicle';
import NPC from './NPC';

const BLOCKS = [
  [-78, 0, -26, 4.6, 7.8],
  [-66, 0, -26, 4.2, 7.1],
  [-54, 0, -26, 4.4, 7.4],
  [-42, 0, -26, 4.2, 7.2],
  [-30, 0, -26, 4.8, 8.2],
  [-18, 0, -26, 4.4, 7.9],
  [-6, 0, -26, 4.6, 8.0],
  [6, 0, -26, 4.2, 7.1],
  [18, 0, -26, 4.5, 7.8],
  [30, 0, -26, 4.3, 7.2],
  [42, 0, -26, 4.7, 8.0],
  [54, 0, -26, 4.4, 7.6],
  [66, 0, -26, 4.6, 7.8],
  [78, 0, -26, 4.2, 7.1],
  [-78, 0, -6, 4.5, 8],
  [-66, 0, -6, 3.6, 6.5],
  [-54, 0, -6, 4.2, 7.6],
  [-42, 0, -6, 3.8, 6.8],
  [-30, 0, -6, 4.8, 8.2],
  [-18, 0, -6, 4.2, 7.2],
  [-6, 0, -6, 4.1, 7.2],
  [6, 0, -6, 3.4, 6.1],
  [18, 0, -6, 3.8, 6.8],
  [30, 0, -6, 3.7, 6.6],
  [42, 0, -6, 4.4, 7.8],
  [54, 0, -6, 4.2, 7.0],
  [66, 0, -6, 4.5, 8],
  [78, 0, -6, 3.6, 6.5],
  [-78, 0, 18, 4.1, 7.2],
  [-66, 0, 18, 3.4, 6.1],
  [-54, 0, 18, 3.8, 6.8],
  [-42, 0, 18, 3.7, 6.6],
  [-30, 0, 18, 4.4, 7.8],
  [-18, 0, 18, 4.2, 7.0],
  [-6, 0, 18, 4.1, 7.2],
  [6, 0, 18, 3.4, 6.1],
  [18, 0, 18, 3.8, 6.8],
  [30, 0, 18, 3.7, 6.6],
  [42, 0, 18, 4.4, 7.8],
  [54, 0, 18, 4.2, 7.0],
  [66, 0, 18, 4.1, 7.2],
  [78, 0, 18, 3.4, 6.1],
  [-78, 0, 38, 4.4, 7.7],
  [-66, 0, 38, 3.8, 6.3],
  [-54, 0, 38, 4.0, 6.9],
  [-42, 0, 38, 3.8, 6.2],
  [-30, 0, 38, 4.1, 7.3],
  [-18, 0, 38, 4.4, 7.6],
  [-6, 0, 38, 4.2, 7.2],
  [6, 0, 38, 3.8, 6.3],
  [18, 0, 38, 4.0, 6.9],
  [30, 0, 38, 3.8, 6.2],
  [42, 0, 38, 4.1, 7.3],
  [54, 0, 38, 4.4, 7.6],
  [66, 0, 38, 4.2, 7.2],
  [78, 0, 38, 3.8, 6.3],
  [-78, 0, -44, 4.5, 7.8],
  [-66, 0, -44, 4.0, 6.9],
  [-54, 0, -44, 4.3, 7.2],
  [-42, 0, -44, 4.1, 6.8],
  [-30, 0, -44, 4.4, 7.5],
  [-18, 0, -44, 4.6, 7.8],
  [-6, 0, -44, 4.2, 7.2],
  [6, 0, -44, 3.9, 6.8],
  [18, 0, -44, 4.4, 7.5],
  [30, 0, -44, 4.0, 6.9],
  [42, 0, -44, 4.3, 7.4],
  [54, 0, -44, 4.5, 7.7],
  [66, 0, -44, 4.2, 7.2],
  [78, 0, -44, 3.9, 6.8],
  [-78, 0, 54, 4.2, 7.2],
  [-66, 0, 54, 3.9, 6.8],
  [-54, 0, 54, 4.4, 7.5],
  [-42, 0, 54, 4.0, 6.9],
  [-30, 0, 54, 4.3, 7.4],
  [-18, 0, 54, 4.5, 7.7],
  [-6, 0, 54, 4.2, 7.2],
  [6, 0, 54, 3.9, 6.8],
  [18, 0, 54, 4.4, 7.5],
  [30, 0, 54, 4.0, 6.9],
  [42, 0, 54, 4.3, 7.4],
  [54, 0, 54, 4.5, 7.7],
  [66, 0, 54, 4.2, 7.2],
  [78, 0, 54, 3.9, 6.8],
];

function Crosswalk({ position, rotation = 0 }) {
  const stripes = useMemo(() => Array.from({ length: 6 }, (_, i) => -2.5 + i), []);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {stripes.map((offset) => (
        <mesh key={`stripe-${offset}`} position={[offset, 0.05, 0]}>
          <boxGeometry args={[0.55, 0.02, 2.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function FenceLine({ from, to, color = '#64748b' }) {
  const horizontal = Math.abs(to[0] - from[0]) > Math.abs(to[2] - from[2]);
  const length = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[2] - from[2]));
  const center = [(from[0] + to[0]) / 2, 0, (from[2] + to[2]) / 2];

  return (
    <group position={center}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[horizontal ? length : 0.3, 1.1, horizontal ? 0.3 : length]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[horizontal ? length : 0.18, 0.12, horizontal ? 0.18 : length]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
    </group>
  );
}

export default function City({ timeOfDay = 'morning', season = 'summer', onBuildingSelect = () => {} }) {
  const treeRefs = useRef([]);
  const blocks = useMemo(
    () => BLOCKS.map((spec, index) => ({
      position: [spec[0], 0, spec[2]],
      width: spec[3],
      height: spec[4],
      depth: 4 + (index % 3),
      color: ['#4e6278', '#526c84', '#47576a'][index % 3],
    })),
    [],
  );

  useFrame((state) => {
    treeRefs.current.forEach((tree, index) => {
      if (!tree) return;
      tree.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.02;
    });
  });

  const nightWindows = timeOfDay === 'night';
  const verge = season === 'winter' ? '#617a66' : '#44704a';

  return (
    <group>
      {[
        { id: 'HOME', pos: [0, 1.6, 0], size: [10, 3.6, 10] },
        { id: 'OFFICE', pos: [80, 2.2, 0], size: [8.8, 4.8, 8.8] },
        { id: 'HOSPITAL', pos: [-20, 2.0, 0], size: [8.8, 4.4, 8.8] },
      ].map((hotspot) => (
        <mesh
          key={`hotspot-${hotspot.id}`}
          position={hotspot.pos}
          onClick={(event) => {
            onBuildingSelect(hotspot.id);
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={hotspot.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 12]} receiveShadow>
        <planeGeometry args={[200, 140]} />
        <meshStandardMaterial color={verge} roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 12]} receiveShadow>
        <planeGeometry args={[190, 10]} />
        <meshStandardMaterial color="#2d3137" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 12]} receiveShadow>
        <planeGeometry args={[10, 140]} />
        <meshStandardMaterial color="#2d3137" roughness={0.92} />
      </mesh>

      {[-78, -66, -54, -42, -30, -18, -6, 6, 18, 30, 42, 54, 66, 78, 90].map((x) => (
        <mesh key={`lane-x-${x}`} position={[x, 0.06, 12]}>
          <boxGeometry args={[0.35, 0.02, 100]} />
          <meshStandardMaterial color="#f5d76e" />
        </mesh>
      ))}
      {[-48, -28, -8, 12, 32, 52].map((z) => (
        <mesh key={`lane-z-${z}`} position={[0, 0.06, z]}>
          <boxGeometry args={[190, 0.02, 0.35]} />
          <meshStandardMaterial color="#f5d76e" />
        </mesh>
      ))}

      <Crosswalk position={[0, 0, 32]} />
      <Crosswalk position={[0, 0, 12]} />
      <Crosswalk position={[0, 0, -8]} />
      <Crosswalk position={[0, 0, 52]} />
      <Crosswalk position={[-60, 0, 12]} rotation={Math.PI / 2} />
      <Crosswalk position={[-40, 0, 12]} rotation={Math.PI / 2} />
      <Crosswalk position={[-20, 0, 12]} rotation={Math.PI / 2} />
      <Crosswalk position={[20, 0, 12]} rotation={Math.PI / 2} />
      <Crosswalk position={[40, 0, 12]} rotation={Math.PI / 2} />
      <Crosswalk position={[60, 0, 12]} rotation={Math.PI / 2} />

      {blocks.map((block, index) => (
        <group key={`block-${index}`} position={block.position}>
          <mesh position={[0, block.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[block.width, block.height, block.depth]} />
            <meshStandardMaterial color={block.color} roughness={0.74} />
          </mesh>
          <mesh position={[0, block.height + 0.12, 0]} castShadow>
            <boxGeometry args={[block.width * 0.72, 0.18, block.depth * 0.72]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#1f2937' : '#334155'} roughness={0.72} />
          </mesh>
          <mesh position={[0, block.height + 0.2, 0]} castShadow>
            <boxGeometry args={[block.width * 0.82, 0.3, block.depth * 0.82]} />
            <meshStandardMaterial color="#334155" roughness={0.88} />
          </mesh>
          <mesh position={[0, block.height * 0.46, block.depth / 2 + 0.09]} castShadow>
            <boxGeometry args={[block.width * 0.46, 0.14, 0.12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
          <mesh position={[-block.width * 0.28, block.height * 0.42, block.depth / 2 + 0.09]} castShadow>
            <boxGeometry args={[0.12, 0.9, 0.12]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.08} />
          </mesh>
          <mesh position={[block.width * 0.28, block.height * 0.42, block.depth / 2 + 0.09]} castShadow>
            <boxGeometry args={[0.12, 0.9, 0.12]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.08} />
          </mesh>
          {Array.from({ length: 4 }, (_, row) => row).map((row) =>
            [-0.9, 0, 0.9].map((xOffset) => (
              <mesh key={`window-${index}-${row}-${xOffset}`} position={[xOffset, 1.3 + row * 1.4, block.depth / 2 + 0.04]}>
                <boxGeometry args={[0.5, 0.55, 0.08]} />
                <meshStandardMaterial
                  color="#9fd4ff"
                  roughness={0.3}
                  emissive={nightWindows ? '#ffe9a8' : '#000000'}
                  emissiveIntensity={nightWindows ? 0.45 : 0}
                />
              </mesh>
            )),
          )}
          <mesh position={[0, 0.65, block.depth / 2 + 0.09]} castShadow>
            <boxGeometry args={[1.2, 1.8, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {[
        [-70, 0, 14], [-58, 0, 14], [-46, 0, 14], [-34, 0, 14], [-22, 0, 14], [-10, 0, 14], [2, 0, 14], [14, 0, 14], [26, 0, 14], [38, 0, 14], [50, 0, 14], [62, 0, 14], [74, 0, 14], [86, 0, 14],
      ].map((tree, index) => (
        <group key={`city-tree-${index}`} ref={(node) => (treeRefs.current[index] = node)} position={tree}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.24, 2.2, 8]} />
            <meshStandardMaterial color="#5b4631" roughness={0.92} />
          </mesh>
          <mesh position={[0, 2.9, 0]} castShadow>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color="#2f6d33" roughness={0.72} />
          </mesh>
        </group>
      ))}

      {[-72, -60, -48, -36, -24, -12, 0, 12, 24, 36, 48, 60, 72, 84].map((x) => (
        <mesh key={`fence-front-${x}`} position={[x, 0.45, 30]} castShadow>
          <boxGeometry args={[3.6, 0.5, 0.12]} />
          <meshStandardMaterial color="#89704a" roughness={0.92} />
        </mesh>
      ))}

      {[-78, -66, -54, -42, -30, -18, -6, 6, 18, 30, 42, 54, 66, 78, 90].map((x) => (
        <mesh key={`front-row-${x}`} position={[x, 0.05, 42]} castShadow>
          <boxGeometry args={[6.5, 0.06, 6.5]} />
          <meshStandardMaterial color={x % 40 === 0 ? '#475569' : '#4e6278'} roughness={0.78} />
        </mesh>
      ))}

      <FenceLine from={[-28, 0, -18]} to={[28, 0, -18]} color="#475569" />
      <FenceLine from={[-28, 0, 24]} to={[28, 0, 24]} color="#475569" />
      <FenceLine from={[-28, 0, -18]} to={[-28, 0, 24]} color="#475569" />
      <FenceLine from={[28, 0, -18]} to={[28, 0, 24]} color="#475569" />

      <FenceLine from={[-85, 0, -52]} to={[85, 0, -52]} color="#475569" />
      <FenceLine from={[-85, 0, 60]} to={[85, 0, 60]} color="#475569" />
      <FenceLine from={[-85, 0, -52]} to={[-85, 0, 60]} color="#475569" />
      <FenceLine from={[85, 0, -52]} to={[85, 0, 60]} color="#475569" />

      <FenceLine from={[-46, 0, -34]} to={[46, 0, -34]} color="#64748b" />
      <FenceLine from={[-46, 0, 38]} to={[46, 0, 38]} color="#64748b" />
      <FenceLine from={[-46, 0, -34]} to={[-46, 0, 38]} color="#64748b" />
      <FenceLine from={[46, 0, -34]} to={[46, 0, 38]} color="#64748b" />

      <Home position={[0, 0, 0]} nightMode={timeOfDay === 'night'} highlighted />
      <Office position={[80, 0, 0]} nightMode={timeOfDay === 'night'} highlighted />
      <Hospital />
      <Vehicle />
      <NPC />
    </group>
  );
}
