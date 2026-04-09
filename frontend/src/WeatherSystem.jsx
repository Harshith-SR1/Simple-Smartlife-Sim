import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function WeatherSystem({ weather = 'sunny', season = 'summer' }) {
  const rainRef = useRef();
  const cloudRefs = useRef([]);

  const normalizedWeather = weather === 'rain' ? 'rainy' : weather;
  const rainCount = normalizedWeather === 'rainy' ? 120 : 0;

  const rainGeometry = useMemo(() => new THREE.CylinderGeometry(0.01, 0.01, 0.55, 6), []);
  const rainMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8fd3ff', transparent: true, opacity: 0.55 }),
    [],
  );

  const rainPositions = useMemo(
    () => Array.from({ length: rainCount }, () => [
      (Math.random() - 0.5) * 90,
      Math.random() * 30 + 8,
      (Math.random() - 0.5) * 95,
    ]),
    [rainCount],
  );

  useEffect(() => {
    if (!rainRef.current) return;
    const matrix = new THREE.Matrix4();
    rainPositions.forEach((pos, index) => {
      matrix.compose(
        new THREE.Vector3(pos[0], pos[1], pos[2]),
        new THREE.Quaternion(),
        new THREE.Vector3(1, 1, 1),
      );
      rainRef.current.setMatrixAt(index, matrix);
    });
    rainRef.current.instanceMatrix.needsUpdate = true;
  }, [rainPositions]);

  useFrame((state, delta) => {
    cloudRefs.current.forEach((cloud, index) => {
      if (!cloud) return;
      cloud.position.x += Math.sin(state.clock.elapsedTime * 0.08 + index) * 0.0025;
      cloud.position.z += Math.cos(state.clock.elapsedTime * 0.06 + index) * 0.002;
    });

    if (rainRef.current && rainCount > 0) {
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      for (let index = 0; index < rainCount; index += 1) {
        rainRef.current.getMatrixAt(index, matrix);
        matrix.decompose(position, quaternion, scale);
        position.y -= delta * 22;
        if (position.y < 0) {
          position.y = 35;
        }
        matrix.compose(position, quaternion, scale);
        rainRef.current.setMatrixAt(index, matrix);
      }
      rainRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const cloudOpacity = normalizedWeather === 'rainy' ? 0.95 : normalizedWeather === 'cloudy' ? 0.75 : 0.35;
  const hazeColor = season === 'winter' ? '#d9e2ec' : season === 'monsoon' ? '#7fa3b7' : '#f3f7fb';

  return (
    <group>
      {[
        [-16, 18, 2, 10],
        [8, 20, -6, 12],
        [20, 16, -22, 8],
        [-10, 22, -44, 11],
      ].map((cloud, index) => (
        <group key={`cloud-${index}`} ref={(node) => (cloudRefs.current[index] = node)} position={cloud.slice(0, 3)}>
          <mesh position={[-cloud[3] * 0.4, 0, 0]}>
            <sphereGeometry args={[cloud[3] * 0.7, 14, 14]} />
            <meshStandardMaterial color={hazeColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[0, 0.8, 0.8]}>
            <sphereGeometry args={[cloud[3], 18, 18]} />
            <meshStandardMaterial color={hazeColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[cloud[3] * 0.42, 0.2, -0.4]}>
            <sphereGeometry args={[cloud[3] * 0.65, 14, 14]} />
            <meshStandardMaterial color={hazeColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
        </group>
      ))}

      {rainCount > 0 && <instancedMesh ref={rainRef} args={[rainGeometry, rainMaterial, rainCount]} />}
    </group>
  );
}
