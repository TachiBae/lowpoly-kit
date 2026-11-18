import * as THREE from 'three';

type V3 = [number, number, number];
export type Cam = {pos: V3; target: V3; fov: number};
export const ASPECT = 1080 / 1920;

export const basis = (c: Cam) => {
  const p = new THREE.Vector3(...c.pos);
  const fwd = new THREE.Vector3(...c.target).sub(p).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
  return {p, fwd, right, up};
};

/** Half width / height of the visible area at distance d along the view axis. */
export const half = (c: Cam, d: number) => {
  const halfH = d * Math.tan(THREE.MathUtils.degToRad(c.fov / 2));
  return {halfW: halfH * ASPECT, halfH};
};

/** u,v in [-1,1] (screen: -1 left/bottom, +1 right/top) at distance d along the view axis. */
export const screenToWorld = (c: Cam, u: number, v: number, d: number): V3 => {
  const {p, fwd, right, up} = basis(c);
  const {halfW, halfH} = half(c, d);
  const w = p.clone().addScaledVector(fwd, d).addScaledVector(right, u * halfW).addScaledVector(up, v * halfH);
  return [w.x, w.y, w.z];
};

/** Where the ray through (u,v) hits the plane y = groundY; null if it goes up. */
export const screenToGround = (c: Cam, u: number, v: number, groundY = 0): V3 | null => {
  const a = new THREE.Vector3(...c.pos);
  const dir = new THREE.Vector3(...screenToWorld(c, u, v, 1)).sub(a);
  if (dir.y >= -1e-4) return null;
  const t = (groundY - a.y) / dir.y;
  const g = a.clone().addScaledVector(dir, t);
  return [g.x, g.y, g.z];
};

/** Camera yaw (rotation.y) that makes a +z-facing object face the camera. */
export const faceCamYaw = (c: Cam, at: V3) => Math.atan2(c.pos[0] - at[0], c.pos[2] - at[2]);

/** Flattened (y=0) forward and right unit vectors of the camera. */
export const flat = (c: Cam) => {
  const {fwd, right} = basis(c);
  const f = new THREE.Vector3(fwd.x, 0, fwd.z).normalize();
  const r = new THREE.Vector3(right.x, 0, right.z).normalize();
  return {f, r};
};

/** Seeded random (LCG), deterministic. */
export const lcg = (seed: number) => {
  let s = Math.floor(seed * 9301 + 49297) % 233280;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** World point -> screen [u, v] (-1..1) and depth along the view axis. */
export const worldToScreen = (c: Cam, w: V3): [number, number, number] => {
  const {p, fwd, right, up} = basis(c);
  const d = new THREE.Vector3(...w).sub(p);
  const depth = d.dot(fwd);
  if (depth <= 1e-3) return [0, 0, depth];
  const {halfW, halfH} = half(c, depth);
  return [d.dot(right) / halfW, d.dot(up) / halfH, depth];
};

/** Local frame around a subject: dx along camera-right, dz away from the camera (+ = behind the subject). */
export const localAround = (c: Cam, subject: V3) => {
  const {f, r} = flat(c);
  const at = (dx: number, dz: number): V3 => [subject[0] + r.x * dx + f.x * dz, 0, subject[2] + r.z * dx + f.z * dz];
  /** rotation.y that makes local +x run along camera-right (for strips, rows). */
  const rowYaw = Math.atan2(-r.z, r.x);
  /** rotation.y that makes a +z-facing model face the camera, square to the row. */
  const faceYaw = Math.atan2(-f.x, -f.z);
  return {at, rowYaw, faceYaw};
};
