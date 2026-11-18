import {Easing} from 'remotion';
import type {Expression, Pose, V3} from './types';

export type GestureId =
  | 'wave' | 'nod' | 'shake' | 'shrug' | 'point' | 'thumbsUp' | 'facepalm' | 'cheer' | 'crossArms' | 'thinkChin'
  | 'clap' | 'typing' | 'phoneLook' | 'presentLeft' | 'presentRight' | 'gasp' | 'lean' | 'headScratch' | 'fistPump' | 'beat' | 'hop';

export type GestureCue = {g: GestureId; at: number; dur?: number; side?: 'L' | 'R'; strength?: number; loops?: number};

const out = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.33, 0, 0.2, 1);
const TAU = Math.PI * 2;
const sin = (f: number, period: number) => Math.sin((f / period) * TAU);

type Def = {
  dur: number;
  attack?: number; // frames to reach the pose
  release?: number;
  anticip?: number; // anticipation depth (negative overshoot of the weight)
  pose: (f: number, loops: number) => Pose; // f = frames since the gesture hit its pose (>= 0)
  expr?: Expression;
};

const arms = (l: V3, r: V3) => ({armL: l, armR: r});

const DEFS: Record<GestureId, Def> = {
  wave: {dur: 36, attack: 8, pose: (f) => ({armL: [0, 0, 2.05 + 0.08 * sin(f, 12)], elbowL: 0.5 + 0.28 * sin(f, 12), handL: 'wave'})},
  nod: {dur: 20, attack: 2, release: 4, anticip: 0, pose: (f) => {
    const k = f < 16 ? Math.max(0, Math.sin((f / 8) * Math.PI)) : 0;
    return {head: [0.32 * k, 0, 0], lean: 0.035 * k};
  }},
  shake: {dur: 24, attack: 3, release: 4, anticip: 0, pose: (f) => ({head: [0, 0.3 * sin(f, 12), 0]})},
  shrug: {dur: 24, attack: 7, pose: () => ({...arms([0, 0, 0.9], [0, 0, -0.9]), elbowL: 0.9, elbowR: 0.9, handL: 'open', handR: 'open', bob: 0.04, head: [0, 0, 0.12]})},
  point: {dur: 30, attack: 8, pose: () => ({armL: [-0.35, 0, 1.4], elbowL: 0.05, handL: 'point', turn: 0.15})},
  thumbsUp: {dur: 26, attack: 8, pose: (f) => ({armL: [-1.0, 0, 0.3], elbowL: 1.2, handL: 'thumbsUp', bob: 0.035 * Math.max(0, 1 - Math.abs(f - 2) / 4)})},
  facepalm: {dur: 30, attack: 10, pose: () => ({armL: [-1.8, 0, 0.15], elbowL: 2.0, handL: 'open', lean: 0.12, head: [0.25, 0, 0]})},
  cheer: {
    dur: 30,
    attack: 6,
    pose: (f) => {
      const air = Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - 2) / 14)) * Math.PI));
      return {...arms([0, 0, 2.7], [0, 0, -2.7]), handL: 'fist', handR: 'fist', bob: 0.12 * air, squash: 1 + 0.06 * air - (f < 2 || (f > 14 && f < 18) ? 0.08 : 0)};
    },
  },
  crossArms: {dur: 24, attack: 9, pose: () => ({armL: [-0.85, -1.2, -0.2], armR: [-0.72, 1.2, 0.2], elbowL: 1.1, elbowR: 1.18, handL: 'fist', handR: 'fist', lean: -0.03, head: [-0.05, 0, 0.05]})},
  thinkChin: {dur: 36, attack: 10, pose: () => ({armL: [-1.5, 0, 0.35], elbowL: 2.1, handL: 'fist', head: [0, 0, 0.1]}), expr: {look: [0.4, 0.6], mouth: 'small', brows: 'skeptical'}},
  clap: {
    dur: 26,
    attack: 6,
    pose: (f) => {
      const c = 0.5 - 0.5 * Math.cos((f / 8) * TAU); // 0 apart .. 1 together
      const L: V3 = [-0.3 - 1.1 * c, -0.7 - 0.8 * c, 0.4 - 0.7 * c];
      return {armL: L, armR: [L[0], -L[1], -L[2]], elbowL: 1.6 - 0.3 * c, elbowR: 1.6 - 0.3 * c, handL: 'open', handR: 'open', bob: 0.012 * c};
    },
  },
  typing: {dur: 36, attack: 8, pose: (f) => ({armL: [-0.7, -1.0, -0.1], armR: [-0.7, 1.0, 0.1], elbowL: 0.6 + 0.09 * Math.max(0, sin(f, 6)), elbowR: 0.6 + 0.09 * Math.max(0, -sin(f, 6)), handL: 'relaxed', handR: 'relaxed', head: [0.15, 0, 0]}), expr: {look: [0, -0.5]}},
  phoneLook: {dur: 36, attack: 9, pose: () => ({armR: [-0.3, 1.1, -0.6], elbowR: 1.5, handR: 'fist', head: [0.45, 0.12, 0], lean: 0.05}), expr: {look: [0, -0.6]}},
  presentLeft: {dur: 24, attack: 8, pose: () => ({armL: [-0.3, 0, 1.2], elbowL: 0.2, handL: 'open', turn: 0.2, head: [0, -0.2, 0]})},
  presentRight: {dur: 24, attack: 8, pose: () => ({armR: [-0.3, 0, -1.2], elbowR: 0.2, handR: 'open', turn: -0.2, head: [0, 0.2, 0]})},
  gasp: {dur: 16, attack: 4, pose: () => ({...arms([-1.6, 0, 0.4], [-1.6, 0, -0.4]), elbowL: 2.2, elbowR: 2.2, handL: 'open', handR: 'open', lean: -0.08}), expr: {eyeScale: 1.35, mouth: 'o', brows: 'raised'}},
  lean: {dur: 20, attack: 8, pose: () => ({lean: 0.2, head: [0.1, 0, 0]})},
  headScratch: {dur: 30, attack: 8, pose: (f) => ({armL: [-0.8, 0, 2.4], elbowL: 1.6 + 0.05 * sin(f, 4), handL: 'relaxed'})},
  fistPump: {dur: 18, attack: 5, pose: (f) => ({armL: [-0.5, 0, 0.4], elbowL: f < 5 ? 2.0 : 1.2, handL: 'fist', bob: f >= 5 && f < 9 ? 0.03 : 0})},
  beat: {dur: 12, attack: 3, release: 4, anticip: 0, pose: (f) => {
    const k = Math.sin((Math.min(f, 9) / 9) * Math.PI);
    return {armL: [-0.35, -0.2, 0.15], elbowL: 0.45 + 0.55 * k, handL: 'open', head: [0.07 * k, 0, 0]};
  }},
  hop: {
    dur: 24,
    attack: 1,
    release: 4,
    anticip: 0,
    pose: (f) => {
      // crouch 0-4, air 4-14 (arc 0.35), land 14-19, settle
      const crouch = (d: number, L = 0.61): Pose => {
        const a = Math.acos(Math.max(0.2, 1 - d / L));
        return {hips: d, legL: -a, legR: -a, kneeL: 2 * a, kneeR: 2 * a};
      };
      if (f < 4) return {...crouch(0.08 * inOut(f / 4)), squash: 1 - 0.08 * (f / 4), ...arms([0.3, 0, 0.2], [0.3, 0, -0.2])};
      if (f < 14) {
        const u = (f - 4) / 10;
        return {hips: 0, bob: 0.35 * Math.sin(Math.PI * u), legL: -0.25, legR: -0.25, kneeL: 0.5, kneeR: 0.5, squash: 1.06 - 0.06 * u, ...arms([-0.2, 0, 0.7], [-0.2, 0, -0.7])};
      }
      const u = Math.min(1, (f - 14) / 5);
      const d = 0.09 * Math.sin(Math.PI * Math.min(1, u * 1.2));
      return {...crouch(d), bob: 0, squash: 1 - 0.12 * Math.sin(Math.PI * u), ...arms([0.15, 0, 0.3], [0.15, 0, -0.3])};
    },
  },
};

