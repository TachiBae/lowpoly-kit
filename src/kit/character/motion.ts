import {Easing, spring} from 'remotion';
import type {Expression, Pose, V3} from './types';
import {gestureAt, GestureCue} from './gestures';

/** A keyframe: f = frame within the shot, v = value, ease = easing of the segment that ENDS at this key. */
export type Key<T> = {f: number; v: T; ease?: (t: number) => number};

export const EASE = {
  inOut: Easing.bezier(0.33, 0, 0.2, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.5, 0, 0.9, 0.6),
  snap: Easing.bezier(0.7, 0, 0.1, 1),
  linear: (t: number) => t,
};

const n = (a: number | undefined, d: number) => (a === undefined ? d : a);
const lv = (a: number, b: number, t: number) => a + (b - a) * t;
const lv3 = (a: V3 | undefined, b: V3 | undefined, t: number, d: V3): V3 => {
  const x = a ?? d;
  const y = b ?? d;
  return [lv(x[0], y[0], t), lv(x[1], y[1], t), lv(x[2], y[2], t)];
};

const NUM_CH = ['lean', 'turn', 'elbowL', 'elbowR', 'legL', 'legR', 'kneeL', 'kneeR', 'hips', 'shift', 'bob'] as const;
const V3_CH = ['head', 'armL', 'armR'] as const;
const ARM_DEFAULT: Record<string, V3> = {head: [0, 0, 0], armL: [0, 0, 0.12], armR: [0, 0, -0.12]};

const has = (a: Pose, b: Pose, k: string) => (a as any)[k] !== undefined || (b as any)[k] !== undefined;

/** Interpolate two poses. Numbers and V3 lerp; hand poses switch at t >= 0.5. */
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const out: any = {};
  for (const k of NUM_CH) if (has(a, b, k)) out[k] = lv(n((a as any)[k], 0), n((b as any)[k], 0), t);
  for (const k of V3_CH) if (has(a, b, k)) out[k] = lv3((a as any)[k], (b as any)[k], t, ARM_DEFAULT[k]);
  if (a.squash !== undefined || b.squash !== undefined) out.squash = lv(n(a.squash, 1), n(b.squash, 1), t);
  out.handL = t >= 0.5 ? b.handL ?? a.handL : a.handL ?? b.handL;
  out.handR = t >= 0.5 ? b.handR ?? a.handR : a.handR ?? b.handR;
  return out as Pose;
};

/** Additive layer: angles/offsets add, squash multiplies. Hand poses come from `add` when weight >= 0.5. */
export const addPose = (base: Pose, add: Pose, w = 1): Pose => {
  const out: any = {...base};
  for (const k of NUM_CH) if ((add as any)[k] !== undefined) out[k] = n((base as any)[k], 0) + (add as any)[k] * w;
  for (const k of V3_CH) {
    const ad = (add as any)[k] as V3 | undefined;
    if (ad) {
      const b0: V3 = (base as any)[k] ?? ARM_DEFAULT[k];
      out[k] = [b0[0] + ad[0] * w, b0[1] + ad[1] * w, b0[2] + ad[2] * w];
    }
  }
  if (add.squash !== undefined) out.squash = n(base.squash, 1) * (1 + (add.squash - 1) * w);
  if (w >= 0.5) {
    if (add.handL) out.handL = add.handL;
    if (add.handR) out.handR = add.handR;
  }
  return out as Pose;
};

const seg = <T,>(frame: number, keys: Key<T>[]): {a: Key<T>; b: Key<T>; t: number} | null => {
  if (!keys.length) return null;
  if (frame <= keys[0].f) return {a: keys[0], b: keys[0], t: 0};
  const last = keys[keys.length - 1];
  if (frame >= last.f) return {a: last, b: last, t: 1};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const raw = b.f === a.f ? 1 : (frame - a.f) / (b.f - a.f);
      return {a, b, t: (b.ease ?? EASE.inOut)(raw)};
    }
  }
  return {a: last, b: last, t: 1};
};

/** Pose at a frame from keys (held before the first and after the last key). */
export const poseAt = (frame: number, keys: Key<Pose>[]): Pose => {
  const s = seg(frame, keys);
  if (!s) return {};
  return lerpPose(s.a.v, s.b.v, s.t);
};

