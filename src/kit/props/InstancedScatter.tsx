import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender} from 'remotion';
import {useThree} from '@react-three/fiber';
import {KIT_SCALE, loadGLB, nearest} from './Asset';
import type {KenneyId} from './kenneyIndex';
import {lcg} from '../frame';

type V3 = [number, number, number];

/**
 * Cheap dense scatter: one InstancedMesh per mesh of each model (so 150 tufts cost a few draw calls).
 * `points` are ground positions (use screenToGround to sample the visible wedge). Deterministic via `seed`.
 */
export const InstancedScatter: React.FC<{
  ids: KenneyId[];
  points: V3[];
  seed?: number;
  scale?: [number, number];
  harmonize?: number;
}> = ({ids, points, seed = 1, scale = [0.7, 1.2], harmonize = 0.3}) => {
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender('instanced scatter', {timeoutInMilliseconds: 60000}));
  const [models, setModels] = useState<Record<string, THREE.Group> | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(ids.map((id) => loadGLB(id).then((g) => [id, g] as const)))
      .then((e) => { if (alive) setModels(Object.fromEntries(e)); })
      .catch((e) => { console.error('InstancedScatter failed', e); continueRender(handle); });
    return () => { alive = false; };
  }, [ids.join('|'), handle]);

  const group = useMemo(() => {
    if (!models) return null;
    const r = lcg(seed);
    const root = new THREE.Group();
    const buckets: Record<string, {p: V3; ry: number; k: number}[]> = {};
    for (const p of points) {
      const id = ids[Math.floor(r() * ids.length)];
      (buckets[id] ||= []).push({p, ry: r() * Math.PI * 2, k: scale[0] + r() * (scale[1] - scale[0])});
    }
    for (const id of Object.keys(buckets)) {
      const model = models[id].clone(true);
      model.updateMatrixWorld(true);
      const base = KIT_SCALE[id.split('/')[0]] ?? 1;
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const src = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
        const c = (src.color ?? new THREE.Color('#fff')).clone();
        const hsl = {h: 0, s: 0, l: 0}; c.getHSL(hsl);
        const foliage = hsl.h > 0.2 && hsl.h < 0.5 && hsl.s > 0.25;
        c.lerp(nearest(c), foliage ? Math.max(harmonize, 0.8) : harmonize);
        const mat = new THREE.MeshStandardMaterial({color: c, roughness: 0.85, flatShading: true, vertexColors: !!m.geometry.attributes.color});
        const inst = new THREE.InstancedMesh(m.geometry, mat, buckets[id].length);
        const mm = new THREE.Matrix4(), t = new THREE.Matrix4();
        buckets[id].forEach((b, i) => {
          t.compose(new THREE.Vector3(...b.p), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.ry, 0)), new THREE.Vector3().setScalar(base * b.k));
          mm.multiplyMatrices(t, m.matrixWorld);
          inst.setMatrixAt(i, mm);
        });
        inst.instanceMatrix.needsUpdate = true;
        inst.frustumCulled = false;
        inst.receiveShadow = true;
        inst.castShadow = buckets[id].length < 60;
        root.add(inst);
      });
    }
    return root;
  }, [models, points, seed, scale[0], scale[1], harmonize]);

  useEffect(() => {
    if (!group) return;
    const t = setTimeout(() => {
      try { advance(performance.now()); } catch (e) { /* no canvas yet */ }
      continueRender(handle);
    }, 0);
    return () => clearTimeout(t);
  }, [group, handle, advance]);

  return group ? <primitive object={group} /> : null;
};
