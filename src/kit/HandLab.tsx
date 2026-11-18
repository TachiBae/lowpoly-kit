import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {FBox} from './lowpoly';

/** Hands check (1920x1080): 3 characters per frame. Frame 0: idle / point / thumbsUp. Frame 1: wave / shrug (open) / cheer (fist). Frame 2: crossedArms / surprised / facepalm. */
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;
const ROWS: [string, string][][] = [
  [['scientist', 'idle'], ['student', 'point'], ['kid', 'thumbsUp']],
  [['reporterDay', 'wave'], ['professor', 'shrug'], ['skater', 'cheer']],
  [['officer', 'crossedArms'], ['chef', 'surprised'], ['worker', 'facepalm']],
];
export const HANDLAB_FRAMES = ROWS.length;
export const HandLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {ROWS.map((row, f) => (
      <Sequence key={f} from={f} durationInFrames={1}>
        <Stage duration={1} from={{pos: [0, 1.7, 7.2], target: [0, 1.55, 0], fov: 34}} preset={presets.sunnyStudio} lightTarget={[0, 1.4, 0]} focus={[0, 1.5, 0]} focusRange={6} blur={0} edge="soft">
          <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />
          {row.map(([n, p], i) => (
            <Person key={n} spec={who(n)} position={[(i - 1) * 2.1, 0, 0]} pose={po[p]} expression={ex.happy} />
          ))}
        </Stage>
      </Sequence>
    ))}
  </AbsoluteFill>
);