/** Expression at a frame. Numbers lerp; discrete fields switch at the key frame and a 4-frame blink hides the pop. */
export const exprAt = (frame: number, keys: Key<Expression>[]): Expression => {
  const s = seg(frame, keys);
  if (!s) return {};
  const {a, b, t} = s;
  const out: Expression = {};
  const look = (e: Expression): [number, number] => e.look ?? [0, 0];
  out.eyeScale = lv(n(a.v.eyeScale, 1), n(b.v.eyeScale, 1), t);
  out.look = [lv(look(a.v)[0], look(b.v)[0], t), lv(look(a.v)[1], look(b.v)[1], t)];
  out.blink = lv(n(a.v.blink, 0), n(b.v.blink, 0), t);
  if (a.v.mouthOpen !== undefined || b.v.mouthOpen !== undefined) out.mouthOpen = lv(n(a.v.mouthOpen, 0), n(b.v.mouthOpen, 0), t);
  const useB = frame >= b.f;
  const pick = useB ? b.v : a.v;
  out.brows = pick.brows;
  out.eyeShape = pick.eyeShape;
  out.mouth = pick.mouth;
  out.sweat = pick.sweat;
  out.blush = pick.blush;
  out.hearts = pick.hearts;
  // blink centred on each discrete switch (checked over every key pair, so the final key blinks too)
  for (let i = 1; i < keys.length; i++) {
    const p = keys[i - 1].v;
    const q = keys[i].v;
    if (p.brows !== q.brows || p.eyeShape !== q.eyeShape || p.mouth !== q.mouth) {
      const d = Math.abs(frame - keys[i].f);
      if (d < 2) out.blink = Math.max(out.blink ?? 0, 1 - d / 2);
    }
  }
  return out;
};

/** Spring from -> to starting at startFrame. Overshoot allowed (follow-through). */
export const springTo = (
  frame: number,
  startFrame: number,
  from: number,
  to: number,
  cfg: {damping?: number; stiffness?: number; mass?: number; fps?: number} = {}
): number => {
  const s = spring({
    frame: frame - startFrame,
    fps: cfg.fps ?? 30,
    config: {damping: cfg.damping ?? 12, stiffness: cfg.stiffness ?? 120, mass: cfg.mass ?? 0.6},
  });
  return from + (to - from) * s;
};


const DEF_ARM: Record<string, V3> = {armL: [0, 0, 0.12], armR: [0, 0, -0.12], head: [0, 0, 0]};
const DEF_NUM: Record<string, number> = {elbowL: 0.15, elbowR: 0.15, squash: 1};
/** Blend `base` toward `target` by w, only on channels the target defines (w may be negative for anticipation). */
export const blendPose = (base: Pose, target: Pose, w: number): Pose => {
  const o: any = {...base};
  for (const k of [...NUM_CH, 'squash'] as string[]) {
    const t = (target as any)[k];
    if (t === undefined) continue;
    const b = (base as any)[k] ?? DEF_NUM[k] ?? 0;
    o[k] = b + (t - b) * w;
  }
  for (const k of V3_CH as readonly string[]) {
    const t = (target as any)[k] as V3 | undefined;
    if (!t) continue;
    const b: V3 = (base as any)[k] ?? DEF_ARM[k];
    o[k] = [b[0] + (t[0] - b[0]) * w, b[1] + (t[1] - b[1]) * w, b[2] + (t[2] - b[2]) * w];
  }
  if (w >= 0.4) {
    if (target.handL) o.handL = target.handL;
    if (target.handR) o.handR = target.handR;
  }
  return o as Pose;
};

// ---- Act: everything a Person needs to perform (later phases fill the optional fields) ----
export type Act = {
  poseKeys?: Key<Pose>[];
  exprKeys?: Key<Expression>[];
  gestures?: GestureCue[];
  idle?: 'calm' | 'alert' | 'nervous' | 'none'; // M2
  talk?: unknown; // M5
  lookAt?: V3 | null; // M6
  walk?: WalkPath;
};

