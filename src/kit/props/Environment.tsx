import React, {useMemo} from 'react';
import * as THREE from 'three';
import {FBox, rng} from '../lowpoly';
import {GlowMat} from '../materials';
import {palette} from '../palette';

type V3 = [number, number, number];

/** A city of server racks with blinking LEDs. blink = frame number for LED animation. */
export const ServerCity: React.FC<{
  radius?: number;
  inner?: number;
  count?: number;
  blink?: number;
  seed?: number;
  ledColors?: string[];
}> = ({radius = 16, inner = 3.5, count = 70, blink = 0, seed = 3, ledColors = [palette.keyTeal, palette.warmRim, '#7B5CFF']}) => {
  const racks = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, () => {
      const a = r() * Math.PI * 2;
      const d = inner + Math.sqrt(r()) * (radius - inner);
      return {p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, h: 0.8 + r() * 2.6, w: 0.6 + r() * 0.5, turn: r() * Math.PI, c: Math.floor(r() * 3), phase: r() * 60};
    });
  }, [radius, inner, count, seed]);
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius + 30, 48]} />
        <meshStandardMaterial color="#0C1226" roughness={0.95} />
      </mesh>
      {racks.map((k, i) => (
        <group key={i} position={k.p} rotation={[0, k.turn, 0]}>
          <FBox size={[k.w, k.h, k.w * 0.8]} position={[0, k.h / 2, 0]} color={palette.rack} seed={seed + i} jitter={0.02} />
          {Array.from({length: Math.max(2, Math.floor(k.h * 2))}, (_, j) => {
            const on = Math.floor((blink + k.phase + j * 7) / 20) % 4 !== 0;
            return (
              <mesh key={j} position={[0, 0.25 + j * 0.45, k.w * 0.41]}>
                <boxGeometry args={[k.w * 0.6, 0.05, 0.02]} />
                <GlowMat color={ledColors[(k.c + j) % ledColors.length]} intensity={on ? 3 : 0.4} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

/** String lights hanging between two points (catenary sag). */
export const StringLights: React.FC<{
  from: V3;
  to: V3;
  sag?: number;
  bulbs?: number;
  color?: string;
  intensity?: number;
}> = ({from, to, sag = 0.6, bulbs = 14, color = '#FFC777', intensity = 4}) => {
  const pts = useMemo(
    () =>
      Array.from({length: bulbs}, (_, i) => {
        const t = i / (bulbs - 1);
        return [
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag,
          from[2] + (to[2] - from[2]) * t,
        ] as V3;
      }),
    [from, to, sag, bulbs],
  );
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.012, 4, false]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <GlowMat color={color} intensity={intensity} />
        </mesh>
      ))}
    </group>
  );
};

/** Far-away glowing dots that turn into big bokeh circles with depth of field. */
export const BokehField: React.FC<{count?: number; center?: V3; spread?: V3; colors?: string[]; seed?: number; size?: number; avoid?: [number, number, number, number][]}> = ({
  count = 40,
  center = [0, 6, -14],
  spread = [26, 14, 6],
  colors = [palette.warmRim, palette.keyTeal, '#FF6FB5'],
  seed = 11,
  size = 0.12,
  avoid = [],
}) => {
  const dots = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, () => ({
      p: [center[0] + (r() - 0.5) * spread[0], center[1] + (r() - 0.5) * spread[1], center[2] + (r() - 0.5) * spread[2]] as V3,
      c: colors[Math.floor(r() * colors.length)],
      s: size * (0.6 + r()),
    })).filter((d) => !avoid.some(([x0, x1, y0, y1]) => d.p[0] > x0 && d.p[0] < x1 && d.p[1] > y0 && d.p[1] < y1));
  }, [count, center, spread, colors, seed, size, JSON.stringify(avoid)]);
  return (
    <group>
      {dots.map((d, i) => (
        <mesh key={i} position={d.p}>
          <sphereGeometry args={[d.s, 8, 6]} />
          <GlowMat color={d.c} intensity={3.5} />
        </mesh>
      ))}
    </group>
  );
};
