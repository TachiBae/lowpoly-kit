import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage} from '../Stage';
import {PresetId, presets} from '../lighting';
import {Person} from '../character/Person';
import type {PersonSpec} from '../character/types';
import {Edge} from '../look';
import {Cam, basis, faceCamYaw, flat} from '../frame';
import {Backdrop} from './Backdrop';
import {Foreground} from './Foreground';
import {GroundDressing} from './GroundDressing';
import {FG_SIDES, RecipeId, recipes} from './recipes';
import {SettingId} from './settings';

type V3 = [number, number, number];

export type ShotOverrides = {
  fg?: false;
  backdrop?: false;
  ground?: false;
  cam?: Partial<Cam>;
  fgD?: number;
};

/**
 * One call builds a v2 shot with three layers (background, mid-ground/ground, foreground).
 * Pass consecutive `shotIndex` values so neighbouring shots use different foreground sides and seeds.
 * `subject` = where the subject stands on the ground. `angle` = camera orbit (radians, 0 = camera on +z).
 * Children = your characters/props. For overShoulder pass `shoulder` (the person we look past).
 * insert: set `propY` = height of the prop being shown.
 */
export const ShotScene: React.FC<{
  recipe: RecipeId;
  setting: SettingId;
  seed?: number;
  shotIndex?: number;
  subject?: V3;
  duration: number;
  preset?: PresetId;
  edge?: Edge;
  angle?: number;
  propY?: number;
  shoulder?: PersonSpec;
  /** Half-width of the subject group along camera-right (2 people side by side ~1.7). Props keep clear of it. */
  clear?: number;
  overrides?: ShotOverrides;
  children?: React.ReactNode;
}> = ({recipe, setting, seed = 1, shotIndex = 0, subject = [0, 0, 0], duration, preset = 'sunnyDay', edge = 'soft', angle = 0, propY = 1, shoulder, clear = 0.8, overrides = {}, children}) => {
  const R = recipes[recipe];
  const P = presets[preset];
  const camY = recipe === 'insert' ? propY + R.camY : R.camY;
  const targetY = recipe === 'insert' ? propY : R.targetY;
  const {from, to, subjectU} = useMemo(() => {
    const pos: V3 = [subject[0] + Math.sin(angle) * R.dist, camY, subject[2] + Math.cos(angle) * R.dist];
    const f: Cam = {pos, target: [subject[0], targetY, subject[2]], fov: R.fov, ...overrides.cam};
    const b = basis(f);
    const dir = new THREE.Vector3(...f.target).sub(b.p);
    const push = dir.clone().multiplyScalar(0.05).add(b.right.clone().multiplyScalar(0.15));
    const t: Cam = {...f, pos: [f.pos[0] + push.x, f.pos[1], f.pos[2] + push.z]};
    // subject head screen x (-1..1) for the foreground side guard
    const head = new THREE.Vector3(subject[0], 1.85, subject[2]).sub(b.p);
    const depth = head.dot(b.fwd);
    const u = depth > 0.1 ? head.dot(b.right) / (depth * Math.tan(THREE.MathUtils.degToRad(R.fov / 2)) * (1080 / 1920)) : 0;
    return {from: f, to: t, subjectU: u};
  }, [subject[0], subject[1], subject[2], angle, camY, targetY, R.dist, R.fov, JSON.stringify(overrides.cam)]);

  const side = FG_SIDES[(shotIndex + seed) % 4];
  const fgSeed = seed * 31 + shotIndex;
  const {f: fwd, r: rgt} = flat(from);
  // shoulder person: 2.1 units toward the camera from the subject, 0.7 to the left, facing the subject
  const shP: V3 = [subject[0] - fwd.x * 2.1 - rgt.x * 0.7, 0, subject[2] - fwd.z * 2.1 - rgt.z * 0.7];
  const shYaw = Math.atan2(subject[0] - shP[0], subject[2] - shP[2]);

  return (
    <Stage edge={edge} duration={duration} from={from} to={to} preset={P} lightTarget={[subject[0], 1.2, subject[2]]} focus={[subject[0], targetY, subject[2]]} focusRange={R.focusRange} blur={R.blur}>
      {overrides.backdrop !== false && <Backdrop setting={setting} cam={from} seed={seed} skyHorizon={P.skyHorizon} subject={subject} avoidR={clear + 2.5} />}
      {overrides.ground !== false && <GroundDressing setting={setting} cam={from} subject={subject} seed={seed} clear={clear} density={recipe === 'wide' ? 0.8 : 1} night={preset === 'blueHour'} />}
      {children}
      {recipe === 'overShoulder' && shoulder && <Person spec={shoulder} position={shP} rotation={[0, shYaw, 0]} />}
      {overrides.fg !== false && R.fg !== 'none' && (
        <Foreground setting={setting} cam={from} strength={R.fg} side={side} seed={fgSeed} d={overrides.fgD ?? R.fgD} subjectU={subjectU} />
      )}
    </Stage>
  );
};