// ---- Idle life layer (M2): seeded, deterministic, additive ----
const h01 = (seed: number, i: number): number => {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(i + 1, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};

/** Piecewise-constant random target in [-1,1], eased over `ease` frames at each change. Period is fixed per call. */
const stepNoise = (frame: number, seed: number, period: number, ease: number, offset = 0): number => {
  const t = frame + offset;
  const i = Math.floor(t / period);
  const local = t - i * period;
  const cur = h01(seed, i) * 2 - 1;
  const prev = h01(seed, i - 1) * 2 - 1;
  const k = Math.min(1, local / Math.max(1, ease));
  return prev + (cur - prev) * EASE.inOut(k);
};

export type IdleLevel = 'calm' | 'alert' | 'nervous' | 'none';
const IDLE = {
  calm: {amp: 1, shift: 90, dart: 60},
  alert: {amp: 0.6, shift: 90, dart: 40},
  nervous: {amp: 1.6, shift: 40, dart: 20},
};

/** Additive idle: weight shift, head drift, arm sway, eye darts. `strength` 0..1 fades it (e.g. while a gesture plays). */
export const idleAt = (frame: number, seed: number, level: IdleLevel, strength = 1): {pose: Pose; look: [number, number]; blink: number} => {
  if (level === 'none' || strength <= 0) return {pose: {}, look: [0, 0], blink: 0};
  const c = IDLE[level];
  const a = c.amp * strength;
  const sp = c.shift + (seed % 21) - 10; // 70-110 for calm
  const shift = stepNoise(frame, seed + 11, sp, 18, seed % 37);
  const hipTurn = stepNoise(frame, seed + 12, sp, 22, seed % 37);
  const hp = 90 + (seed % 51); // head drift period 90-140
  const ph = (seed % 100) / 100;
  const w = (f: number, per: number, p = 0) => Math.sin(((f / per) + ph + p) * Math.PI * 2);
  const head: V3 = [0.04 * a * w(frame, hp), 0.03 * a * w(frame, hp * 1.3, 0.3), 0.05 * a * w(frame, hp * 0.9, 0.6)];
  const sway = 0.03 * a * w(frame, 120, 0.5);
  const dp = c.dart + (seed % 17);
  const dx = stepNoise(frame, seed + 21, dp, 2, seed % 13) * 0.35 * Math.min(1.5, a + 0.3);
  const dy = stepNoise(frame, seed + 22, dp, 2, seed % 13) * 0.2 * Math.min(1.5, a + 0.3);
  // blink on 1 dart in 3
  const di = Math.floor((frame + (seed % 13)) / dp);
  const dl = (frame + (seed % 13)) - di * dp;
  const blink = h01(seed + 23, di) < 0.34 && dl < 4 ? 1 - Math.abs(dl - 1.5) / 1.5 : 0;
  return {
    pose: {shift: 0.03 * a * shift, turn: 0.05 * a * hipTurn, head, armL: [0, 0, sway], armR: [0, 0, -sway]},
    look: [dx, dy],
    blink: Math.max(0, blink),
  };
};

// ---- Locomotion (M4) ----
/** Walk or run along a straight line. Positions are world/parent units (same space as Person `position`). */
export type WalkPath = {
  from: V3;
  to: V3;
  start: number; // frame the first step starts
  speed?: number; // units per second (walk 1.1, run 2.6)
  mode?: 'walk' | 'run';
  faceBefore?: number; // yaw before starting (default: travel direction); turns over 8 f before `start`
  faceAfter?: number; // yaw after arriving (default: travel direction); turns over 8 f after arrival
};

const GAIT = {
  walk: {speed: 1.1, stride: 0.42, knee: 0.55, stanceKnee: 0.06, lean: 0.06, arm: 1.3, elbow: 0.3, flight: 0, turn: 0.06},
  run: {speed: 2.6, stride: 0.72, knee: 1.15, stanceKnee: 0.25, lean: 0.2, arm: 1.6, elbow: 1.35, flight: 0.07, turn: 0.1},
};
const smooth = (u: number) => u * u * (3 - 2 * u);
const wrapYaw = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const lerpYaw = (a: number, b: number, t: number) => a + wrapYaw(b - a) * t;

/**
 * Gait pose for cycle phase p (0..1). The stance foot moves back linearly at exactly body speed and the body
 * drops so the stance foot touches the floor (inverted pendulum), so planted feet do not slide.
 * L = hip-to-sole length in Person units. amp fades the cycle in/out (0..1).
 */
export const gaitPose = (p: number, L: number, mode: 'walk' | 'run', amp = 1): Pose => {
  const g = GAIT[mode];
  const A = 0.55 * (L - 0.09); // thigh
  const B = L - A; // shin + shoe
  const leg = (q: number) => {
    q = ((q % 1) + 1) % 1;
    let z: number;
    let knee: number;
    let stance = false;
    if (q < 0.5) {
      const u = q / 0.5;
      z = g.stride / 2 - g.stride * u;
      knee = g.stanceKnee;
      stance = true;
    } else {
      const u = (q - 0.5) / 0.5;
      // world-space smoothstep: the foot leaves and lands with zero world velocity (relative z moves back at body speed)
      z = -g.stride / 2 + 2 * g.stride * smooth(u) - g.stride * u;
      // knee peak late in the swing so the foot clears the floor until it lands (no skate on touchdown)
      knee = g.stanceKnee + (g.knee - g.stanceKnee) * Math.sin(Math.PI * Math.pow(u, 1.8));
    }
    // solve hip angle so the FOOT (thigh + bent shin) lands at relative z (two-segment leg, Newton)
    const k = knee * amp;
    const tz = -z * amp;
    let th = Math.asin(Math.max(-0.95, Math.min(0.95, tz / L)));
    for (let i = 0; i < 4; i++) {
      const fv = A * Math.sin(th) + B * Math.sin(th + k) - tz;
      const d = A * Math.cos(th) + B * Math.cos(th + k);
      th -= fv / d;
    }
    return {th, knee: k, stance, vert: A * Math.cos(th) + B * Math.cos(th + k)};
  };
  const l = leg(p);
  const r = leg(p + 0.5);
  const st = l.stance ? l : r;
  const drop = L - st.vert;
  const flight = g.flight * Math.abs(Math.sin(2 * Math.PI * p)) * amp;
  return {
    legL: l.th,
    legR: r.th,
    kneeL: l.knee,
    kneeR: r.knee,
    bob: -drop + flight,
    lean: g.lean * amp,
    turn: g.turn * Math.sin(2 * Math.PI * p) * amp,
    armL: [-l.th * g.arm, 0, 0.12],
    armR: [-r.th * g.arm, 0, -0.12],
    elbowL: 0.15 + (g.elbow - 0.15) * amp,
    elbowR: 0.15 + (g.elbow - 0.15) * amp,
    head: [-g.lean * 0.5 * amp, 0, 0],
  };
};

/** Root position, yaw, gait pose and weight for a WalkPath at a frame. scale = Person scale. */
export const walkAt = (frame: number, w: WalkPath, L: number, scale = 1): {pos: V3; yaw: number; pose: Pose; weight: number} => {
  const mode = w.mode ?? 'walk';
  const g = GAIT[mode];
  const speed = w.speed ?? g.speed; // world units / s
  const dx = w.to[0] - w.from[0];
  const dz = w.to[2] - w.from[2];
  const D = Math.hypot(dx, dz);
  const dir = Math.atan2(dx, dz);
  const vf = speed / 30; // per frame
  const dur = D / vf;
  const t = frame - w.start;
  const T = (2 * g.stride * scale) / vf; // frames per cycle (stride is in Person units)
  const before = w.faceBefore ?? dir;
  const after = w.faceAfter ?? dir;
  if (t < 0) {
    const k = smooth(Math.max(0, Math.min(1, (t + 8) / 8)));
    return {pos: w.from, yaw: lerpYaw(before, dir, k), pose: {}, weight: 0};
  }
  if (t <= dur) {
    const k = t / Math.max(1e-6, dur);
    const amp = Math.min(1, t / 6);
    return {
      pos: [w.from[0] + dx * k, w.from[1] + (w.to[1] - w.from[1]) * k, w.from[2] + dz * k],
      yaw: dir,
      pose: gaitPose(t / T, L, mode, amp),
      weight: 1,
    };
  }
  const a = t - dur;
  const fade = 1 - smooth(Math.min(1, a / 8));
  return {pos: w.to, yaw: lerpYaw(dir, after, smooth(Math.min(1, a / 8))), pose: fade > 0 ? gaitPose(t / T, L, mode, fade) : {}, weight: fade};
};

/**
 * Crouch so the hips drop by `drop` while the feet stay planted (thigh forward, shin back).
 * L = hip-to-sole length (0.61 for build height 1).
 */
export const crouchPose = (drop: number, L = 0.61): Pose => {
  const a = Math.acos(Math.max(0.2, Math.min(1, 1 - drop / L)));
  return {hips: drop, legL: -a, legR: -a, kneeL: 2 * a, kneeR: 2 * a, lean: 0.35 * a};
};

/**
 * Seated pose for a seat whose top is at seatY (Person units, build height 1). Thighs level, shins hang.
 * Place the Person about 0.12 in front of the seat centre (toward its front edge).
 */
export const sitPose = (seatY: number, L = 0.61, legR = 0.13): Pose => ({
  hips: Math.max(0, L - (seatY + legR * 0.8)),
  legL: -1.5,
  legR: -1.5,
  kneeL: 1.45,
  kneeR: 1.45,
  lean: 0.05,
  armL: [-0.55, -0.3, 0.12],
  armR: [-0.55, 0.3, -0.12],
  elbowL: 0.7,
  elbowR: 0.7,
});

/**
 * Evaluate an Act for one frame on top of the static pose/expression.
 * Order: poseKeys (base) -> walk -> gestures (blend) -> secondary (head lag, hair bounce, hands) -> idle (additive).
 * dims.L = hip-to-sole length, dims.scale = Person scale (for walk speed).
 */
export const applyAct = (
  frame: number,
  act: Act,
  pose: Pose,
  expression: Expression,
  seed: number,
  dims: {L: number; scale: number} = {L: 0.61, scale: 1}
): {pose: Pose; expression: Expression; headSquash: number; phone: 'L' | 'R' | null; root: {pos: V3; yaw: number} | null} => {
  const core = (f: number) => {
    let p: Pose = {...pose, ...(act.poseKeys?.length ? poseAt(f, act.poseKeys) : {})};
    let e: Expression = {...expression, ...(act.exprKeys?.length ? exprAt(f, act.exprKeys) : {})};
    let gw = 0;
    let phone: 'L' | 'R' | null = null;
    let root: {pos: V3; yaw: number} | null = null;
    if (act.walk) {
      const w = walkAt(f, act.walk, dims.L, dims.scale);
      root = {pos: w.pos, yaw: w.yaw};
      if (w.weight > 0) p = blendPose(p, w.pose, w.weight);
      gw = Math.max(gw, w.weight);
    }
    for (const cue of act.gestures ?? []) {
      const g = gestureAt(f, cue);
      if (g.weight === 0) continue;
      p = blendPose(p, g.pose, g.weight);
      if (cue.g === 'phoneLook' && g.weight > 0.35) phone = cue.side === 'L' ? 'L' : 'R';
      gw = Math.max(gw, Math.min(1, Math.abs(g.weight)));
      if (g.expr && g.weight > 0.3) {
        const k = Math.min(1, g.weight);
        const Lk = g.expr.look;
        e = {...e, ...g.expr, look: Lk ? [(e.look?.[0] ?? 0) + (Lk[0] - (e.look?.[0] ?? 0)) * k, (e.look?.[1] ?? 0) + (Lk[1] - (e.look?.[1] ?? 0)) * k] : e.look};
      }
    }
    return {p, e, gw, phone, root};
  };
  const c = core(frame);
  const c1 = core(frame - 1);
  const c3 = core(frame - 3);
  let p = c.p;
  let e = c.e;
  // head lags body turn / lean by 3 frames
  p = addPose(p, {head: [((c3.p.lean ?? 0) - (p.lean ?? 0)) * 0.8, ((c3.p.turn ?? 0) - (p.turn ?? 0)) * 1.0 + wrapYaw((c3.root?.yaw ?? 0) - (c.root?.yaw ?? 0)) * 0.8, 0]}, 1);
  // hair/hat bounce from vertical velocity
  const dBob = ((p.bob ?? 0) - (p.hips ?? 0)) - ((c1.p.bob ?? 0) - (c1.p.hips ?? 0));
  const headSquash = 1 + Math.max(-0.045, Math.min(0.045, dBob * 2.5));
  // relaxed hands open slightly during fast arm moves
  const speed = (a: V3 | undefined, b: V3 | undefined) => (a && b ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : 0);
  if ((!p.handL || p.handL === 'relaxed') && speed(p.armL, c1.p.armL) > 0.12) p = {...p, handL: 'open'};
  if ((!p.handR || p.handR === 'relaxed') && speed(p.armR, c1.p.armR) > 0.12) p = {...p, handR: 'open'};
  const idle = idleAt(frame, seed, act.idle ?? 'calm', 1 - c.gw * 0.7);
  p = addPose(p, idle.pose, 1);
  const look: [number, number] = e.look ?? [0, 0];
  e = {
    ...e,
    look: [Math.max(-1, Math.min(1, look[0] + idle.look[0])), Math.max(-1, Math.min(1, look[1] + idle.look[1]))],
    blink: Math.max(e.blink ?? 0, idle.blink),
  };
  return {pose: p, expression: e, headSquash, phone: c.phone, root: c.root};
};
