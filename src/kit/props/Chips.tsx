import React, {useMemo} from 'react';
import * as THREE from 'three';
import {FBox, rng} from '../lowpoly';
import {GlowMat} from '../materials';
import {palette} from '../palette';

type V3 = [number, number, number];

/** One computer chip: dark faceted body, gold pins on all four sides, glowing die on top. */
export const ChipSlab: React.FC<{
  size?: number;
  thickness?: number;
  body?: string;
  glow?: string;
  glowIntensity?: number;
  position?: V3;
  rotation?: V3;
  seed?: number;
  lip?: string;
}> = ({size = 2.2, thickness = 0.42, body = palette.chipBody, glow = palette.keyTeal, glowIntensity = 2.2, position, rotation, seed = 1, lip = '#2E3A5C'}) => {
  const pins = useMemo(() => {
    const out: {p: V3; r: number}[] = [];
    const n = 14;
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < n; i++) {
        const t = (i / (n - 1) - 0.5) * size * 0.8;
        const e = size / 2 + size * 0.025;
        const p: V3 = side === 0 ? [t, 0, e] : side === 1 ? [t, 0, -e] : side === 2 ? [e, 0, t] : [-e, 0, t];
        out.push({p, r: side < 2 ? 0 : Math.PI / 2});
      }
    }
    return out;
  }, [size]);
  const pinGeo = useMemo(() => new THREE.BoxGeometry(size * 0.018, thickness * 0.14, size * 0.06), [size, thickness]);
  return (
    <group position={position} rotation={rotation}>
      <FBox size={[size, thickness, size]} color={body} seed={seed} jitter={0.035} />
      {/* Bevel lip */}
      <FBox size={[size * 0.92, thickness * 0.22, size * 0.92]} position={[0, thickness * 0.58, 0]} color={lip} seed={seed + 1} jitter={0.02} />
      {/* Die */}
      <mesh position={[0, thickness * 0.72, 0]}>
        <boxGeometry args={[size * 0.42, 0.04, size * 0.42]} />
        <GlowMat color={glow} intensity={glowIntensity} />
      </mesh>
      {/* Gold pins */}
      {pins.map((pin, i) => (
        <mesh key={i} geometry={pinGeo} position={pin.p} rotation={[0, pin.r, 0]} castShadow>
          <meshStandardMaterial color={palette.chipGold} roughness={0.35} metalness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Stack of chips. pulled = index of the slab being yanked out (Jenga), pull = 0..1.
 * wobble = radians of sway applied progressively up the stack.
 */
export const ChipTower: React.FC<{
  count?: number;
  pulled?: number;
  pull?: number;
  wobble?: number;
  /** Index of a slab that is gone (leaves a gap, cartoon physics keeps the rest floating). */
  missing?: number;
  position?: V3;
  seed?: number;
}> = ({count = 9, pulled = -1, pull = 0, wobble = 0, missing = -1, position, seed = 7}) => {
  const r = rng(seed);
  const slabs = Array.from({length: count}, (_, i) => ({
    turn: (r() - 0.5) * 0.22,
    size: 2.2 - i * 0.04 + (r() - 0.5) * 0.1,
    glow: i % 3 === 1 ? palette.warmRim : palette.keyTeal,
    lip: ['#2E3A5C', '#3A2E5C', '#2A4A5A'][i % 3],
  }));
  const t = 0.42;
  const gap = 0.5;
  return (
    <group position={position}>
      {slabs.map((s, i) => {
        if (i === missing) return null;
        const sway = wobble * (i / count);
        const out = i === pulled ? pull * 1.6 : 0;
        return (
          <ChipSlab
            key={i}
            size={s.size}
            thickness={t}
            glow={s.glow}
            lip={s.lip}
            seed={seed + i * 13}
            position={[Math.sin(sway) * i * gap + out, i * gap + t / 2, 0]}
            rotation={[0, s.turn, -sway]}
          />
        );
      })}
    </group>
  );
};

/** Height of the tower top surface for a given count (for placing characters on it). */
export const chipTowerTop = (count = 9) => (count - 1) * 0.5 + 0.53;
