import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SBall} from '../lowpoly';

/** Soft puffy clouds for daylight skies. Deterministic slow drift. */
export const Clouds: React.FC<{y?: number; z?: number; spread?: number; count?: number; color?: string; glow?: number}> = ({
  y = 9, z = -22, spread = 36, count = 6, color = '#FFFFFF', glow = 0.55,
}) => {
  const f = useCurrentFrame();
  return (
    <group>
      {Array.from({length: count}).map((_, i) => {
        const x = ((i / count) * spread - spread / 2 + f * 0.01 * (1 + (i % 3) * 0.4) + spread * 4) % spread - spread / 2;
        const s = 1.2 + (i % 3) * 0.5;
        const yy = y + ((i * 7) % 5) * 0.6;
        return (
          <group key={i} position={[x, yy, z - (i % 2) * 6]}>
            <SBall emissive={color} emissiveIntensity={glow} position={[0, 0, 0]} radius={s} color={color} />
            <SBall emissive={color} emissiveIntensity={glow} position={[s * 0.9, -0.1, 0]} radius={s * 0.75} color={color} />
            <SBall emissive={color} emissiveIntensity={glow} position={[-s * 0.9, -0.15, 0]} radius={s * 0.7} color={color} />
          </group>
        );
      })}
    </group>
  );
};
