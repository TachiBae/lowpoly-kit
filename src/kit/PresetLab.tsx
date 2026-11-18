import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Caption} from '@remotion/captions';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {ShotScene} from './scene/ShotScene';
import {Captions} from './Captions';
import {PresetId} from './lighting';
import {SettingId} from './scene/settings';

/** Bright presets with real captions on top (readability check). 30 frames each. */
const LIST: {p: PresetId; s: SettingId; line: string}[] = [
  {p: 'sunnyDay', s: 'suburb', line: 'So I checked the records.'},
  {p: 'peachMorning', s: 'downtown', line: 'The numbers tell another story.'},
  {p: 'candyDusk', s: 'suburb', line: 'Nobody saw this coming.'},
  {p: 'blueHour', s: 'downtown', line: 'At night, the lights stayed on.'},
  {p: 'sunnyStudio', s: 'office', line: 'Here is what really happened.'},
  {p: 'softOvercast', s: 'airfield', line: 'Every flight stayed grounded.'},
];
export const PRESETLAB_FRAMES = LIST.length * 30;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;
const cap = (line: string): Caption[] =>
  line.split(' ').map((w, i) => ({text: ' ' + w, startMs: i * 120, endMs: i * 120 + 110, timestampMs: i * 120, confidence: null}));
const cast = ['reporterDay', 'professor', 'kid', 'officer', 'scientist', 'worker'];

export const PresetLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {LIST.map((l, i) => (
      <Sequence key={l.p} from={i * 30} durationInFrames={30}>
        <ShotScene recipe="medium" setting={l.s} seed={3} shotIndex={i} duration={30} preset={l.p}>
          <Person spec={who(cast[i])} pose={po.idle} expression={ex.happy} />
        </ShotScene>
        <Captions captions={cap(l.line)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
