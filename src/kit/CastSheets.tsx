import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions} from './character/acting';
import {FBox} from './lowpoly';

/** Landscape (1920x1080) reference sheets. Turnaround: 2 groups x front/side/back = 6 frames. Expressions: 4 frames. */
const P = presets.sunnyStudio;
const Floor = () => <FBox size={[60, 0.2, 40]} position={[0, -0.1, 0]} color="#F1E4D2" seed={901} jitter={0.002} />;
const VIEWS = [0, -Math.PI / 2, Math.PI];
const groups = [examples.slice(0, 6), examples.slice(6, 12)];

export const CastTurnaround: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {groups.flatMap((g, gi) =>
      VIEWS.map((yaw, vi) => (
        <Sequence key={`${gi}${vi}`} from={gi * 3 + vi} durationInFrames={1}>
          <Stage duration={1} from={{pos: [0, 1.4, 17], target: [0, 1.3, 0], fov: 22}} preset={P} lightTarget={[0, 1.2, 0]} focus={[0, 1.3, 0]} focusRange={8} blur={0} edge="soft">
            <Floor />
            {g.map((s, i) => (
              <Person key={s.name} spec={s} position={[(i - (g.length - 1) / 2) * 1.75, 0, 0]} rotation={[0, yaw, 0]} expression={{mouth: 'small'}} />
            ))}
          </Stage>
        </Sequence>
      )),
    )}
  </AbsoluteFill>
);
export const CAST_TURNAROUND_FRAMES = 6;

const EXP = Object.keys(expressions);
export const EXPRESSION_ORDER = EXP;
const ex = expressions as Record<string, any>;
export const CastExpressions: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {[0, 1, 2, 3].map((f) => (
      <Sequence key={f} from={f} durationInFrames={1}>
        <Stage duration={1} from={{pos: [0, 1.95, 9.5], target: [0, 1.85, 0], fov: 30}} preset={P} lightTarget={[0, 1.8, 0]} faceFrom={[0, 2, 6]} focus={[0, 1.85, 0]} focusRange={6} blur={0} edge="soft">
          <Floor />
          {EXP.slice(f * 4, f * 4 + 4).map((k, i) => (
            <Person key={k} spec={examples.find((e) => e.name === 'kid') ?? examples[0]} position={[(i - 1.5) * 1.55, 0, 0]} expression={{...ex[k], blink: 0}} />
          ))}
        </Stage>
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const CAST_EXPRESSIONS_FRAMES = 4;
