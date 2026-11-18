import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useThree} from '@react-three/fiber';
import {paletteV2} from '../palette';
import type {KenneyId} from './kenneyIndex';

/**
 * Kenney CC0 model loader (public/kenney/<kit>/<name>.glb, 1,867 models; see docs/asset-library.md).
 * <Asset id="nature/tree_oak" position={[2,0,-3]} />
 * - Scaled to the character scale (a Person is ~2.5 units) by kit; override with `scale`.
 * - Materials become matte MeshStandardMaterial (unlit ones too) so they take our lights, shadows and AO.
 * - `harmonize` (0-1, default 0.3) pulls flat-coloured materials toward the nearest paletteV2 colour.
 * - `colors` replaces named materials, e.g. {leafsGreen: '#7E9A3A'}; `tint` multiplies everything.
 */
type V3 = [number, number, number];

export const KIT_SCALE: Record<string, number> = {
  nature: 2.8, furniture: 2.8, food: 1.4, car: 1.3, 'city-suburban': 7, 'city-commercial': 7,
  'city-roads': 7, 'city-industrial': 7, 'cube-pets': 0.6, 'mini-market': 1.7, space: 2,
  train: 1.5, holiday: 0.9, survival: 3.5, watercraft: 1.5, factory: 2, 'retro-urban': 4,
  'toy-car': 1.5, 'mini-forest': 3,
};

const cache = new Map<string, Promise<THREE.Group>>();
export const loadGLB = (id: string) => {
  let p = cache.get(id);
  if (!p) {
    p = new GLTFLoader().loadAsync(staticFile(`kenney/${id}.glb`)).then((g) => g.scene);
    cache.set(id, p);
  }
  return p;
};

const PAL = Object.values(paletteV2).map((c) => new THREE.Color(c));
const GREEN_LIGHT = new THREE.Color(paletteV2.grass), GREEN_DEEP = new THREE.Color(paletteV2.grassDeep);
export const nearest = (c: THREE.Color) => {
  let best = PAL[0], d = Infinity;
  const hc = {h: 0, s: 0, l: 0}; c.getHSL(hc);
  // Foliage (green to teal) maps to the palette greens, never to sky cyan.
  if (hc.h > 0.2 && hc.h < 0.5 && hc.s > 0.25) return hc.l > 0.45 ? GREEN_LIGHT : GREEN_DEEP;
  for (const p of PAL) {
    const hp = {h: 0, s: 0, l: 0}; p.getHSL(hp);
    const dh = Math.min(Math.abs(hc.h - hp.h), 1 - Math.abs(hc.h - hp.h));
    const dd = dh * 2 + Math.abs(hc.s - hp.s) * 0.6 + Math.abs(hc.l - hp.l);
    if (dd < d) { d = dd; best = p; }
  }
  return best;
};

export const Asset: React.FC<{
  id: KenneyId;
  position?: V3;
  rotation?: V3;
  scale?: number | V3;
  harmonize?: number;
  colors?: Record<string, string>;
  tint?: string;
  /** Lerp every flat colour toward `mix.color` by `mix.amount` (atmospheric recede). */
  mix?: {color: string; amount: number};
  /** World height in units (overrides kit scale). */
  fitHeight?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}> = ({id, position, rotation, scale, harmonize = 0.3, colors, tint, mix, fitHeight, castShadow = true, receiveShadow = true}) => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const advance = useThree((st) => st.advance);
  const [handle] = useState(() => delayRender(`asset ${id}`, {timeoutInMilliseconds: 60000}));
  useEffect(() => {
    let alive = true;
    loadGLB(id)
      .then((s) => { if (alive) setScene(s); })
      .catch((e) => { console.error('Asset failed', id, e); continueRender(handle); });
    return () => { alive = false; };
  }, [id, handle]);

  const obj = useMemo(() => {
    if (!scene) return null;
    const root = scene.clone(true);
    const tintC = tint ? new THREE.Color(tint) : null;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = castShadow;
      m.receiveShadow = receiveShadow;
      const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
      const out = mats.map((src) => {
        const map = src.map ?? null;
        if (map) { map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true; }
        const color = (src.color ?? new THREE.Color('#fff')).clone();
        if (colors && src.name && colors[src.name]) color.set(colors[src.name]);
        else if (!map && harmonize > 0) {
          const hsl = {h: 0, s: 0, l: 0}; color.getHSL(hsl);
          const foliage = hsl.h > 0.2 && hsl.h < 0.5 && hsl.s > 0.25;
          color.lerp(nearest(color), foliage ? Math.max(harmonize, 0.8) : harmonize);
        }
        if (tintC) color.multiply(tintC);
        if (mix) color.lerp(new THREE.Color(mix.color), mix.amount);
        return new THREE.MeshStandardMaterial({
          name: src.name, color, map, roughness: 0.85, metalness: 0,
          flatShading: !map, vertexColors: !!(m.geometry as THREE.BufferGeometry).attributes.color,
          transparent: src.transparent, opacity: src.opacity,
        });
      });
      m.material = Array.isArray(m.material) ? out : out[0];
    });
    return root;
  }, [scene, harmonize, colors, tint, mix?.color, mix?.amount, castShadow, receiveShadow]);

  // Release the frame only after the model is in the scene and a frame has been drawn.
  useEffect(() => {
    if (!obj) return;
    const t = setTimeout(() => {
      try { advance(performance.now()); } catch (e) { /* not inside a canvas yet */ }
      continueRender(handle);
    }, 0);
    return () => clearTimeout(t);
  }, [obj, handle, advance]);

  const kit = id.split('/')[0];
  if (!obj) return null;
  let s = scale ?? KIT_SCALE[kit] ?? 1;
  if (fitHeight) {
    const bb = new THREE.Box3().setFromObject(obj);
    const h = Math.max(0.001, bb.max.y - bb.min.y);
    s = fitHeight / h;
  }
  return <primitive object={obj} position={position} rotation={rotation} scale={typeof s === 'number' ? [s, s, s] : s} />;
};

/** Many copies of one or more models, placed by a seeded scatter (deterministic). */
export const AssetScatter: React.FC<{
  ids: KenneyId[];
  count: number;
  area: [number, number, number, number]; // xMin, xMax, zMin, zMax
  avoid?: [number, number, number, number][];
  seed?: number;
  scale?: [number, number]; // random multiplier range on the kit scale
  harmonize?: number;
}> = ({ids, count, area, avoid = [], seed = 1, scale = [0.8, 1.2], harmonize}) => {
  const items = useMemo(() => {
    let s = seed * 9301 + 49297;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const out: {id: KenneyId; p: V3; ry: number; k: number}[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 20) {
      const x = area[0] + r() * (area[1] - area[0]);
      const z = area[2] + r() * (area[3] - area[2]);
      if (avoid.some(([a, b, c, d]) => x > a && x < b && z > c && z < d)) continue;
      const id = ids[Math.floor(r() * ids.length)];
      out.push({id, p: [x, 0, z], ry: r() * Math.PI * 2, k: scale[0] + r() * (scale[1] - scale[0])});
    }
    return out;
  }, [ids, count, area, avoid, seed, scale]);
  return (
    <group>
      {items.map((it, i) => {
        const base = KIT_SCALE[it.id.split('/')[0]] ?? 1;
        return <Asset key={i} id={it.id} position={it.p} rotation={[0, it.ry, 0]} scale={base * it.k} harmonize={harmonize} />;
      })}
    </group>
  );
};