/** Swap left/right channels (for side:'R' on arm gestures defined on the left). */
export const mirrorPose = (p: Pose): Pose => {
  const o: any = {...p};
  const sw = (a: string, b: string) => {
    const t = o[a];
    o[a] = o[b];
    o[b] = t;
    if (o[a] === undefined) delete o[a];
    if (o[b] === undefined) delete o[b];
  };
  sw('armL', 'armR');
  sw('elbowL', 'elbowR');
  sw('handL', 'handR');
  sw('legL', 'legR');
  sw('kneeL', 'kneeR');
  for (const k of ['armL', 'armR'] as const) if (o[k]) o[k] = [o[k][0], -o[k][1], -o[k][2]];
  if (o.head) o.head = [o.head[0], -o.head[1], -o.head[2]];
  if (o.turn !== undefined) o.turn = -o.turn;
  return o as Pose;
};

const TWO_SIDED: GestureId[] = ['hop', 'shrug', 'cheer', 'crossArms', 'clap', 'typing', 'gasp', 'lean', 'nod', 'shake', 'presentLeft', 'presentRight'];

/** Weight envelope: small anticipation dip, fast attack, hold, soft release. Returns 0 outside [at, at+dur]. */
const envelope = (f: number, d: Def, dur: number): number => {
  if (f < 0 || f > dur) return 0;
  const ant = d.anticip === undefined ? 0.1 : d.anticip;
  const antF = ant > 0 ? 3 : 0;
  const atk = d.attack ?? 8;
  const rel = d.release ?? 7;
  let w: number;
  if (f < antF) w = -ant * inOut(f / antF);
  else if (f < antF + atk) w = -ant + (1 + ant) * out((f - antF) / atk);
  else w = 1;
  if (f > dur - rel) w *= 1 - inOut((f - (dur - rel)) / rel);
  return w;
};

