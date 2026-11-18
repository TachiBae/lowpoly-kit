import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {ShotScene} from '../kit/scene/ShotScene';
import {Person} from '../kit/character/Person';
import {examples} from '../kit/character/examples';
import {expressions} from '../kit/character/acting';

/**
 * A 3-shot example: the smallest "real" use of the kit.
 * Each shot = ShotScene (camera, set, props, lighting) + Person(s) with an `act` (idle, gestures, walks).
 */
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const SHOT = 60;
export const EXAMPLE_FRAMES = SHOT * 3;

export const ExampleShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {/* 1. Medium shot in the suburbs: a wave */}
    <Sequence durationInFrames={SHOT}>
      <ShotScene recipe="medium" setting="suburb" seed={3} shotIndex={0} duration={SHOT}>
        <Person spec={who('student')} expression={expressions.happy} act={{idle: 'calm', gestures: [{g: 'wave', at: 12}]}} />
      </ShotScene>
    </Sequence>
    {/* 2. Wide shot downtown: walk in, stop, turn to camera, shrug */}
    <Sequence from={SHOT} durationInFrames={SHOT}>
      <ShotScene recipe="wide" setting="downtown" seed={5} shotIndex={1} duration={SHOT}>
        <Person spec={who('reporterDay')} act={{idle: 'calm', walk: {from: [-1.5, 0, 0], to: [0, 0, 0], start: 2, faceAfter: 0}, gestures: [{g: 'shrug', at: 46}]}} />
      </ShotScene>
    </Sequence>
    {/* 3. Close-up in the office: a gasp */}
    <Sequence from={SHOT * 2} durationInFrames={SHOT}>
      <ShotScene recipe="closeUp" setting="office" seed={7} shotIndex={2} duration={SHOT}>
        <Person spec={who('scientist')} expression={expressions.worried} act={{idle: 'nervous', gestures: [{g: 'gasp', at: 18}]}} />
      </ShotScene>
    </Sequence>
  </AbsoluteFill>
);
