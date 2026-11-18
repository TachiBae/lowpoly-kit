import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import type {GestureCue} from './character/gestures';
import {FBox} from './lowpoly';

/** Gesture tuning check (1920x1080): each column frozen at its hit/hold frame. Frame 0 front, 1 three-quarter, 2 side. */
const COLS: {cue: Omit<GestureCue, 'at'>; hold: number}[] = [
  {cue: {g: 'nod'}, hold: 4},
  {cue: {g: 'crossArms'}, hold: 16},
  {cue: {g: 'clap'}, hold: 15},
  {cue: {g: 'clap'}, hold: 11},
  {cue: {g: 'typing'}, hold: 20},
  {cue: {g: 'phoneLook', side: 'R'}, hold: 20},
  {cue: {g: 'beat'}, hold: 5},
];
const VIEWS: [number, number, number][] = [[0, 1.6, 11], [7.5, 1.9, 8], [11, 1.6, 0.6]];
export const GESTURECHECK_FRAMES = VIEWS.length;
export const GestureCheck: React.FC = () => {
  const f = useCurrentFrame();
  const v = VIEWS[Math.min(f, VIEWS.length - 1)];
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Stage duration={3} from={{pos: v, target: [0, 1.3, 0], fov: 34}} preset={presets.sunnyStudio} lightTarget={[0, 1.4, 0]} focus={[0, 1.3, 0]} focusRange={10} blur={0} edge="soft">
        <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />
        {COLS.map((c, i) => (
          <Person key={i} spec={examples[i % examples.length]} position={[(i - 3) * 1.45, 0, 0]} expression={{}} act={{idle: 'none', gestures: [{...c.cue, at: f - c.hold} as GestureCue]}} />
        ))}
      </Stage>
    </AbsoluteFill>
  );
};
