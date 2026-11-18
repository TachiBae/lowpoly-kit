import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FBox, FCyl, FIco, SBall} from '../lowpoly';
import {paletteV2 as P} from '../palette';
import {Clouds} from './Clouds';

type V3 = [number, number, number];
type K = {position?: V3; scale?: number};

const Tree: React.FC<{p: V3; s?: number; c?: string; seed?: number}> = ({p, s = 1, c = P.grassDeep, seed = 1}) => (
  <group position={p} scale={s}>
    <FCyl rTop={0.12} rBottom={0.18} height={0.9} position={[0, 0.45, 0]} color={P.wood} seed={seed} />
    <FIco radius={0.75} detail={1} position={[0, 1.4, 0]} color={c} seed={seed + 1} />
    <FIco radius={0.5} detail={1} position={[0.35, 1.9, 0.1]} color={P.grass} seed={seed + 2} />
  </group>
);

/** Rolling grass hills, trees, flowers, clouds. */
export const MeadowHill: React.FC<K> = ({position = [0, 0, 0], scale = 1}) => {
  const f = useCurrentFrame();
  const flowers = [P.pink, P.sun, P.violet, P.orange, P.cyan];
  return (
    <group position={position} scale={scale}>
      <FBox size={[40, 0.6, 40]} position={[0, -0.3, -6]} color={P.grass} seed={3} />
      <FIco radius={7} detail={2} position={[-9, -3.2, -10]} scale={[1.6, 0.7, 1]} color={P.grassDeep} seed={5} />
      <FIco radius={8} detail={2} position={[10, -4, -14]} scale={[1.8, 0.7, 1]} color={P.grass} seed={6} />
      <Tree p={[-4, 0, -4]} seed={10} />
      <Tree p={[5, 0, -6]} s={1.3} c={P.mint} seed={20} />
      <Tree p={[-7, 0, -9]} s={1.1} seed={30} />
      {Array.from({length: 18}).map((_, i) => {
        const x = ((i * 37) % 17) - 8;
        const z = -((i * 53) % 11) + 2;
        const sway = Math.sin(f / 30 + i) * 0.06;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, 0, sway]}>
            <FCyl rTop={0.015} rBottom={0.02} height={0.25} position={[0, 0.12, 0]} color={P.grassDeep} seed={i} />
            <FIco radius={0.07} detail={0} position={[0, 0.27, 0]} color={flowers[i % 5]} seed={i + 90} />
          </group>
        );
      })}
      <Clouds />
    </group>
  );
};

/** Pastel city block with street and crosswalk. */
export const CityDay: React.FC<K> = ({position = [0, 0, 0], scale = 1}) => {
  const cols = [P.pink, P.cyan, P.sun, P.mint, P.violet, P.orange, P.tan];
  return (
    <group position={position} scale={scale}>
      <FBox size={[40, 0.4, 40]} position={[0, -0.2, -8]} color={P.concrete} seed={4} />
      <FBox size={[40, 0.05, 4]} position={[0, 0.03, -1]} color={P.asphalt} seed={5} jitter={0.005} />
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <FBox key={i} size={[0.8, 0.06, 3.2]} position={[x, 0.07, -1]} color="#F7F4EA" seed={i} jitter={0.003} />
      ))}
      {Array.from({length: 9}).map((_, i) => {
        const h = 3 + ((i * 7) % 6);
        const x = -14 + i * 3.4;
        return (
          <group key={i} position={[x, 0, -7 - (i % 3) * 1.5]}>
            <FBox size={[2.6, h, 2.4]} position={[0, h / 2, 0]} color={cols[i % cols.length]} seed={i + 10} />
            <FBox size={[2.8, 0.2, 2.6]} position={[0, h + 0.1, 0]} color="#FFFFFF" seed={i + 40} />
            {Array.from({length: Math.floor(h / 1.4)}).map((_, r) => (
              <FBox key={r} size={[1.6, 0.5, 0.05]} position={[0, 1 + r * 1.3, 1.2]} color="#BFE6FA" emissive="#FFFFFF" emissiveIntensity={0.15} seed={r} jitter={0.004} />
            ))}
          </group>
        );
      })}
      <Clouds y={12} />
    </group>
  );
};

