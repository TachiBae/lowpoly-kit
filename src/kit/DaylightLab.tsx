import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from './Stage';
import {presets} from './lighting';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {expressions, poses} from './character/acting';
import {FBox} from './lowpoly';
import {MeadowHill, CityDay, AirfieldDay, ClassroomDay} from './props/Daylight';
import {MugV2, LaptopV2, PhoneV2, BookStackV2, PlantV2, LampV2, GlobeV2, PaperPlaneV2} from './props/PropsV2';
import {Clouds} from './props/Clouds';
import {paletteV2 as P} from './palette';
import {Edge} from './look';
import {Asset, AssetScatter} from './props/Asset';

/** Daylight Lab: v2 art-direction check with the new presets, cast and kits. Stills at 30/90/150/210. */
export const DAYLIGHT_FRAMES = 60;
const D = DAYLIGHT_FRAMES;
const byName = (n: string) => examples.find((e) => e.name === n) ?? examples[0];
const ex = expressions as Record<string, any>;
const po = poses as Record<string, any>;

const Hero: React.FC<{edge?: Edge}> = ({edge}) => (
  <Stage edge={edge} duration={D} from={{pos: [1.0, 2.05, 4.9], target: [0, 1.55, 0], fov: 36}} to={{pos: [0.9, 2.0, 4.6], target: [0, 1.55, 0], fov: 36}} preset={presets.sunnyDay} lightTarget={[0, 1.6, 0]} faceFrom={[1.5, 2, 4]} focus={[0, 1.85, 0.2]} focusRange={1.4} blur={3}>
    <FBox size={[14, 0.2, 10]} position={[0, -0.1, 0]} color={P.tan} seed={601} jitter={0.005} />
    <Clouds y={4} z={-12} />
    <Person spec={byName('kid')} position={[0, 0, 0]} expression={ex.happy ?? {mouth: 'smile'}} pose={po.wave ?? {}} />
    <PlantV2 position={[-1.6, 0, -0.6]} />
    <GlobeV2 position={[1.5, 0, -0.4]} />
    {/* background */}
    <Asset id="city-suburban/building-type-b" position={[-4.5, 0, -10]} rotation={[0, 0.5, 0]} />
    <Asset id="city-suburban/building-type-f" position={[4.5, 0, -11]} rotation={[0, -0.4, 0]} />
    <Asset id="nature/tree_oak" position={[3.2, 0, -5.5]} />
    <Asset id="nature/tree_default" position={[-2.6, 0, -6]} />
    <Asset id="nature/plant_bushLarge" position={[1.8, 0, -2.6]} />
    <Asset id="nature/plant_bush" position={[-1.9, 0, -2.2]} />
    <Asset id="nature/fence_simple" position={[-0.8, 0, -3.6]} />
    <Asset id="nature/fence_simple" position={[0.6, 0, -3.6]} />
    <AssetScatter ids={['nature/flower_yellowA', 'nature/flower_redA', 'nature/flower_purpleB', 'nature/grass_large', 'nature/grass']} count={26} area={[-4, 4, -3.4, 2.2]} avoid={[[-1.1, 1.1, -0.8, 1.2]]} seed={3} />
    {/* foreground, blurred by DOF */}
    <Asset id="nature/flower_yellowB" position={[1.15, 0, 3.2]} />
    <Asset id="nature/grass_leafsLarge" position={[-1.0, 0, 3.3]} />
  </Stage>
);

const Lineup: React.FC<{edge?: Edge}> = ({edge}) => {
  const names = ['chef', 'skater', 'professor', 'rainWalker', 'reporterDay', 'kid'];
  const exps = ['happy', 'smug', 'thinking', 'worried', 'excited', 'wink'];
  return (
    <Stage edge={edge} duration={D} from={{pos: [0, 2.2, 10.5], target: [0, 1.1, 0], fov: 48}} to={{pos: [0.2, 2.15, 10.1], target: [0, 1.1, 0], fov: 48}} preset={presets.peachMorning} lightTarget={[0, 1.2, 0]} focus={[0, 1.2, 0]} focusRange={3} blur={2.5}>
      <FBox size={[24, 0.2, 14]} position={[0, -0.1, 0]} color={P.grass} seed={611} jitter={0.005} />
      <Clouds y={6} z={-18} />
      {names.map((n, i) => (
        <Person key={n} spec={byName(n)} position={[-3.4 + i * 1.36, 0, i % 2 ? 0.5 : 0]} rotation={[0, (i - 2.5) * -0.1, 0]} expression={ex[exps[i]] ?? {}} pose={{armL: [0, 0, 0.15], armR: [0, 0, -0.15]}} />
      ))}
    <Asset id="city-suburban/building-type-a" position={[-9, 0, -12]} rotation={[0, 0.3, 0]} />
    <Asset id="city-suburban/building-type-c" position={[-3, 0, -13]} />
    <Asset id="city-suburban/building-type-e" position={[3, 0, -13]} />
    <Asset id="city-suburban/building-type-g" position={[9, 0, -12]} rotation={[0, -0.3, 0]} />
    <Asset id="nature/tree_oak" position={[-6, 0, -7]} />
    <Asset id="nature/tree_detailed" position={[0, 0, -8]} />
    <Asset id="nature/tree_default" position={[6, 0, -7]} />
    {[-6, -4.6, -3.2, -1.8, -0.4, 1, 2.4, 3.8, 5.2].map((x) => <Asset key={x} id="nature/fence_simple" position={[x, 0, -3]} />)}
    <AssetScatter ids={['nature/flower_yellowA', 'nature/flower_redB', 'nature/flower_purpleA', 'nature/grass_large', 'nature/grass_leafs', 'nature/rock_smallA']} count={40} area={[-8, 8, -2.6, 4.5]} avoid={[[-4.2, 4.2, -0.7, 1.2]]} seed={7} />
    <Asset id="nature/plant_bushLarge" position={[-3.8, 0, 6.2]} />
    <Asset id="nature/plant_bushDetailed" position={[3.6, 0, 6]} />
  </Stage>
  );
};

