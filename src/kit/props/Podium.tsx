import React from 'react';
import {FBox, FCyl} from '../lowpoly';
import {GlowMat} from '../materials';
import {paletteV2 as P} from '../palette';

type V3 = [number, number, number];

/** Press lectern: place just in front of the speaker (about 0.55 toward the camera). No logos or text. */
export const Podium: React.FC<{position?: V3; rotation?: V3; color?: string; accent?: string}> = ({position = [0, 0, 0.55], rotation = [0, 0, 0], color = '#E6EAF4', accent = P.cyan}) => (
  <group position={position} rotation={rotation}>
    <FBox size={[1.0, 0.08, 0.62]} position={[0, 0.04, 0]} color="#C9CFDE" seed={801} jitter={0.002} />
    <FBox size={[0.86, 1.12, 0.48]} position={[0, 0.64, 0]} color={color} seed={802} jitter={0.004} />
    <FBox size={[0.98, 0.08, 0.6]} position={[0, 1.24, -0.02]} rotation={[-0.22, 0, 0]} color="#D5DBE9" seed={803} jitter={0.002} />
    <FBox size={[0.86, 0.1, 0.02]} position={[0, 0.9, 0.25]} color={accent} emissive={accent} emissiveIntensity={0.6} seed={804} jitter={0.0005} />
    <FBox size={[0.5, 0.3, 0.02]} position={[0, 0.55, 0.25]} color={P.violet} seed={805} jitter={0.0005} />
    {/* microphone */}
    <FCyl rTop={0.012} rBottom={0.012} height={0.32} position={[0.12, 1.42, 0.1]} rotation={[0.5, 0, 0]} color="#2E3348" seed={806} radial={6} />
    <mesh position={[0.12, 1.56, 0.18]}>
      <sphereGeometry args={[0.035, 10, 8]} />
      <GlowMat color="#2E3348" intensity={0.1} />
    </mesh>
  </group>
);