/** Runway, tower, hangar, windsock (sock swings from the frame). */
export const AirfieldDay: React.FC<K> = ({position = [0, 0, 0], scale = 1}) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={scale}>
      <FBox size={[50, 0.4, 40]} position={[0, -0.2, -8]} color={P.grass} seed={7} />
      <FBox size={[40, 0.06, 5]} position={[0, 0.05, -2]} color={P.asphalt} seed={8} jitter={0.005} />
      {Array.from({length: 10}).map((_, i) => (
        <FBox key={i} size={[1.4, 0.04, 0.2]} position={[-15 + i * 3.4, 0.1, -2]} color="#FFFFFF" seed={i} jitter={0.003} />
      ))}
      <group position={[8, 0, -9]}>
        <FCyl rTop={0.4} rBottom={0.6} height={4} position={[0, 2, 0]} color="#F4EFE6" seed={9} />
        <FBox size={[2.4, 1, 2.4]} position={[0, 4.5, 0]} color={P.cyan} opacity={0.9} seed={10} />
        <FBox size={[3, 0.2, 3]} position={[0, 5.1, 0]} color={P.red} seed={11} />
      </group>
      <group position={[-9, 0, -10]}>
        <FBox size={[7, 3.2, 5]} position={[0, 1.6, 0]} color={P.concrete} seed={12} />
        <FBox size={[7.2, 0.3, 5.2]} position={[0, 3.3, 0]} color={P.orange} seed={13} />
        <FBox size={[4, 2.4, 0.1]} position={[0, 1.2, 2.55]} color={P.cardSlate} seed={14} />
      </group>
      <group position={[-3, 0, -6]}>
        <FCyl rTop={0.04} rBottom={0.06} height={2.4} position={[0, 1.2, 0]} color="#FFFFFF" seed={15} />
        <group position={[0, 2.3, 0]} rotation={[0, 0.3 + Math.sin(f / 25) * 0.25, 0]}>
          <FCyl rTop={0.05} rBottom={0.22} height={0.9} position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]} color={P.orange} seed={16} radial={8} />
        </group>
      </group>
      <Clouds y={11} />
    </group>
  );
};

/** Bright classroom: back wall, window with light shaft, desks, board, shelves. */
export const ClassroomDay: React.FC<K> = ({position = [0, 0, 0], scale = 1}) => (
  <group position={position} scale={scale}>
    <FBox size={[14, 0.3, 12]} position={[0, -0.15, -2]} color={P.wood} seed={20} />
    <FBox size={[14, 6, 0.3]} position={[0, 3, -8]} color="#F5EBDD" seed={21} />
    <FBox size={[4.6, 2.2, 0.12]} position={[-2, 3.2, -7.8]} color="#2E5A4F" seed={22} />
    <FBox size={[4.8, 0.14, 0.2]} position={[-2, 2, -7.7]} color={P.wood} seed={23} />
    <FBox size={[2.6, 2.6, 0.1]} position={[4.2, 3.4, -7.8]} color="#BFE6FA" emissive="#FFFFFF" emissiveIntensity={0.5} seed={24} />
    <FBox size={[0.12, 2.7, 0.15]} position={[4.2, 3.4, -7.7]} color="#FFFFFF" seed={25} />
    <FBox size={[2.7, 0.12, 0.15]} position={[4.2, 3.4, -7.7]} color="#FFFFFF" seed={26} />
    {[-3, 0, 3].map((x, i) => (
      <group key={i} position={[x, 0, -1.5 + (i % 2)]}>
        <FBox size={[1.8, 0.12, 1.1]} position={[0, 1.05, 0]} color={P.tan} seed={30 + i} />
        {[[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]].map(([lx, lz], j) => (
          <FCyl key={j} rTop={0.05} rBottom={0.05} height={1} position={[lx, 0.5, lz]} color={P.concrete} seed={j} />
        ))}
      </group>
    ))}
    <FBox size={[2.4, 3, 0.7]} position={[-6, 1.5, -7.4]} color={P.wood} seed={40} />
    {[0.9, 1.8, 2.7].map((y, i) => (
      <FBox key={i} size={[2.2, 0.35, 0.5]} position={[-6, y, -7.1]} color={[P.pink, P.cyan, P.sun][i]} seed={41 + i} />
    ))}
  </group>
);

/** Bright lab: long bench, glassware, big windows, shelves. */
export const LabDay: React.FC<K> = ({position = [0, 0, 0], scale = 1}) => (
  <group position={position} scale={scale}>
    <FBox size={[16, 0.3, 12]} position={[0, -0.15, -2]} color="#E9EEF5" seed={50} />
    <FBox size={[16, 6, 0.3]} position={[0, 3, -8]} color="#F4F7FB" seed={51} />
    {[-5, 0, 5].map((x, i) => (
      <FBox key={i} size={[3.4, 3, 0.1]} position={[x, 3.4, -7.8]} color="#BFE6FA" emissive="#FFFFFF" emissiveIntensity={0.55} seed={52 + i} />
    ))}
    <FBox size={[9, 0.2, 2.2]} position={[0, 1.15, -2.5]} color="#FFFFFF" seed={60} />
    <FBox size={[9, 1.1, 2]} position={[0, 0.55, -2.5]} color={P.cyan} seed={61} />
    {[-3, -1, 1, 3].map((x, i) => (
      <group key={i} position={[x, 1.25, -2.5]}>
        <FCyl rTop={0.18} rBottom={0.3} height={0.6} position={[0, 0.3, 0]} color={[P.pink, P.mint, P.violet, P.sun][i]} opacity={0.85} seed={62 + i} radial={10} />
        <FCyl rTop={0.08} rBottom={0.18} height={0.25} position={[0, 0.72, 0]} color="#E8F4FA" opacity={0.8} seed={70 + i} radial={10} />
      </group>
    ))}
    <FBox size={[2.2, 3.4, 0.6]} position={[-7, 1.7, -7.4]} color="#FFFFFF" seed={80} />
    {[0.8, 1.7, 2.6].map((y, i) => (
      <SBall key={i} radius={0.18} position={[-7 + (i - 1) * 0.5, y + 0.2, -7]} color={[P.orange, P.mint, P.violet][i]} />
    ))}
  </group>
);
