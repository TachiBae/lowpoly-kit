import React, {useMemo} from 'react';
import * as THREE from 'three';
import {FIco, rng} from '../lowpoly';

type V3 = [number, number, number];

/**
 * Clustered set dressing. Places `count` items in a few clusters inside `area`
 * ([x0, x1, z0, z1] on the floor), skipping `avoid` rectangles (keep the subject clear).
 * Sizes come in tiers (many small, some medium, few large) for natural variety.
 * render(i, size, rand) returns the item; it is placed and rotated for you.
 */
export const Scatter: React.FC<{
  area: [number, number, number, number];
  count?: number;
  clusters?: number;
  seed?: number;
  y?: number;
  avoid?: [number, number, number, number][];
  render: (i: number, size: number, rand: () => number) => React.ReactNode;
}> = ({area, count = 14, clusters = 3, seed = 1, y = 0, avoid = [], render}) => {
  const items = useMemo(() => {
    const r = rng(seed);
    const [x0, x1, z0, z1] = area;
    const centers = [...Array(clusters)].map(() => [x0 + r() * (x1 - x0), z0 + r() * (z1 - z0)]);
    const out: {p: V3; rot: number; size: number}[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 20) {
      const c = centers[Math.floor(r() * clusters)];
      const spread = 0.25 + r() * 0.9;
      const x = c[0] + (r() - 0.5) * 2 * spread;
      const z = c[1] + (r() - 0.5) * 2 * spread;
      if (x < x0 || x > x1 || z < z0 || z > z1) continue;
      if (avoid.some(([ax0, ax1, az0, az1]) => x > ax0 && x < ax1 && z > az0 && z < az1)) continue;
      const t = r();
      const size = t < 0.6 ? 0.5 + r() * 0.3 : t < 0.9 ? 0.9 + r() * 0.4 : 1.4 + r() * 0.5;
      out.push({p: [x, y, z], rot: r() * Math.PI * 2, size});
    }
    return out;
  }, [area.join(), count, clusters, seed, y, JSON.stringify(avoid)]); // eslint-disable-line react-hooks/exhaustive-deps
  const r = useMemo(() => rng(seed + 101), [seed]);
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={it.p} rotation={[0, it.rot, 0]}>
          {render(i, it.size, r)}
        </group>
      ))}
    </group>
  );
};

/** Faceted pebbles / rocks for ground variety (use inside Scatter or alone). */
export const Pebble: React.FC<{size?: number; color?: string; seed?: number}> = ({size = 1, color = '#6E6A63', seed = 1}) => (
  <FIco radius={0.12 * size} detail={0} position={[0, 0.06 * size, 0]} scale={[1.2, 0.7, 1]} color={color} seed={seed} />
);

/** Ready-made ground clutter: pebble clusters in a few tones. */
export const Pebbles: React.FC<{area: [number, number, number, number]; count?: number; seed?: number; colors?: string[]; avoid?: [number, number, number, number][]}> = ({
  area,
  count = 16,
  seed = 5,
  colors = ['#6E6A63', '#7D776C', '#5A574F'],
  avoid,
}) => <Scatter area={area} count={count} seed={seed} avoid={avoid} render={(i, s) => <Pebble size={s} color={colors[i % colors.length]} seed={seed * 31 + i} />} />;

/**
 * Light spill from a screen or practical: a short-range coloured light plus a soft glow
 * patch on the floor below. Place it just in front of the screen.
 */
export const ScreenGlow: React.FC<{position: V3; color: string; intensity?: number; floorY?: number; radius?: number}> = ({
  position,
  color,
  intensity = 2.5,
  floorY = 0,
  radius = 1.1,
}) => {
  const uniforms = useMemo(() => ({uColor: {value: new THREE.Color(color)}}), [color]);
  return (
    <group>
      <pointLight position={position} color={color} intensity={intensity} distance={3.2} decay={2} />
      <mesh position={[position[0], floorY + 0.014, position[2] + 0.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[radius * 2, radius * 1.4]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          uniforms={uniforms}
          vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`uniform vec3 uColor; varying vec2 vUv; void main(){ float d = length(vUv * 2.0 - 1.0); gl_FragColor = vec4(uColor * 0.18 * pow(1.0 - smoothstep(0.0, 1.0, d), 2.0), 1.0); }`}
        />
      </mesh>
    </group>
  );
};
