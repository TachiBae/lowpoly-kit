import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Asset} from '../props/Asset';
import {FBox} from '../lowpoly';
import {paletteV2 as P} from '../palette';
import {Cam, faceCamYaw, flat, half, lcg} from '../frame';
import {SettingId, settings} from './settings';

type V3 = [number, number, number];

const lerpHex = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

/** Flat jagged silhouette (hills or skyline) that fades into the sky colour. */
const HorizonCard: React.FC<{cam: Cam; d: number; kind: 'hills' | 'skyline'; color: string; seed: number}> = ({cam, d, kind, color, seed}) => {
  const {f} = flat(cam);
  const centre: V3 = [cam.pos[0] + f.x * d, -0.5, cam.pos[2] + f.z * d];
  const W = half(cam, d).halfW * 2 * 1.7;
  const geo = useMemo(() => {
    const r = lcg(seed);
    const sh = new THREE.Shape();
    sh.moveTo(-W / 2, 0);
    if (kind === 'hills') {
      const n = 48, ph1 = r() * 6.28, ph2 = r() * 6.28;
      for (let i = 0; i <= n; i++) {
        const x = -W / 2 + (i / n) * W;
        sh.lineTo(x, 3.2 + 1.8 * Math.sin(x * 0.09 + ph1) + 0.8 * Math.sin(x * 0.23 + ph2));
      }
    } else {
      let x = -W / 2;
      while (x < W / 2) {
        const w = 2 + r() * 3, h = 4 + r() * 12;
        sh.lineTo(x, h); sh.lineTo(x + w, h); x += w + 0.1 + r() * 0.4;
      }
    }
    sh.lineTo(W / 2, 0); sh.lineTo(-W / 2, 0);
    return new THREE.ShapeGeometry(sh);
  }, [W, kind, seed]);
  return (
    <mesh geometry={geo} position={centre} rotation={[0, faceCamYaw(cam, centre), 0]}>
      <meshBasicMaterial color={color} fog={false} />
    </mesh>
  );
};

/** Fill one depth band as a tidy row: one shared facing, small depth jitter, no two trees in a row. */
const Band: React.FC<{cam: Cam; setting: SettingId; which: 'near' | 'far'; d: number; seed: number; haze: string; hazeAmt: number; avoid: V3; avoidR: number}> = ({cam, setting, which, d, seed, haze, hazeAmt, avoid, avoidR}) => {
  const items = settings[setting][which];
  const placed = useMemo(() => {
    if (!items.length) return [];
    const r = lcg(seed);
    const {f, r: right} = flat(cam);
    const yaw = Math.atan2(-f.x, -f.z); // every item faces the camera direction (parallel to the row)
    const W = half(cam, d).halfW * 2 * 1.5;
    const isTree = (i: number) => items[i].id.startsWith('nature/');
    const out: {i: number; p: V3; ry: number}[] = [];
    let x = -W / 2;
    let prevTree = false;
    while (x < W / 2) {
      let idx = Math.floor(r() * items.length);
      if (prevTree && isTree(idx)) idx = items.findIndex((_, k) => !isTree(k));
      const it = items[idx];
      const depth = d + (r() - 0.5) * 0.8 + (isTree(idx) ? -1.2 : 0); // trees sit just in front of the row
      const cx = x + it.w / 2;
      const px = cam.pos[0] + f.x * depth + right.x * cx;
      const pz = cam.pos[2] + f.z * depth + right.z * cx;
      if (Math.hypot(px - avoid[0], pz - avoid[2]) >= avoidR) out.push({i: idx, p: [px, 0, pz], ry: yaw + (isTree(idx) ? r() * 6.28 : 0)});
      prevTree = isTree(idx);
      x += it.w + 0.25 + r() * 0.5;
    }
    return out;
  }, [cam, items, d, seed, avoid, avoidR]);
  return (
    <group>
      {placed.map((o, k) => (
        <Asset key={k} id={items[o.i].id} position={o.p} rotation={[0, o.ry, 0]} scale={items[o.i].scale} mix={{color: haze, amount: hazeAmt}} castShadow={which === 'near'} />
      ))}
    </group>
  );
};

/**
 * Background layer: ground plane, near band, far band, horizon cards (outdoor) or a back wall (office).
 * `subject` = where the subject stands (ground); items within `avoidR` of it are skipped.
 */
