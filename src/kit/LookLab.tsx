import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import '@fontsource/inter/800.css';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {FBox, FIco} from './lowpoly';
import {Table} from './props/Household';
import {DeskLamp, Monitor, Corkboard, Clock, Folder} from './props/Office';
import {Magnifier, MoneyBag, PhoneBuddy, Stamp, Pawn, Robot} from './props/Story';
import {ChipSlab} from './props/Chips';
import {Laptop} from './props/Aviation';
import {BokehField, StringLights} from './props/Environment';
import {Pebbles} from './props/Dressing';
import {useLook} from './look';

/**
 * Look Lab: four neutral scenes (no story content) for judging the kit's look.
 * Kit/LookLab renders with v1, Kit/LookLab-v2 with v2. Stills at frames 30, 90, 150, 210.
 */
const D = 60;
const [scientist, student, officer, anchor, , worker] = examples;

const Label: React.FC<{text: string}> = ({text}) => (
  <AbsoluteFill style={{alignItems: 'center', paddingTop: 120, fontFamily: 'Inter', fontWeight: 800, color: 'white', fontSize: 44, textShadow: '0 2px 12px rgba(0,0,0,.6)'}}>
    {text}
  </AbsoluteFill>
);

/** 1. Hero close-up at a desk: face, hair, clothing, lamp light. */
const Hero: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage duration={D} from={{pos: [1.0, 2.05, 4.9], target: [0, 1.55, 0], fov: 36}} to={{pos: [0.9, 2.0, 4.6], target: [0, 1.55, 0], fov: 36}} preset={presets.lampLitCozy} lightTarget={[0, 1.6, 0]} faceFrom={[1.5, 2, 4]} focus={[0, 1.85, 0.2]} focusRange={1.4} blur={4}>
      <FBox size={[12, 0.2, 10]} position={[0, -0.1, 0]} color="#3A2A22" seed={501} jitter={0.005} />
      <FBox size={[12, 6, 0.2]} position={[0, 3, -2.4]} color="#2E3348" seed={502} jitter={0.01} />
      <Corkboard position={[-1.4, 2.6, -2.25]} w={2.2} h={1.4} />
      <Clock position={[1.6, 3.1, -2.25]} t={f / 300} />
      <Person spec={scientist} position={[0, 0, -0.35]} expression={{mouth: 'smile'}} pose={{armL: [-0.6, 0, 0.1], elbowL: 1.2, armR: [-0.6, 0, -0.1], elbowR: 1.2}} />
      <Table position={[0, 0, 0.55]} w={2.6} d={1.2} h={0.95} color="#8A5A3A" />
      <Laptop position={[0.1, 0.95, 0.55]} rotation={[0, Math.PI, 0]} scale={0.9} screen="#4FD6E8" />
      <DeskLamp position={[-0.95, 0.95, 0.5]} rotation={[0, 0.6, 0]} />
      <Folder position={[0.85, 0.97, 0.75]} rotation={[0, -0.3, 0]} scale={0.6} />
      <BokehField center={[0, 2.8, -2.2]} spread={[8, 3, 0.2]} count={12} colors={['#FFC27A', '#FFE0B0']} seed={9} />
    </Stage>
  );
};

/** 2. Cast lineup: silhouettes, proportions, materials side by side. */
const Lineup: React.FC = () => (
  <Stage duration={D} from={{pos: [0, 2.6, 12.4], target: [0, 1.0, 0], fov: 46}} to={{pos: [0.2, 2.55, 12.0], target: [0, 1.0, 0], fov: 46}} preset={presets.goldenHour} lightTarget={[0, 1.2, 0]} focus={[0, 1.2, 0]} focusRange={3} blur={3}>
    <FBox size={[20, 0.2, 14]} position={[0, -0.1, 0]} color="#C9A27A" seed={511} jitter={0.005} />
    {[scientist, student, officer, worker].map((s, i) => (
      <Person key={s.name} spec={s} position={[-1.8 + i * 1.2, 0, i % 2 ? 0.3 : 0]} rotation={[0, (i - 1.5) * -0.12, 0]} expression={{mouth: i % 2 ? 'smile' : 'small'}} pose={{armL: [0, 0, 0.15], armR: [0, 0, -0.15]}} />
    ))}
    <FIco radius={0.5} detail={0} position={[-4.2, 0.3, -1.6]} color="#7A8F5A" seed={512} />
    <LabDressing area={[-4.5, 4.5, -3, 2.5]} avoid={[[-2.6, 2.6, -0.8, 1.2]]} colors={['#B08A66', '#9A7A5C', '#C49A72']} />
    <FIco radius={0.35} detail={0} position={[4.0, 0.2, -1.2]} color="#6E8450" seed={513} />
    <BokehField center={[0, 3.2, -4]} spread={[14, 3, 0.2]} count={14} seed={14} />
  </Stage>
);

