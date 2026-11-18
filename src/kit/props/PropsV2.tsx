import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FBox, FCyl, FIco, SBall, SCapsule} from '../lowpoly';
import {paletteV2 as P} from '../palette';

type V3 = [number, number, number];
type K = {position?: V3; rotation?: V3; scale?: number};
const G: React.FC<K & {children: React.ReactNode}> = ({position, rotation, scale, children}) => (
  <group position={position} rotation={rotation} scale={scale}>{children}</group>
);

export const MugV2: React.FC<K & {color?: string}> = ({color = P.pink, ...k}) => (
  <G {...k}>
    <FCyl rTop={0.2} rBottom={0.18} height={0.4} position={[0, 0.2, 0]} color={color} radial={14} seed={1} jitter={0.004} />
    <FCyl rTop={0.17} rBottom={0.17} height={0.02} position={[0, 0.39, 0]} color="#6B4430" radial={14} seed={2} jitter={0.001} />
    <FBox size={[0.18, 0.05, 0.05]} position={[0.26, 0.2, 0]} color={color} seed={3} jitter={0.003} />
  </G>
);

export const LaptopV2: React.FC<K & {color?: string; open?: number}> = ({color = P.concrete, open = 1.9, ...k}) => (
  <G {...k}>
    <FBox size={[1, 0.06, 0.7]} position={[0, 0.03, 0]} color={color} seed={4} jitter={0.004} />
    <group position={[0, 0.06, -0.35]} rotation={[open - Math.PI / 2 - 0.2, 0, 0]}>
      <FBox size={[1, 0.65, 0.04]} position={[0, 0.33, 0]} color={color} seed={5} jitter={0.004} />
      <FBox size={[0.9, 0.55, 0.02]} position={[0, 0.33, 0.03]} color={P.cyan} emissive={P.cyan} emissiveIntensity={0.5} seed={6} jitter={0.002} />
    </group>
  </G>
);

export const PhoneV2: React.FC<K & {color?: string}> = ({color = P.violet, ...k}) => (
  <G {...k}>
    <FBox size={[0.3, 0.55, 0.04]} color={color} seed={7} jitter={0.003} />
    <FBox size={[0.26, 0.48, 0.01]} position={[0, 0, 0.025]} color="#FFFFFF" emissive="#BFE6FA" emissiveIntensity={0.4} seed={8} jitter={0.001} />
  </G>
);

export const BookStackV2: React.FC<K> = (k) => (
  <G {...k}>
    {[P.pink, P.cyan, P.sun, P.mint].map((c, i) => (
      <FBox key={i} size={[0.8 - i * 0.06, 0.14, 0.56]} position={[(i % 2) * 0.03, 0.07 + i * 0.14, 0]} rotation={[0, (i - 1.5) * 0.1, 0]} color={c} seed={10 + i} jitter={0.004} />
    ))}
  </G>
);

export const PlantV2: React.FC<K> = (k) => {
  const f = useCurrentFrame();
  return (
    <G {...k}>
      <FCyl rTop={0.26} rBottom={0.18} height={0.34} position={[0, 0.17, 0]} color={P.orange} radial={10} seed={20} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, i * 1.26, Math.sin(f / 40 + i) * 0.04 + 0.35]} position={[0, 0.34, 0]}>
          <FIco radius={0.16} detail={0} position={[0, 0.3, 0]} scale={[0.5, 1.7, 0.2]} color={i % 2 ? P.mint : P.grass} seed={21 + i} />
        </group>
      ))}
    </G>
  );
};

export const LampV2: React.FC<K & {on?: boolean}> = ({on = true, ...k}) => (
  <G {...k}>
    <FCyl rTop={0.22} rBottom={0.26} height={0.05} position={[0, 0.025, 0]} color={P.cardSlate} radial={12} seed={30} jitter={0.003} />
    <FCyl rTop={0.025} rBottom={0.025} height={0.8} position={[0, 0.45, 0]} color={P.cardSlate} radial={6} seed={31} jitter={0.002} />
    <FCyl rTop={0.12} rBottom={0.3} height={0.3} position={[0, 0.95, 0]} color={P.sun} emissive={on ? P.sun : undefined} emissiveIntensity={on ? 0.6 : 0} radial={12} seed={32} jitter={0.004} />
  </G>
);

export const GlobeV2: React.FC<K> = (k) => {
  const f = useCurrentFrame();
  return (
    <G {...k}>
      <FCyl rTop={0.2} rBottom={0.28} height={0.06} position={[0, 0.03, 0]} color={P.wood} radial={12} seed={40} jitter={0.003} />
      <group position={[0, 0.5, 0]} rotation={[0.4, f * 0.02, 0]}>
        <SBall radius={0.38} color={P.cyan} />
        <FIco radius={0.4} detail={1} position={[0.05, 0.05, 0]} scale={[0.9, 0.6, 0.9]} color={P.grass} seed={41} />
        <FIco radius={0.2} detail={0} position={[-0.2, -0.15, 0.2]} color={P.mint} seed={42} />
      </group>
    </G>
  );
};

export const PaperPlaneV2: React.FC<K & {color?: string}> = ({color = '#FFFFFF', ...k}) => (
  <G {...k}>
    <FBox size={[0.04, 0.12, 0.9]} position={[0, -0.02, 0]} color={P.concrete} seed={50} jitter={0.002} />
    <FBox size={[0.5, 0.03, 0.8]} position={[0.2, 0.03, -0.05]} rotation={[0, 0, -0.35]} color={color} seed={51} jitter={0.002} />
    <FBox size={[0.5, 0.03, 0.8]} position={[-0.2, 0.03, -0.05]} rotation={[0, 0, 0.35]} color={P.pink} seed={52} jitter={0.002} />
  </G>
);
