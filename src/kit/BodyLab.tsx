import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import type {ArmStyle, BodyStyle} from './character/types';
import {ShotScene} from './scene/ShotScene';

/** Torso comparison: each variant = trio medium, arms-up low hero, 3/4 close-up. 20 frames per shot. */
const VARIANTS: {arms: ArmStyle; body: BodyStyle}[] = [
  {arms: 'classic', body: 'classic'},
  {arms: 'tube', body: 'shaped'},
];
export const BODYLAB_FRAMES = VARIANTS.length * 60;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;

export const BodyLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {VARIANTS.map((v, i) => (
      <React.Fragment key={i}>
        <Sequence from={i * 60} durationInFrames={15}>
          <ShotScene recipe="medium" setting="suburb" seed={2} shotIndex={0} duration={15} preset="sunnyDay" clear={1.8} overrides={{fg: false}}>
            <Person {...v} spec={who('anchor')} position={[-1.25, 0, 0]} pose={po.idle} expression={ex.neutral} />
            <Person {...v} spec={who('scientist')} position={[0, 0, 0.3]} pose={po.point} expression={ex.happy} />
            <Person {...v} spec={who('student')} position={[1.25, 0, 0]} pose={po.wave} expression={ex.excited} />
          </ShotScene>
        </Sequence>
        <Sequence from={i * 60 + 15} durationInFrames={15}>
          <ShotScene recipe="medium" setting="suburb" seed={2} shotIndex={0} duration={15} preset="sunnyDay" clear={1.8} overrides={{fg: false}}>
            <Person {...v} spec={who('officer')} position={[-1.25, 0, 0]} pose={po.crossedArms} expression={ex.neutral} />
            <Person {...v} spec={who('chef')} position={[0, 0, 0.3]} pose={po.thumbsUp} expression={ex.happy} />
            <Person {...v} spec={who('kid')} position={[1.25, 0, 0]} pose={po.shrug} expression={ex.skeptical} />
          </ShotScene>
        </Sequence>
        <Sequence from={i * 60 + 30} durationInFrames={15}>
          <ShotScene recipe="lowHero" setting="suburb" seed={2} shotIndex={1} duration={15} preset="sunnyDay" overrides={{fg: false}}>
            <Person {...v} spec={who('skater')} pose={po.cheer} expression={ex.excited} />
          </ShotScene>
        </Sequence>
        <Sequence from={i * 60 + 45} durationInFrames={15}>
          <ShotScene recipe="medium" setting="suburb" seed={2} shotIndex={2} duration={15} preset="sunnyDay" angle={0.9} overrides={{fg: false}}>
            <Person {...v} spec={who('professor')} rotation={[0, 0.9, 0]} pose={po.idle} expression={ex.happy} />
          </ShotScene>
        </Sequence>
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
