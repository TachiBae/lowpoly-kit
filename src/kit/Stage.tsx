import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {CameraRig, mixV} from './CameraRig';
import {LightPreset, LightRig} from './lighting';
import {PostFX} from './PostFX';
import {EdgeContext, LookContext, useEdge, useLook} from './look';
import type {Edge} from './look';

type V3 = [number, number, number];

export type CamKey = {pos: V3; target: V3; fov?: number; roll?: number};

/**
 * One 3D shot: canvas + camera move + light rig + post FX.
 * The camera eases from `from` to `to` over `duration` frames (the shot length).
 */
export const Stage: React.FC<{
  duration: number;
  from: CamKey;
  to?: CamKey;
  ease?: 'inOut' | 'out' | 'linear';
  preset: LightPreset;
  lightTarget: V3;
  faceFrom?: V3;
  focus: V3;
  focusRange?: number;
  blur?: number;
  shake?: number; // camera shake amplitude (stamps, impacts)
  dolly?: number; // >1 pulls the camera back along its view line (framing tweak)
  /** v2 only: film grain amount (0 = off). */
  grain?: number;
  /** v2 only: edge style for this stage (default: from context, else 'clean'). */
  edge?: Edge;
  children: React.ReactNode;
}> = ({duration, from, to = from, ease = 'inOut', preset, lightTarget, faceFrom, focus, focusRange = 3, blur = 4, shake = 0, dolly = 1, grain = 0, edge: edgeProp, children}) => {
  const edgeCtx = useEdge();
  const edge = edgeProp ?? edgeCtx;
  const f = useCurrentFrame();
  const look = useLook();
  const {width, height} = useVideoConfig();
  const easing = ease === 'linear' ? Easing.linear : ease === 'out' ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic);
  const t = interpolate(f, [0, Math.max(1, duration - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
  const jitter: V3 = shake ? [Math.sin(f * 2.1) * shake, Math.cos(f * 2.7) * shake, 0] : [0, 0, 0];
  const tgt = mixV(from.target, to.target, t);
  const raw = mixV(from.pos, to.pos, t);
  const pos: V3 = [tgt[0] + (raw[0] - tgt[0]) * dolly, tgt[1] + (raw[1] - tgt[1]) * dolly, tgt[2] + (raw[2] - tgt[2]) * dolly];
  return (
    <AbsoluteFill style={{backgroundColor: preset.skyTop}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
        <CameraRig
          position={[pos[0] + jitter[0], pos[1] + jitter[1], pos[2]]}
          target={tgt}
          fov={(from.fov ?? 40) + ((to.fov ?? from.fov ?? 40) - (from.fov ?? 40)) * t}
          roll={(from.roll ?? 0) + ((to.roll ?? from.roll ?? 0) - (from.roll ?? 0)) * t}
        />
        <LookContext.Provider value={look}><EdgeContext.Provider value={edge}>
          <LightRig preset={preset} target={lightTarget} faceFrom={faceFrom} look={look} />
          {children}
        </EdgeContext.Provider></LookContext.Provider>
        <PostFX focus={focus} focusRange={focusRange} blur={blur} bloom={preset.bloom} vignette={preset.vignette} look={look} v2={preset.v2} frame={f} grain={grain} edge={edge} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** 0→1 eased ramp between two local frames. */
export const ramp = (f: number, a: number, b: number, e: 'inOut' | 'out' | 'in' = 'inOut') =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: e === 'out' ? Easing.out(Easing.cubic) : e === 'in' ? Easing.in(Easing.cubic) : Easing.inOut(Easing.cubic),
  });

/** Overshooting pop 0→1 (for stamps, badges, sparkles). */
export const pop = (f: number, start: number, len = 8) => {
  const t = Math.max(0, Math.min(1, (f - start) / len));
  if (t <= 0) return 0;
  return Easing.out(Easing.back(2.2))(t);
};

/**
 * Squash-and-stretch pop: returns a [x, y, z] scale. Stretches tall as it appears,
 * squashes wide on landing, settles to 1 — volume stays roughly constant.
 * Use as scale={squashPop(f, start)} on tags, labels, icons.
 */
export const squashPop = (f: number, start: number, len = 10): [number, number, number] => {
  const t = (f - start) / len;
  if (t <= 0) return [0, 0, 0];
  if (t >= 1.6) return [1, 1, 1];
  const grow = Math.min(1, Easing.out(Easing.back(1.8))(Math.min(1, t)));
  // stretch while growing, squash just after, then a damped wobble back to 1
  const wob = t < 1 ? 0.22 * Math.sin(t * Math.PI) : -0.12 * Math.sin((t - 1) * Math.PI * 1.7) * (1.6 - t) / 0.6;
  const sy = grow * (1 + wob);
  const sx = grow / Math.sqrt(1 + wob);
  return [sx, sy, sx];
};