/** 3. Prop table: faceted materials, bevels, colour. */
const Props: React.FC = () => {
  const f = useCurrentFrame();
  const spin = f * 0.01;
  return (
    <Stage duration={D} from={{pos: [0, 3.3, 5.4], target: [0, 0.95, 0], fov: 44}} to={{pos: [0.25, 3.2, 5.1], target: [0, 0.95, 0], fov: 44}} preset={presets.duskGlow} lightTarget={[0, 1.1, 0]} focus={[0, 1.15, 0.2]} focusRange={2} blur={3}>
      <FBox size={[14, 0.2, 10]} position={[0, -0.1, 0]} color="#3A2E52" seed={521} jitter={0.005} />
      <Table position={[0, 0, 0]} w={3.4} d={1.8} h={0.9} color="#6B4A3A" />
      <Magnifier position={[-0.95, 1.25, 0.25]} rotation={[0, spin, 0.3]} scale={0.4} />
      <MoneyBag position={[-0.4, 0.9, -0.2]} scale={0.45} />
      <PhoneBuddy position={[0.4, 1.25, 0.2]} rotation={[0, -0.3 + spin, 0]} scale={0.32} />
      <Stamp position={[0.95, 0.9, -0.15]} scale={0.6} />
      <ChipSlab position={[0.6, 1.0, 0.6]} size={0.5} thickness={0.12} rotation={[0.3, 0.4, 0]} />
      <Pawn position={[-0.5, 0.9, 0.65]} scale={0.45} />
      <BokehField center={[0, 2.6, -3]} spread={[10, 3, 0.2]} count={14} seed={22} />
    </Stage>
  );
};

/** 4. Set wide: an office diorama with practicals, for depth, haze and set dressing. */
const SetWide: React.FC = () => (
  <Stage duration={D} from={{pos: [0.6, 4.4, 11.5], target: [0, 1.1, 0], fov: 46}} to={{pos: [0.2, 4.3, 11.0], target: [0, 1.1, 0], fov: 46}} preset={presets.midnightMonitor} lightTarget={[0, 1.2, 0]} focus={[0, 1.2, 0]} focusRange={4} blur={2.5}>
    <FBox size={[24, 0.2, 18]} position={[0, -0.1, 0]} color="#1E2436" seed={531} jitter={0.005} />
    <FBox size={[24, 7, 0.3]} position={[0, 3.5, -4]} color="#212A44" seed={532} jitter={0.01} />
    <StringLights from={[-5, 5.6, -3.7]} to={[5, 5.6, -3.7]} sag={0.5} bulbs={16} />
    {[-2.4, 0, 2.4].map((x, i) => (
      <group key={i} position={[x, 0, i === 1 ? -0.6 : 0]}>
        <FBox size={[1.9, 0.85, 0.9]} position={[0, 0.425, 0]} color="#2A3146" seed={540 + i} jitter={0.01} />
        <Monitor position={[0, 0.85, -0.15]} scale={0.75} screen={['#1E6E8A', '#2B4FA0', '#1E8A6E'][i]} />
      </group>
    ))}
    <Person spec={officer} position={[-1.6, 0, 1.2]} rotation={[0, Math.PI, 0]} />
    <Person spec={anchor} position={[1.6, 0, 1.2]} rotation={[0, Math.PI + 0.3, 0]} />
    <Robot position={[0.9, 0, 1.6]} scale={0.6} eyes="happy" />
    <LabDressing area={[-6, 6, -3.5, 4]} avoid={[[-3.6, 3.6, -1.2, 2.4]]} colors={['#2A3146', '#323A55', '#262C40']} />
    <BokehField center={[0, 3.4, -3.8]} spread={[16, 4, 0.2]} count={16} seed={33} />
  </Stage>
);

/** v2 only: ground clutter so floors aren't empty planes. */
const LabDressing: React.FC<{area: [number, number, number, number]; avoid: [number, number, number, number][]; colors: string[]}> = ({area, avoid, colors}) =>
  useLook() === 'v2' ? <Pebbles area={area} avoid={avoid} colors={colors} count={18} /> : null;

export const LookLab: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence durationInFrames={D}>
      <Hero />
      <Label text="HERO CLOSE-UP" />
    </Sequence>
    <Sequence from={D} durationInFrames={D}>
      <Lineup />
      <Label text="CAST LINEUP" />
    </Sequence>
    <Sequence from={2 * D} durationInFrames={D}>
      <Props />
      <Label text="PROP TABLE" />
    </Sequence>
    <Sequence from={3 * D} durationInFrames={D}>
      <SetWide />
      <Label text="SET WIDE" />
    </Sequence>
  </AbsoluteFill>
);
export const LOOKLAB_FRAMES = 4 * D;
