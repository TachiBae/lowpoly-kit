import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {Asset} from './props/Asset';
import {FBox} from './lowpoly';
import {ShotScene} from './scene/ShotScene';
import {paletteV2 as P} from './palette';

/** Daylight Lab 2: six recipe x setting combinations built with ShotScene. Stills at 30, 90, 150, 210, 270, 330. */
export const DL2_D = 60;
export const DAYLIGHTLAB2_FRAMES = 6 * DL2_D;
const D = DL2_D;
const who = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;

const scenes: React.FC[] = [
  () => (
    <ShotScene recipe="closeUp" setting="suburb" seed={4} shotIndex={0} duration={D} preset="sunnyDay">
      <Person spec={who('kid')} expression={ex.happy} pose={po.wave} />
    </ShotScene>
  ),
  () => (
    <ShotScene recipe="medium" setting="downtown" seed={4} shotIndex={1} duration={D} preset="peachMorning" clear={1.7}>
      <Person spec={who('reporterDay')} position={[-0.8, 0, 0]} expression={ex.thinking} />
      <Person spec={who('professor')} position={[0.9, 0, 0.2]} rotation={[0, -0.3, 0]} expression={ex.happy} />
    </ShotScene>
  ),
  () => (
    <ShotScene recipe="wide" setting="airfield" seed={4} shotIndex={2} duration={D} preset="sunnyDay" clear={1.8}>
      <Person spec={who('worker')} position={[-1, 0, 0]} expression={ex.happy} />
      <Person spec={who('officer')} position={[1, 0, 0]} expression={ex.neutral} />
    </ShotScene>
  ),
  () => (
    <ShotScene recipe="overShoulder" setting="office" seed={4} shotIndex={3} duration={D} preset="softOvercast" shoulder={who('student')}>
      <Person spec={who('scientist')} expression={ex.worried} />
    </ShotScene>
  ),
  () => (
    <ShotScene recipe="lowHero" setting="suburb" seed={4} shotIndex={4} duration={D} preset="peachMorning" angle={0.35}>
      <Person spec={who('skater')} rotation={[0, 0.35, 0]} expression={ex.excited} pose={po.cheer} />
    </ShotScene>
  ),
  () => (
    <ShotScene recipe="insert" setting="office" seed={4} shotIndex={5} duration={D} preset="sunnyDay" propY={1.0} clear={1.9}>
      <FBox size={[3.4, 0.14, 1.8]} position={[0, 0.93, 0]} color={P.wood} seed={701} jitter={0.004} />
      <Asset id="food/cup-coffee" position={[0, 1.0, 0]} fitHeight={0.42} />
      <Asset id="food/donut-sprinkles" position={[0.55, 1.0, 0.25]} fitHeight={0.16} />
      <Asset id="food/cupcake" position={[-0.5, 1.0, 0.3]} fitHeight={0.3} />
      <Asset id="furniture/books" position={[-1.0, 1.0, -0.3]} fitHeight={0.35} />
      <Asset id="furniture/plantSmall2" position={[1.1, 1.0, -0.3]} fitHeight={0.5} />
      <Asset id="furniture/laptop" position={[0.1, 1.0, -0.55]} fitHeight={0.4} />
      {/* notebook + pen, squared to the desk edge */}
      <FBox size={[0.62, 0.04, 0.44]} position={[-0.55, 1.02, 0.55]} rotation={[0, 0.12, 0]} color={P.cyan} seed={702} jitter={0.001} />
      <FBox size={[0.58, 0.012, 0.4]} position={[-0.55, 1.045, 0.55]} rotation={[0, 0.12, 0]} color="#FFFFFF" seed={703} jitter={0.0005} />
      <FBox size={[0.42, 0.03, 0.03]} position={[-0.5, 1.07, 0.6]} rotation={[0, 0.5, 0]} color={P.pink} seed={704} jitter={0.0005} />
      <FBox size={[0.2, 0.025, 0.38]} position={[0.75, 1.015, 0.55]} rotation={[0, -0.2, 0]} color="#2E3348" seed={705} jitter={0.0005} />
    </ShotScene>
  ),
];

export const DaylightLab2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {scenes.map((S, i) => (
      <Sequence key={i} from={i * D} durationInFrames={D}>
        <S />
      </Sequence>
    ))}
  </AbsoluteFill>
);
