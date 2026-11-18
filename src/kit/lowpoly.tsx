import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {useEdge, useLook} from './look';
import {FMat, SMat} from './materials';

// Deterministic random (mulberry32) so every render looks identical.
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Turns any geometry into the faceted low poly look:
 * welds vertices, nudges each one a little (seeded), then splits faces
 * so every triangle gets its own flat normal.
 */
export const facet = (geo: THREE.BufferGeometry, jitter = 0.04, seed = 1) => {
  let g = geo.clone();
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const r = rng(seed);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(
      i,
      p.getX(i) + (r() - 0.5) * 2 * jitter,
      p.getY(i) + (r() - 0.5) * 2 * jitter,
      p.getZ(i) + (r() - 0.5) * 2 * jitter,
    );
  }
  g = g.toNonIndexed();
  g.computeVertexNormals();
  shadeFacets(g, seed);
  return g;
};

/**
 * v2 facet shading, stored as vertex colours (only used when the material turns
 * vertexColors on, so v1 renders are unaffected):
 *  - each triangle gets a small seeded tone shift, so flat faces read as hand-cut facets;
 *  - each object darkens and cools toward its base (fake bounce/occlusion).
 */
const shadeFacets = (g: THREE.BufferGeometry, seed: number) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const h = Math.max(bb.max.y - bb.min.y, 1e-4);
  const r = rng(seed * 7 + 13);
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i += 3) {
    const cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    let t = (cy - bb.min.y) / h;
    t = t * t * (3 - 2 * t);
    const tone = 1 + (r() - 0.5) * 0.14; // ±7% per facet
    const base = (0.76 + 0.24 * t) * tone;
    const cool = 1 - t;
    const rgb = [base * (1 - 0.05 * cool), base * (1 - 0.015 * cool), base * (1 + 0.04 * cool)];
    for (let k = 0; k < 3; k++) col.set(rgb, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
};

type V3 = [number, number, number];

type Common = {
  color: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  seed?: number;
  jitter?: number;
  emissive?: string;
  emissiveIntensity?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  opacity?: number;
  roughness?: number;
};

const Mesh: React.FC<Common & {geo: THREE.BufferGeometry}> = ({
  geo,
  color,
  position,
  rotation,
  scale,
  emissive,
  emissiveIntensity,
  castShadow = true,
  receiveShadow = true,
  opacity,
  roughness,
}) => {
  const v2 = useLook() === 'v2';
  return (
  <mesh
    geometry={geo}
    position={position}
    rotation={rotation}
    scale={scale}
    castShadow={castShadow}
    receiveShadow={receiveShadow}
  >
    <FMat color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} opacity={opacity} roughness={roughness} vertexColors={v2} />
  </mesh>
  );
};

/** Faceted box. */
export const FBox: React.FC<Common & {size: V3; segments?: number}> = ({
  size,
  segments = 1,
  seed = 1,
  jitter = 0.03,
  ...rest
}) => {
  const v2 = useLook() === 'v2';
  const soft = useEdge() === 'soft';
  const geo = useMemo(() => {
    // v2: chamfered edges (one bevel step) that catch light; segmented boxes stay plain.
    const bevel = soft ? Math.min(0.12, Math.min(size[0], size[1], size[2]) * 0.22) : Math.min(0.07, Math.min(size[0], size[1], size[2]) * 0.12);
    // v2: big surfaces (floors, walls) get subdivided so they facet into low-poly terrain.
    const big = v2 && segments === 1 && Math.max(size[0], size[1], size[2]) > 3;
    const seg = (n: number) => (big ? Math.min(14, Math.max(1, Math.ceil(n / 1.1))) : segments);
    const base =
      v2 && segments === 1 && !big && bevel > 0.004
        ? new RoundedBoxGeometry(size[0], size[1], size[2], soft ? 3 : 1, bevel)
        : new THREE.BoxGeometry(size[0], size[1], size[2], seg(size[0]), seg(size[1]), seg(size[2]));
    return facet(base, jitter, seed);
  }, [size[0], size[1], size[2], segments, jitter, seed, v2, soft]);
  return <Mesh geo={geo} {...rest} />;
};

/** Faceted icosphere: rocks, hair clumps, clouds, bags. detail 0-2. */
export const FIco: React.FC<Common & {radius: number; detail?: number}> = ({
  radius,
  detail = 1,
  seed = 1,
  jitter,
  ...rest
}) => {
  const j = jitter ?? radius * 0.08;
  const geo = useMemo(() => facet(new THREE.IcosahedronGeometry(radius, detail), j, seed), [radius, detail, j, seed]);
  return <Mesh geo={geo} {...rest} />;
};

/** Faceted cylinder / cone: limbs, sleeves, torsos, pawns. */
export const FCyl: React.FC<
  Common & {rTop: number; rBottom: number; height: number; radial?: number; heightSegs?: number}
> = ({rTop, rBottom, height, radial = 7, heightSegs = 1, seed = 1, jitter = 0.02, ...rest}) => {
  const geo = useMemo(
    () => facet(new THREE.CylinderGeometry(rTop, rBottom, height, radial, heightSegs), jitter, seed),
    [rTop, rBottom, height, radial, heightSegs, jitter, seed],
  );
  return <Mesh geo={geo} {...rest} />;
};

/** Smooth clay sphere (faces, hands, noses). */
export const SBall: React.FC<
  Omit<Common, 'seed' | 'jitter'> & {radius: number; roughness?: number}
> = ({radius, color, position, rotation, scale, emissive, emissiveIntensity, roughness, castShadow = true}) => (
  <mesh position={position} rotation={rotation} scale={scale} castShadow={castShadow} receiveShadow>
    <sphereGeometry args={[radius, 48, 32]} />
    <SMat color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={roughness} />
  </mesh>
);

/** Smooth capsule (eyebrows, fingers, mouths). */
export const SCapsule: React.FC<
  Omit<Common, 'seed' | 'jitter'> & {radius: number; length: number}
> = ({radius, length, color, position, rotation, scale, emissive, emissiveIntensity}) => (
  <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
    <capsuleGeometry args={[radius, length, 8, 16]} />
    <SMat color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
  </mesh>
);
