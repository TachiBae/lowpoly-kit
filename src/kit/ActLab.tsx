import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions} from './character/acting';
import type {Act} from './character/motion';
import {FBox} from './lowpoly';
import {Asset} from './props/Asset';
import {sitPose, EASE} from './character/motion';
import {interpolate, useCurrentFrame} from 'remotion';

/** Motion lab (1080x1920). Scene A (90 f): idle levels, calm / alert / nervous. Later phases append scenes. */
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;

const SCENE_A = 90;
const SCENE_C = 150;
export const ACTLAB_FRAMES = SCENE_A + SCENE_C;

const Floor = () => <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />;

const IdleScene: React.FC = () => {
  const row: {n: string; idle: Act['idle']; e: any}[] = [
    {n: 'scientist', idle: 'calm', e: ex.neutral ?? {}},
    {n: 'student', idle: 'alert', e: ex.happy ?? {}},
    {n: 'officer', idle: 'nervous', e: ex.worried ?? ex.sad ?? {}},
  ];
  return (
    <Stage duration={SCENE_A} from={{pos: [0, 1.7, 13.5], target: [0, 1.45, 0], fov: 38}} preset={presets.sunnyStudio} lightTarget={[0, 1.4, 0]} focus={[0, 1.5, 0]} focusRange={8} blur={0} edge="soft">
      <Floor />
      {row.map((r, i) => (
        <Person key={r.n} spec={who(r.n)} position={[(i - 1) * 1.95, 0, 0]} expression={r.e} act={{idle: r.idle}} />
      ))}
    </Stage>
  );
};

/** Scene C: walk in + turn + wave, run across behind, hops, sit down onto a chair. */
const CHAIR: [number, number, number] = [0.15, 0, -1.1];
const SIT_YAW = 0.75; // 3/4 view so the bent legs read
const CHAIR_S = 1.6; // seat top ~0.38
const Sitter: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [30, 50], [CHAIR[2] + 0.5, CHAIR[2] + 0.1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
  const stand = {hips: 0, legL: 0, legR: 0, kneeL: 0, kneeR: 0, lean: 0, armL: [0, 0, 0.12], armR: [0, 0, -0.12], elbowL: 0.15, elbowR: 0.15} as any;
  const sit = sitPose(0.24 * CHAIR_S);
  return (
    <Person
      spec={who('worker')}
      position={[CHAIR[0] + Math.sin(SIT_YAW) * (z - CHAIR[2]), 0, CHAIR[2] + Math.cos(SIT_YAW) * (z - CHAIR[2])]}
      rotation={[0, SIT_YAW, 0]}
      expression={ex.happy}
      act={{idle: 'calm', poseKeys: [{f: 30, v: stand}, {f: 41, v: {...stand, hips: 0.12, legL: -0.7, legR: -0.7, kneeL: 1.2, kneeR: 1.2, lean: 0.4, armL: [-0.5, 0, 0.3], armR: [-0.5, 0, -0.3]}}, {f: 50, v: sit, ease: EASE.out}]}}
    />
  );
};

const LocoScene: React.FC = () => (
  <Stage duration={SCENE_C} from={{pos: [0, 2.3, 14], target: [0, 0.95, -0.8], fov: 40}} preset={presets.sunnyStudio} lightTarget={[0, 1.2, 0]} focus={[0, 1.3, 0]} focusRange={10} blur={0} edge="soft">
    <Floor />
    <group position={CHAIR} rotation={[0, SIT_YAW, 0]}>
      <Asset id={'furniture/chair' as any} position={[-0.16, 0, 0.16]} scale={CHAIR_S} />
    </group>
    <Sitter />
    <Person spec={who('student')} expression={ex.happy} act={{idle: 'calm', walk: {from: [-4.2, 0, 0.9], to: [-1.55, 0, 0.9], start: 0, faceAfter: 0}, gestures: [{g: 'wave', at: 84}]}} />
    <Person spec={who('officer')} expression={ex.worried} act={{idle: 'none', walk: {from: [5.5, 0, -3.4], to: [-5.5, 0, -3.4], start: 30, mode: 'run'}}} />
    <Person spec={who('kid')} position={[2.15, 0, 0.2]} expression={ex.excited} act={{idle: 'alert', gestures: [{g: 'hop', at: 16}, {g: 'hop', at: 56}, {g: 'hop', at: 96}]}} />
  </Stage>
);

export const ActLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={SCENE_A}>
      <IdleScene />
    </Sequence>
    <Sequence from={SCENE_A} durationInFrames={SCENE_C}>
      <LocoScene />
    </Sequence>
  </AbsoluteFill>
);
