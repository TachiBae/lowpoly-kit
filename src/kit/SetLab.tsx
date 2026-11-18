import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {ShotScene} from './scene/ShotScene';
import {Podium} from './props/Podium';

/** New indoor settings check: newsroom + home, medium and wide. 15 frames each. */
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;
export const SETLAB_FRAMES = 75;
export const SetLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={15}>
      <ShotScene recipe="medium" setting="newsroom" seed={3} shotIndex={0} duration={15} preset="sunnyStudio">
        <Person spec={who('anchor')} expression={ex.neutral} pose={po.idle} />
        <Podium />
      </ShotScene>
    </Sequence>
    <Sequence from={15} durationInFrames={15}>
      <ShotScene recipe="wide" setting="newsroom" seed={3} shotIndex={1} duration={15} preset="sunnyStudio" clear={1.7}>
        <Person spec={who('anchor')} position={[-0.9, 0, 0]} expression={ex.happy} />
        <Person spec={who('reporterDay')} position={[0.9, 0, 0]} expression={ex.thinking} />
      </ShotScene>
    </Sequence>
    <Sequence from={30} durationInFrames={15}>
      <ShotScene recipe="medium" setting="home" seed={3} shotIndex={2} duration={15} preset="sunnyStudio">
        <Person spec={who('kid')} expression={ex.happy} pose={po.wave} />
      </ShotScene>
    </Sequence>
    <Sequence from={45} durationInFrames={15}>
      <ShotScene recipe="wide" setting="home" seed={3} shotIndex={3} duration={15} preset="peachMorning" clear={1.7}>
        <Person spec={who('professor')} position={[-0.9, 0, 0]} expression={ex.happy} />
        <Person spec={who('student')} position={[0.9, 0, 0]} expression={ex.excited} />
      </ShotScene>
    </Sequence>
    <Sequence from={60} durationInFrames={15}>
      <ShotScene recipe="medium" setting="downtown" seed={3} shotIndex={4} duration={15} preset="blueHour">
        <Person spec={who('officer')} expression={ex.worried} />
      </ShotScene>
    </Sequence>
  </AbsoluteFill>
);