export const Backdrop: React.FC<{
  setting: SettingId;
  cam: Cam;
  seed?: number;
  skyHorizon: string;
  subject?: V3;
  avoidR?: number;
}> = ({setting, cam, seed = 1, skyHorizon, subject = [0, 0, 0], avoidR = 3}) => {
  const S = settings[setting];
  const {f, r} = flat(cam);
  if (setting === 'newsroom' || setting === 'home') {
    const news = setting === 'newsroom';
    const d = Math.hypot(subject[0] - cam.pos[0], subject[2] - cam.pos[2]) + 3.4;
    const c: V3 = [cam.pos[0] + f.x * d, 0, cam.pos[2] + f.z * d];
    const W = half(cam, d).halfW * 2 * 1.7, H = half(cam, d).halfH * 2 + 3;
    const yaw = faceCamYaw(cam, c);
    const wall = news ? '#DDE3F2' : lerpHex(P.tan, '#FFFFFF', 0.45);
    return (
      <group>
        <FBox size={[60, 0.2, 60]} position={[0, -0.1, 0]} color={S.ground} seed={seed + 1} jitter={0.004} />
        <group position={c} rotation={[0, yaw, 0]}>
          <FBox size={[W, H, 0.3]} position={[0, H / 2 - 0.2, 0]} color={wall} seed={seed + 2} jitter={0.004} />
          <FBox size={[W, 0.35, 0.4]} position={[0, 0.15, 0.1]} color={news ? '#AEB6CC' : lerpHex(P.wood, '#FFFFFF', 0.25)} seed={seed + 3} jitter={0.004} />
          {news ? (
            <>
              {/* big screen wall with abstract bar chart + trend line (no text, no logos) */}
              <FBox size={[4.6, 2.6, 0.12]} position={[0, 2.7, 0.2]} color="#0E2A4A" emissive="#0E2A4A" emissiveIntensity={0.4} seed={seed + 4} jitter={0.001} />
              <FBox size={[4.9, 2.9, 0.08]} position={[0, 2.7, 0.14]} color="#2E3348" seed={seed + 5} jitter={0.001} />
              {[0.7, 1.1, 0.9, 1.6, 1.3].map((h, i) => (
                <FBox key={i} size={[0.5, h, 0.06]} position={[-1.6 + i * 0.8, 1.6 + h / 2, 0.3]} color={[P.cyan, P.pink, P.sun, P.mint, P.orange][i]} emissive={[P.cyan, P.pink, P.sun, P.mint, P.orange][i]} emissiveIntensity={0.9} seed={seed + 10 + i} jitter={0.0005} />
              ))}
              <FBox size={[3.9, 0.06, 0.05]} position={[0, 3.55, 0.31]} rotation={[0, 0, 0.12]} color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} seed={seed + 16} jitter={0.0003} />
              {/* side panels in accent colours + studio lights along the top */}
              <FBox size={[1.2, 3.2, 0.1]} position={[-W * 0.32, 2.2, 0.2]} color={P.violet} seed={seed + 17} jitter={0.001} />
              <FBox size={[1.2, 3.2, 0.1]} position={[W * 0.32, 2.2, 0.2]} color={P.cyan} seed={seed + 18} jitter={0.001} />
              {[-2.4, -0.8, 0.8, 2.4].map((x, i) => (
                <FBox key={'l' + i} size={[0.5, 0.18, 0.3]} position={[x, 4.6, 0.4]} color="#FFF6E0" emissive="#FFF6E0" emissiveIntensity={1.4} seed={seed + 20 + i} jitter={0.0005} />
              ))}
            </>
          ) : (
            <>
              {/* window with a suburb view, wall art, bookcase and lamp */}
              <FBox size={[3.0, 2.2, 0.12]} position={[-W * 0.14, 2.6, 0.2]} color={skyHorizon} emissive={skyHorizon} emissiveIntensity={0.35} seed={seed + 4} jitter={0.002} />
              <FBox size={[3.0, 0.7, 0.13]} position={[-W * 0.14, 1.85, 0.21]} color={lerpHex(S.silhouette, skyHorizon, 0.3)} seed={seed + 5} jitter={0.002} />
              <FBox size={[3.3, 0.14, 0.22]} position={[-W * 0.14, 3.75, 0.3]} color="#FFFFFF" seed={seed + 6} jitter={0.002} />
              <FBox size={[3.3, 0.14, 0.22]} position={[-W * 0.14, 1.45, 0.3]} color="#FFFFFF" seed={seed + 7} jitter={0.002} />
              <FBox size={[0.14, 2.4, 0.22]} position={[-W * 0.14 - 1.6, 2.6, 0.3]} color="#FFFFFF" seed={seed + 8} jitter={0.002} />
              <FBox size={[0.14, 2.4, 0.22]} position={[-W * 0.14 + 1.6, 2.6, 0.3]} color="#FFFFFF" seed={seed + 9} jitter={0.002} />
              <FBox size={[0.1, 2.4, 0.2]} position={[-W * 0.14, 2.6, 0.3]} color="#FFFFFF" seed={seed + 19} jitter={0.002} />
              <FBox size={[1.3, 0.9, 0.08]} position={[W * 0.16, 3.0, 0.2]} color={P.sun} seed={seed + 10} jitter={0.002} />
              <FBox size={[0.8, 1.1, 0.08]} position={[W * 0.16 + 1.25, 2.8, 0.2]} color={P.pink} seed={seed + 11} jitter={0.002} />
              <Asset id="furniture/bookcaseOpenLow" position={[W * 0.3, 0, 0.7]} scale={3.2} />
              <Asset id="furniture/lampWall" position={[W * 0.16 + 0.6, 2.1, 0.3]} scale={3} />
            </>
          )}
        </group>
      </group>
    );
  }
  if (setting === 'office') {
    const d = Math.hypot(subject[0] - cam.pos[0], subject[2] - cam.pos[2]) + 3.2;
    const c: V3 = [cam.pos[0] + f.x * d, 0, cam.pos[2] + f.z * d];
    const W = half(cam, d).halfW * 2 * 1.7, H = half(cam, d).halfH * 2 + 3;
    const yaw = faceCamYaw(cam, c);
    return (
      <group>
        <FBox size={[60, 0.2, 60]} position={[0, -0.1, 0]} color={S.ground} seed={seed + 1} jitter={0.004} />
        <group position={c} rotation={[0, yaw, 0]}>
          <FBox size={[W, H, 0.3]} position={[0, H / 2 - 0.2, 0]} color={lerpHex(P.tan, '#FFFFFF', 0.35)} seed={seed + 2} jitter={0.004} />
          <FBox size={[W, 0.35, 0.4]} position={[0, 0.15, 0.1]} color={lerpHex(P.wood, '#FFFFFF', 0.25)} seed={seed + 3} jitter={0.004} />
          {/* window with a city behind it */}
          <FBox size={[2.8, 2.1, 0.12]} position={[-W * 0.12, 2.6, 0.2]} color="#CFE6F5" seed={seed + 4} jitter={0.002} emissive="#CFE6F5" emissiveIntensity={0.35} />
          <FBox size={[3.1, 0.14, 0.22]} position={[-W * 0.12, 3.7, 0.3]} color="#FFFFFF" seed={seed + 5} jitter={0.002} />
          <FBox size={[3.1, 0.14, 0.22]} position={[-W * 0.12, 1.5, 0.3]} color="#FFFFFF" seed={seed + 6} jitter={0.002} />
          <FBox size={[0.14, 2.3, 0.22]} position={[-W * 0.12 - 1.5, 2.6, 0.3]} color="#FFFFFF" seed={seed + 7} jitter={0.002} />
          <FBox size={[0.14, 2.3, 0.22]} position={[-W * 0.12 + 1.5, 2.6, 0.3]} color="#FFFFFF" seed={seed + 8} jitter={0.002} />
          {/* wall art */}
          <FBox size={[1.0, 1.3, 0.08]} position={[W * 0.14, 2.9, 0.2]} color={P.pink} seed={seed + 9} jitter={0.002} />
          <FBox size={[1.5, 1.0, 0.08]} position={[W * 0.14 + 1.5, 2.5, 0.2]} color={P.cyan} seed={seed + 10} jitter={0.002} />
          <FBox size={[0.8, 0.8, 0.08]} position={[W * 0.14 + 0.2, 1.5, 0.2]} color={P.sun} seed={seed + 11} jitter={0.002} />
          <Asset id="furniture/bookcaseOpen" position={[W * 0.3, 0, 0.7]} scale={3.4} />
          <Asset id="furniture/lampWall" position={[-W * 0.12 + 2.6, 3.0, 0.3]} scale={3} />
        </group>
      </group>
    );
  }
  return (
    <group>
      <FBox size={[200, 0.2, 200]} position={[subject[0], -0.1, subject[2]]} color={S.ground} seed={seed + 1} jitter={0.004} />
      <Band cam={cam} setting={setting} which="far" d={36} seed={seed * 7 + 2} haze={skyHorizon} hazeAmt={0.5} avoid={subject} avoidR={avoidR} />
      <Band cam={cam} setting={setting} which="near" d={18} seed={seed * 7 + 1} haze={skyHorizon} hazeAmt={0.15} avoid={subject} avoidR={avoidR} />
      <HorizonCard cam={cam} d={45} kind={S.horizon} color={lerpHex(S.silhouette, skyHorizon, 0.45)} seed={seed * 5 + 3} />
      <HorizonCard cam={cam} d={60} kind={S.horizon} color={lerpHex(S.silhouette, skyHorizon, 0.65)} seed={seed * 5 + 4} />
    </group>
  );
};