/** Evaluate one gesture cue at a frame. `weight` blends the returned absolute target pose over the base pose. */
export const gestureAt = (frame: number, cue: GestureCue): {pose: Pose; expr?: Expression; weight: number} => {
  const d = DEFS[cue.g];
  const dur = Math.round((cue.dur ?? d.dur) * (cue.loops && cue.loops > 0 ? 1 : 1));
  const f = frame - cue.at;
  const weight = envelope(f, d, dur) * (cue.strength ?? 1);
  if (weight === 0 && (f < 0 || f > dur)) return {pose: {}, weight: 0};
  const atkEnd = (d.anticip === 0 ? 0 : 3) + (d.attack ?? 8);
  let pose = d.pose(Math.max(0, f - (d.anticip === 0 ? 0 : 3)), cue.loops ?? 2);
  const flip = cue.side === 'R' && !TWO_SIDED.includes(cue.g) && cue.g !== 'presentRight' && cue.g !== 'phoneLook';
  const flipPhone = cue.g === 'phoneLook' && cue.side === 'L';
  if (flip || flipPhone) pose = mirrorPose(pose);
  // clamp: forearms must clear the belly
  for (const [a, e] of [['armL', 'elbowL'], ['armR', 'elbowR']] as const) {
    const arm = (pose as any)[a] as V3 | undefined;
    const el = (pose as any)[e] as number | undefined;
    if (arm && el !== undefined && el > 1.5) (pose as any)[a] = [arm[0], arm[1], Math.sign(arm[2] || 1) * Math.max(0.15, Math.abs(arm[2]))];
  }
  void atkEnd;
  return {pose, expr: d.expr, weight};
};

export const GESTURE_IDS = Object.keys(DEFS) as GestureId[];
export const gestureDuration = (g: GestureId) => DEFS[g].dur;
