import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {GESTURE_IDS, GestureId} from './character/gestures';
import {FBox} from './lowpoly';

/** Gesture library check (1920x1080). 20 gestures, 3 per scene of 48 frames; each fires at frame 6. */
const PER = 3;
const SCENE = 48;
export const GESTURE_GROUPS: GestureId[][] = Array.from({length: Math.ceil(GESTURE_IDS.length / PER)}, (_, i) => GESTURE_IDS.slice(i * PER, i * PER + PER));
export const GESTURELAB_FRAMES = GESTURE_GROUPS.length * SCENE;

export const GestureLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {GESTURE_GROUPS.map((grp, s) => (
      <Sequence key={s} from={s * SCENE} durationInFrames={SCENE}>
        <Stage duration={SCENE} from={{pos: [0, 1.7, 7.4], target: [0, 1.55, 0], fov: 34}} preset={presets.sunnyStudio} lightTarget={[0, 1.4, 0]} focus={[0, 1.5, 0]} focusRange={6} blur={0} edge="soft">
          <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />
          {grp.map((g, i) => (
            <Person key={g} spec={examples[(s * PER + i) % examples.length]} position={[(i - 1) * 2.2, 0, 0]} expression={{eyeShape: 'dot'}} act={{idle: 'calm', gestures: [{g, at: 6, side: g === 'phoneLook' ? 'R' : 'L'}]}} />
          ))}
        </Stage>
      </Sequence>
    ))}
  </AbsoluteFill>
);
