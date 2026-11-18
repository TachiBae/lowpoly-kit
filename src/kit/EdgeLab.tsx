import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {ShotScene} from './scene/ShotScene';
import {Edge} from './look';

/** Edge styles side by side: a close-up and a wide per style. 10 frames each. */
const EDGES: Edge[] = ['clean', 'soft', 'outline'];
export const EDGELAB_FRAMES = EDGES.length * 20;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;

export const EdgeLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {EDGES.map((e, i) => (
      <React.Fragment key={e}>
        <Sequence from={i * 20} durationInFrames={10}>
          <ShotScene recipe="closeUp" setting="suburb" seed={4} shotIndex={0} duration={10} preset="sunnyDay" edge={e}>
            <Person spec={who('kid')} expression={ex.happy} pose={po.wave} />
          </ShotScene>
        </Sequence>
        <Sequence from={i * 20 + 10} durationInFrames={10}>
          <ShotScene recipe="wide" setting="downtown" seed={4} shotIndex={1} duration={10} preset="peachMorning" edge={e} clear={1.7}>
            <Person spec={who('reporterDay')} position={[-0.9, 0, 0]} expression={ex.thinking} />
            <Person spec={who('professor')} position={[0.9, 0, 0.2]} expression={ex.happy} />
          </ShotScene>
        </Sequence>
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
