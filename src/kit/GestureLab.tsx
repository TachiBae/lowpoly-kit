import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {GESTURE_IDS, GestureId} from './character/gestures';
import {FBox} from './lowpoly';

/** Gesture library check. per=3: 1920x1080, 3 per scene. per=1: vertical, one close-up per scene. Each fires at frame 6. */
const SCENE = 48;
const groups = (per: number): GestureId[][] => Array.from({length: Math.ceil(GESTURE_IDS.length / per)}, (_, i) => GESTURE_IDS.slice(i * per, i * per + per));
export const GESTURE_GROUPS = groups(3);
export const gestureLabFrames = (per = 3) => groups(per).length * SCENE;
export const GESTURELAB_FRAMES = gestureLabFrames();

export const GestureLab: React.FC<{per?: number}> = ({per = 3}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {groups(per).map((grp, s) => (
      <Sequence key={s} from={s * SCENE} durationInFrames={SCENE}>
        <Stage duration={SCENE} from={per === 1 ? {pos: [0, 1.5, 8.2], target: [0, 1.15, 0], fov: 34} : {pos: [0, 1.7, 7.4], target: [0, 1.55, 0], fov: 34}} preset={presets.sunnyStudio} lightTarget={[0, 1.4, 0]} focus={[0, 1.5, 0]} focusRange={6} blur={0} edge="soft">
          <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />
          {grp.map((g, i) => (
            <Person key={g} spec={examples[(s * per + i) % examples.length]} position={[(i - (grp.length - 1) / 2) * 2.2, 0, 0]} expression={{eyeShape: 'dot'}} act={{idle: 'calm', gestures: [{g, at: 6, side: g === 'phoneLook' ? 'R' : 'L'}]}} />
          ))}
        </Stage>
      </Sequence>
    ))}
  </AbsoluteFill>
);
