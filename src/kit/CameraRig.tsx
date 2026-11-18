import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

type V3 = [number, number, number];

/**
 * Places the camera every frame. Interpolate position/target/fov from the
 * shot's start to end values with useCurrentFrame() in the parent.
 * roll = dutch tilt in radians.
 */
export const CameraRig: React.FC<{position: V3; target: V3; fov?: number; roll?: number}> = ({
  position,
  target,
  fov = 40,
  roll = 0,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...target);
    camera.rotateZ(roll);
    camera.fov = fov;
    camera.near = 0.1;
    camera.far = 200;
    camera.updateProjectionMatrix();
  });
  return null;
};

/** Lerp two vectors. */
export const mixV = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
