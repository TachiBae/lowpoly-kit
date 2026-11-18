import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import type {ArmStyle} from './character/types';
import {ShotScene} from './scene/ShotScene';

/** Arm comparison: each style gets a 3-person medium (idle / wave / point) and a low hero (arms up). 30 frames each. */
const STYLES: ArmStyle[] = ['classic', 'tube', 'clay', 'refined'];
export const ARMLAB_FRAMES = STYLES.length * 60;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;

export const ArmLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {STYLES.map((st, i) => (
      <React.Fragment key={st}>
        <Sequence from={i * 60} durationInFrames={30}>
          <ShotScene recipe="medium" setting="suburb" seed={2} shotIndex={0} duration={30} preset="sunnyDay" clear={1.8} overrides={{fg: false}}>
            <Person arms={st} spec={who('worker')} position={[-1.25, 0, 0]} pose={po.idle} expression={ex.neutral} />
            <Person arms={st} spec={who('kid')} position={[0, 0, 0.3]} pose={po.wave} expression={ex.happy} />
            <Person arms={st} spec={who('reporterDay')} position={[1.25, 0, 0]} rotation={[0, -0.3, 0]} pose={po.point} expression={ex.excited} />
          </ShotScene>
        </Sequence>
        <Sequence from={i * 60 + 30} durationInFrames={30}>
          <ShotScene recipe="lowHero" setting="suburb" seed={2} shotIndex={1} duration={30} preset="sunnyDay" overrides={{fg: false}}>
            <Person arms={st} spec={who('skater')} pose={po.cheer} expression={ex.excited} />
          </ShotScene>
        </Sequence>
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
