import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from '../Stage';
import {presets} from '../lighting';
import {Person} from '../character/Person';
import {examples} from '../character/examples';
import {Backdrop} from './Backdrop';
import {GroundDressing} from './GroundDressing';
import {Foreground, FgSide} from './Foreground';
import {Cam} from '../frame';
import {SettingId} from './settings';

const D = 60;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const cam: Cam = {pos: [0, 2.3, 7], target: [0, 1.3, 0], fov: 40};
const camTo: Cam = {pos: [0.15, 2.25, 6.65], target: [0, 1.3, 0], fov: 40};
const list: {s: SettingId; p: keyof typeof presets; who: string; side: FgSide; str: 'bold' | 'subtle'}[] = [
  {s: 'suburb', p: 'sunnyDay', who: 'kid', side: 'bottomLeft', str: 'bold'},
  {s: 'downtown', p: 'peachMorning', who: 'reporterDay', side: 'right', str: 'subtle'},
  {s: 'airfield', p: 'sunnyDay', who: 'worker', side: 'bottomRight', str: 'subtle'},
  {s: 'office', p: 'softOvercast', who: 'scientist', side: 'left', str: 'bold'},
];
export const BackdropTest: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {list.map((l, i) => (
      <Sequence key={l.s} from={i * D} durationInFrames={D}>
        <Stage edge="soft" duration={D} from={cam} to={camTo} preset={presets[l.p]} lightTarget={[0, 1.2, 0]} focus={[0, 1.3, 0]} focusRange={2.2} blur={3}>
          <Backdrop setting={l.s} cam={cam} seed={3} skyHorizon={presets[l.p].skyHorizon} />
          <GroundDressing setting={l.s} cam={cam} seed={3} />
          <Person spec={who(l.who)} position={[0, 0, 0]} />
          <Foreground setting={l.s} cam={cam} seed={3 + i} strength={l.str} side={l.side} d={l.str === 'bold' ? 1.4 : 1.8} />
        </Stage>
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const BACKDROPTEST_FRAMES = 4 * D;