const Props: React.FC<{edge?: Edge}> = ({edge}) => (
  <Stage edge={edge} duration={D} from={{pos: [0, 3.0, 8.0], target: [0, 1.1, 0], fov: 44}} to={{pos: [0.2, 2.9, 7.6], target: [0, 1.1, 0], fov: 44}} preset={presets.softOvercast} lightTarget={[0, 1.1, 0]} focus={[0, 1.0, 0.2]} focusRange={2} blur={2.5}>
    <FBox size={[12, 0.2, 8]} position={[0, -0.1, 0]} color={P.sand} seed={621} jitter={0.005} />
    <FBox size={[5, 0.2, 2.2]} position={[0, 0.9, 0]} color={P.wood} seed={622} jitter={0.005} />
    <MugV2 position={[-2.0, 1.0, 0]} />
    <LaptopV2 position={[-0.6, 1.0, 0]} />
    <PhoneV2 position={[0.7, 1.0, 0.3]} />
    <BookStackV2 position={[1.5, 1.0, -0.1]} />
    <LampV2 position={[2.2, 1.0, -0.4]} />
    <PaperPlaneV2 position={[0.1, 1.6, 0.6]} />
    <Asset id="furniture/rugRound" position={[0, 0.01, 0.3]} scale={4} />
    <Asset id="furniture/bookcaseOpen" position={[-3.2, 0, -2.6]} />
    <Asset id="furniture/pottedPlant" position={[3.3, 0, -2.2]} />
    <Asset id="furniture/lampRoundFloor" position={[-4.3, 0, -1.6]} />
    <Asset id="furniture/wallWindow" position={[0.5, 0, -3.2]} scale={3.5} />
    <Asset id="food/cup-coffee" position={[-1.2, 1.0, 0.5]} />
    <Asset id="food/donut-sprinkles" position={[-1.5, 1.0, 0.75]} />
    <Asset id="food/apple" position={[1.15, 1.0, 0.6]} />
    <Asset id="furniture/plantSmall2" position={[2.35, 1.0, 0.45]} />
    <Asset id="furniture/books" position={[0.2, 1.0, -0.6]} />
    <Asset id="food/croissant" position={[-0.9, 1.0, 0.85]} />
    <Asset id="food/plate" position={[1.6, 1.0, 0.8]} />
    <Asset id="food/cupcake" position={[1.6, 1.05, 0.8]} />
    <Asset id="furniture/lampRoundTable" position={[-2.3, 1.0, -0.4]} />
    <Asset id="furniture/radio" position={[1.9, 1.0, -0.55]} />
    <Asset id="furniture/pottedPlant" position={[-3.6, 0, 1.6]} />
    <Asset id="furniture/sideTable" position={[3.4, 0, 0.6]} />
    <Asset id="furniture/plantSmall1" position={[3.4, 1.0, 0.6]} />
    <Asset id="furniture/chairDesk" position={[-2.6, 0, 1.0]} rotation={[0, 2.3, 0]} />
  </Stage>
);

const SetWide: React.FC<{edge?: Edge}> = ({edge}) => (
  <Stage edge={edge} duration={D} from={{pos: [0.6, 4.4, 11.5], target: [0, 1.1, 0], fov: 46}} to={{pos: [0.2, 4.3, 11.0], target: [0, 1.1, 0], fov: 46}} preset={presets.sunnyDay} lightTarget={[0, 1.2, 0]} focus={[0, 1.2, 0]} focusRange={4} blur={2}>
    <Clouds y={8} z={-24} />
    <AirfieldDay position={[0, 0, -2]} />
    <Person spec={byName('worker')} position={[-1.2, 0, 1.5]} expression={ex.happy ?? {}} />
    <Person spec={byName('officer')} position={[1.2, 0, 1.5]} expression={ex.neutral ?? {}} />
    <Asset id="car/delivery" position={[-2.4, 0, -2.5]} rotation={[0, 0.5, 0]} />
    <Asset id="car/truck-flat" position={[2.6, 0, -4]} rotation={[0, -0.5, 0]} />
    {[-1.9, -1.4, 1.5, 2.0].map((x, i) => <Asset key={i} id="car/cone" position={[x, 0, 3.6]} />)}
    <Asset id="survival/barrel" position={[2.2, 0, 2.0]} />
    <Asset id="survival/barrel" position={[2.5, 0, 2.5]} />
    <Asset id="nature/tree_pineTallA" position={[-4, 0, -9]} />
    <Asset id="nature/tree_pineRoundB" position={[-2.8, 0, -11]} />
    <Asset id="nature/tree_pineTallC" position={[4.2, 0, -9.5]} />
    <Asset id="nature/tree_pineRoundD" position={[3.0, 0, -11.5]} />
    <AssetScatter ids={['nature/grass_large', 'nature/grass', 'nature/flower_yellowC', 'nature/rock_smallB']} count={24} area={[-3.2, 3.2, 1, 7]} avoid={[[-2.0, 2.0, 0.8, 2.4]]} seed={11} scale={[0.5, 0.9]} />
  </Stage>
);

export const DaylightLab: React.FC<{edge?: Edge}> = ({edge}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {[Hero, Lineup, Props, SetWide].map((S, i) => (
      <Sequence key={i} from={i * D} durationInFrames={D}>
        <S edge={edge} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const DAYLIGHTLAB_FRAMES = 4 * D;
