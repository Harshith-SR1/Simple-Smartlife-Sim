import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const VIEW_PRESETS = {
  iso: [120, 140, 120],
  top: [0, 260, 0.01],
  front: [0, 110, 250],
  back: [0, 110, -250],
  left: [-250, 110, 0],
  right: [250, 110, 0],
};

export default function CameraController({
  agentPositionRef,
  directionRef,
  cameraMode = 'free',
  cameraView = 'iso',
  sceneState = 'WORLD',
  currentTask = 'daily_survival',
  isMoving = false,
}) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const firstPersonOffset = useMemo(() => new THREE.Vector3(0, 1.55, 0), []);


  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const inInterior = String(sceneState).endsWith('_INTERIOR');

    if (inInterior) {
      controls.enabled = false;
      controls.minDistance = 4;
      controls.maxDistance = 30;
      controls.target.set(0, 1.2, 0);
      camera.position.set(0, 6.6, 9.8);
      camera.lookAt(0, 1.2, 0);
      controls.update();
      return;
    }

    controls.minDistance = 2;
    controls.maxDistance = 1200;

    if (cameraMode === 'agent-eye') {
      controls.enabled = false;
      return;
    }

    controls.enabled = true;

    if (cameraMode === 'free' && cameraView && VIEW_PRESETS[cameraView]) {
      const [x, y, z] = VIEW_PRESETS[cameraView];
      camera.position.set(x, y, z);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [camera, cameraMode, cameraView, sceneState]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const inInterior = String(sceneState).endsWith('_INTERIOR');

    if (inInterior) {
      controls.enabled = false;
      camera.position.set(0, 6.6, 9.8);
      camera.lookAt(0, 1.2, 0);
      return;
    }

    if (cameraMode === 'agent-eye') {
      const position = agentPositionRef?.current || [0, 0, 0];
      const direction = directionRef?.current || new THREE.Vector3(0, 0, 1);
      const dir = direction.clone ? direction.clone() : new THREE.Vector3(direction.x || 0, 0, direction.z || 1);
      if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1);
      dir.normalize();

      const eye = new THREE.Vector3(position[0], position[1], position[2]).add(firstPersonOffset);
      camera.position.lerp(eye, 0.22);

      const lookAt = eye.clone().add(dir.multiplyScalar(8));
      lookAt.y = eye.y + 0.15;
      camera.lookAt(lookAt);
      return;
    }

    if (cameraMode === 'agent-follow' || (isMoving && agentPositionRef?.current)) {
      const [x, y, z] = agentPositionRef.current;
      const followTarget = new THREE.Vector3(x, y - 1.2, z);
      const followCamera = new THREE.Vector3(x + 22, y + 20, z + 22);
      controls.target.lerp(followTarget, 0.1);
      camera.position.lerp(followCamera, 0.08);
      controls.update();
      return;
    }

    if (cameraMode === 'free') {
      if (currentTask === 'daily_survival') {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        camera.position.lerp(new THREE.Vector3(60, 70, 60), 0.05);
      } else if (currentTask === 'career_growth') {
        controls.target.lerp(new THREE.Vector3(80, 0, 0), 0.05);
        camera.position.lerp(new THREE.Vector3(120, 90, 80), 0.05);
      } else if (currentTask === 'agri_sustainability') {
        controls.target.lerp(new THREE.Vector3(0, 0, -110), 0.05);
        camera.position.lerp(new THREE.Vector3(60, 100, -60), 0.05);
      }
      controls.update();
    }
  }, [cameraMode, sceneState, firstPersonOffset, agentPositionRef, directionRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.08}
      screenSpacePanning={true}
      zoomToCursor={true}
      minDistance={2}
      maxDistance={1200}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2.05}
      makeDefault
    />
  );
}
