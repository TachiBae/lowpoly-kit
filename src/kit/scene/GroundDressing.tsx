import React, {useMemo} from 'react';
import {Asset} from '../props/Asset';
import {InstancedScatter} from '../props/InstancedScatter';
import {FBox} from '../lowpoly';
import {paletteV2 as P} from '../palette';
import {Cam, half, lcg, localAround, worldToScreen} from '../frame';
import {SettingId} from './settings';
import type {KenneyId} from '../props/kenneyIndex';

type V3 = [number, number, number];
/** Place by screen x (`u`, -1..1) at local depth `dz`, or by local `dx`. `tall` items must not stand behind heads. */
type Slot = {id: KenneyId; u?: number; dx?: number; dz: number; tall?: boolean; front?: boolean; turn?: number; y?: number; scale?: number; fit?: number};
type Zone = [number, number, number, number]; // local dx min/max, dz min/max where nothing grows

/**
 * Mid-ground + ground, designed per setting (not random):
 * - hard surfaces (path, sidewalk, road, apron, rug) where grass never grows,
 * - a few props in fixed slots left/right of the subject group, aligned to the street/camera,
 *   dropped automatically if they would overlap the subject on screen,
 * - grass/flowers in 4-6 tidy clusters on soft ground only, never close to the camera.
 * `clear` = half-width (world units, along camera-right) of the subject group.
 */
export const GroundDressing: React.FC<{
  setting: SettingId;
  cam: Cam;
  subject?: V3;
  seed?: number;
  clear?: number;
  /** 0..1 multiplier on cluster count/size. */
  density?: number;
  /** Night preset: lamps glow and light the ground around them. */
  night?: boolean;
}> = ({setting, cam, subject = [0, 0, 0], seed = 1, clear = 0.8, density = 1, night = false}) => {
  const L = localAround(cam, subject);
  const [su] = worldToScreen(cam, [subject[0], 1.2, subject[2]]);
  const [eu] = worldToScreen(cam, L.at(clear + 0.35, 0)); // screen half-width of the subject group
  const uClear = Math.abs(eu - su);
  const D0 = worldToScreen(cam, [subject[0], 0.9, subject[2]])[2];
  /** local dx that lands at screen x = u for depth D0 + dz */
  const dxAt = (u: number, dz: number) => u * half(cam, D0 + dz).halfW - su * half(cam, D0).halfW;
  /** mowing stripes / paving seams: orderly texture on open ground (local strips along camera-right) */
  const stripes = (from: number, to: number, w: number, a: string, b: string) => (
    <group position={L.at(0, 0)} rotation={[0, L.rowYaw, 0]}>
      {Array.from({length: Math.ceil((to - from) / w)}, (_, i) => (
        <FBox key={i} size={[80, 0.012, w]} position={[0, 0.006, -(from + (i + 0.5) * w)]} color={i % 2 ? a : b} seed={seed + 300 + i} jitter={0.0004} />
      ))}
    </group>
  );

  // ---- per-setting design ------------------------------------------------------------
  let surfaces: React.ReactNode = null;
  let slots: Slot[] = [];
  let zones: Zone[] = [];
  let grass: KenneyId[] = [];
  let flower: KenneyId | null = null;
  let clusters: [number, number][] = []; // cluster centres as [u, dz]

  if (setting === 'suburb') {
    zones = [[-0.9, 0.9, -14, 0.6], [-40, 40, 2.2, 3.0]];
    surfaces = (
      <>
        {stripes(-14, 2.4, 1.6, '#B6C75A', '#9FB24A')}
        <group position={L.at(0, -6.6)} rotation={[0, L.rowYaw, 0]}>
          <FBox size={[1.5, 0.03, 14]} position={[0, 0.02, 0]} color="#E9D6A8" seed={seed + 21} jitter={0.002} />
        </group>
      </>
    );
    slots = [
      ...Array.from({length: 17}, (_, i): Slot => ({id: 'nature/fence_simple', dx: -12 + i * 1.5, dz: 2.6})),
      {id: 'holiday/bench', u: -0.66, dz: 1.3},
      {id: 'nature/plant_bushLarge', u: 0.7, dz: 1.0},
      {id: 'nature/tree_oak', u: 0.82, dz: 4.6, tall: true},
      {id: 'nature/tree_default', u: -0.88, dz: 5.2, tall: true},
    ];
    grass = ['nature/grass_large', 'nature/grass'];
    flower = 'nature/flower_yellowA';
    clusters = [[-0.78, 2.2], [0.8, 2.2], [-0.15, 2.3], [-0.85, -1.8], [0.86, -2.4]];
  }
  if (setting === 'downtown') {
    surfaces = (
      <group position={L.at(0, 0)} rotation={[0, L.rowYaw, 0]}>
        {/* sidewalk with paving seams, curb, road behind with a dashed centre line */}
        <FBox size={[80, 0.08, 16]} position={[0, 0.04, 5.2]} color={night ? '#7C84A6' : '#D9DCE6'} seed={seed + 21} jitter={0.001} />
        {Array.from({length: 11}, (_, i) => (
          <FBox key={'z' + i} size={[80, 0.01, 0.04]} position={[0, 0.085, 2.6 - i * 1.5]} color="#BEC3D1" seed={seed + 60 + i} jitter={0.0002} />
        ))}
        {Array.from({length: 40}, (_, i) => (
          <FBox key={'x' + i} size={[0.04, 0.01, 15]} position={[-30 + i * 1.5, 0.085, -4.9]} color="#BEC3D1" seed={seed + 120 + i} jitter={0.0002} />
        ))}
        <FBox size={[80, 0.14, 0.25]} position={[0, 0.07, -2.75]} color="#B7BCCB" seed={seed + 22} jitter={0.001} />
        {/* tree pits and a drain grate: flat detail that never blocks anyone */}
        {[-7.5, -1.5, 4.5].map((x, i) => (
          <FBox key={'pit' + i} size={[1.3, 0.1, 1.3]} position={[x, 0.05, -1.9]} color="#8A6A4A" seed={seed + 200 + i} jitter={0.001} />
        ))}
        <FBox size={[1.0, 0.1, 0.5]} position={[2.2, 0.05, 3.2]} color="#7D8496" seed={seed + 210} jitter={0.001} />
        <FBox size={[80, 0.04, 4.6]} position={[0, 0.02, -5.2]} color={P.asphalt} seed={seed + 23} jitter={0.001} />
        {Array.from({length: 27}, (_, i) => (
          <FBox key={i} size={[1.1, 0.05, 0.12]} position={[-39 + i * 3, 0.045, -5.2]} color="#F4F1EA" seed={seed + 40 + i} jitter={0.0005} />
        ))}
      </group>
    );
    slots = [
      {id: 'city-roads/light-square', u: -0.74, dz: 2.45, tall: true},
      {id: 'city-roads/light-square', u: 0.8, dz: 2.45, tall: true},
      {id: 'car/sedan', u: 0.62, dz: 4.3, turn: Math.PI / 2, scale: 0.95},
      {id: 'car/taxi', u: -0.75, dz: 6.2, turn: -Math.PI / 2, scale: 0.95},
      {id: 'nature/plant_bush', u: -0.86, dz: 1.6},
      {id: 'holiday/bench', u: 0.84, dz: 1.5},
    ];
  }
  if (setting === 'airfield') {
    zones = [[-40, 40, -9, -1.2]];
    surfaces = (
      <>
        {stripes(-1.2, 12, 1.8, '#B2C45A', '#97AB4A')}
        <group position={L.at(0, -5.2)} rotation={[0, L.rowYaw, 0]}>
          <FBox size={[80, 0.04, 8]} position={[0, 0.02, 0]} color={P.asphalt} seed={seed + 21} jitter={0.001} />
          <FBox size={[80, 0.05, 0.16]} position={[0, 0.045, 0.6]} color="#FFD84A" seed={seed + 22} jitter={0.0005} />
          <FBox size={[80, 0.05, 0.1]} position={[0, 0.045, -3.6]} color="#F4F1EA" seed={seed + 23} jitter={0.0005} />
          {Array.from({length: 20}, (_, i) => (
            <FBox key={i} size={[0.7, 0.05, 0.16]} position={[-30 + i * 3, 0.045, -1.6]} color="#F4F1EA" seed={seed + 80 + i} jitter={0.0005} />
          ))}
        </group>
      </>
    );
    slots = [
      ...Array.from({length: 12}, (_, i): Slot => ({id: 'city-roads/construction-light', dx: -16.5 + i * 3, dz: -1.05, scale: 0.9})),
      ...[0, 1, 2].map((i): Slot => ({id: 'car/cone', u: -0.6 - i * 0.12, dz: 0.5 + i * 0.5})),
      {id: 'survival/barrel', u: 0.68, dz: 0.5},
      {id: 'survival/barrel', u: 0.79, dz: 1.0},
      {id: 'car/truck-flat', u: 0.66, dz: 4.6, turn: Math.PI / 2, scale: 1.0},
    ];
    grass = ['nature/grass_large', 'nature/grass'];
    flower = null;
    clusters = [[-0.82, 1.6], [0.84, 2.4], [-0.2, 3.4]];
  }
  if (setting === 'newsroom') {
    surfaces = (
      <>
        {stripes(-14, 6, 1.2, '#C9CFDE', '#B4BCD2')}
        <group position={L.at(0, -4.6)} rotation={[0, L.rowYaw, 0]}>
          <FBox size={[3.4, 0.03, 7]} position={[0, 0.015, 0]} color="#2C3A6E" seed={seed + 25} jitter={0.001} />
          <FBox size={[3.0, 0.035, 6.6]} position={[0, 0.02, 0]} color="#34468A" seed={seed + 26} jitter={0.001} />
          {[-1.6, 1.6].map((x, i) => (
            <FBox key={i} size={[0.08, 0.04, 7]} position={[x, 0.025, 0]} color={P.cyan} emissive={P.cyan} emissiveIntensity={0.5} seed={seed + 27 + i} jitter={0.0003} />
          ))}
        </group>
        {/* raised presenter platform under the subject */}
        <group position={L.at(0, 0.2)} rotation={[0, L.rowYaw, 0]}>
          <FBox size={[clear * 2 + 2.6, 0.12, 2.6]} position={[0, 0.06, 0]} color="#E6EAF4" seed={seed + 21} jitter={0.001} />
          <FBox size={[clear * 2 + 2.6, 0.04, 0.08]} position={[0, 0.13, -1.28]} color={P.cyan} emissive={P.cyan} emissiveIntensity={0.8} seed={seed + 22} jitter={0.0003} />
        </group>
      </>
    );
    slots = [
      {id: 'furniture/desk', u: -0.72, dz: 1.5},
      {id: 'furniture/computerScreen', u: -0.72, dz: 1.5, y: 1.06},
      {id: 'furniture/chairModernCushion', u: 0.72, dz: 1.1},
      {id: 'furniture/lampSquareFloor', u: 0.9, dz: 2.4, tall: true},
      {id: 'furniture/speaker', u: -0.9, dz: 2.6, tall: true},
      {id: 'furniture/pottedPlant', u: -0.86, dz: -2.6},
      {id: 'furniture/pottedPlant', u: 0.88, dz: -3.4},
    ];
  }
  if (setting === 'home') {
    surfaces = <>{stripes(-16, 8, 0.9, '#D9A36A', '#CC955C')}</>;
    slots = [
      {id: 'furniture/rugRectangle', dx: 0, dz: 0.3, y: 0.012, scale: 4.2},
      {id: 'furniture/loungeSofa', u: -0.7, dz: 1.8},
      {id: 'furniture/tableCoffee', u: -0.62, dz: 0.9},
      {id: 'furniture/pottedPlant', u: 0.76, dz: 1.0},
      {id: 'furniture/lampRoundFloor', u: 0.9, dz: 2.2, tall: true},
      {id: 'furniture/rugRound', u: 0.1, dz: -3.6, y: 0.012, scale: 3.6},
      {id: 'furniture/pillowBlue', u: -0.72, dz: -2.4},
      {id: 'furniture/plantSmall1', u: 0.82, dz: -2.9},
    ];
  }
  if (setting === 'office') {
    surfaces = (
      <group position={L.at(0, 0)} rotation={[0, L.rowYaw, 0]}>
        {Array.from({length: 26}, (_, i) => (
          <FBox key={i} size={[0.03, 0.006, 40]} position={[-15 + i * 1.2, 0.003, 0]} color="#B57A44" seed={seed + 50 + i} jitter={0.0003} />
        ))}
      </group>
    );
    slots = [
      {id: 'furniture/rugRound', dx: 0, dz: 0, y: 0.012, scale: 4.2},
      {id: 'furniture/desk', u: -0.72, dz: 1.6},
      {id: 'furniture/computerScreen', u: -0.72, dz: 1.6, y: 1.06},
      {id: 'furniture/pottedPlant', u: 0.74, dz: 1.0},
      {id: 'furniture/trashcan', u: -0.45, dz: 2.2},
    ];
  }

  // ---- slots: keep only those that don't overlap the subject group on screen ----------
  const placed = useMemo(
    () =>
      slots.flatMap((s, k) => {
        const dx = s.u !== undefined ? dxAt(s.u, s.dz) : s.dx ?? 0;
        const p = L.at(dx, s.dz);
        const [u, , depth] = worldToScreen(cam, p);
        if (depth < 2 || Math.abs(u) > 1.25) return [];
        const overlaps = Math.abs(u - su) < uClear + 0.06;
        // in front of the subjects: never overlap them; behind: only tall things (lamps, trees) can clash with heads
        if (overlaps && !s.id.startsWith('furniture/rug') && (s.dz < 0.8 || s.tall)) return [];
        return [{k, s, p: [p[0], s.y ?? 0, p[2]] as V3}];
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setting, cam, subject[0], subject[2], clear],
  );

  // ---- clustered grass on soft ground ---------------------------------------------------
  const {grassPts, flowerPts} = useMemo(() => {
    const r = lcg(seed * 13 + 1);
    const g: V3[] = [];
    const fl: V3[] = [];
    const inZone = (dx: number, dz: number) => zones.some(([a, b, c, d]) => dx > a && dx < b && dz > c && dz < d);
    clusters.slice(0, Math.max(1, Math.round(clusters.length * density))).forEach(([cx, cz], ci) => {
      const n = Math.round((7 + r() * 5) * density);
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.75;
        const dx = dxAt(cx, cz) + Math.cos(a) * rad, dz = cz + Math.sin(a) * rad * 0.7;
        if (inZone(dx, dz)) continue;
        if (Math.hypot(dx, dz) < clear + 0.5) continue;
        const p = L.at(dx, dz);
        const [, , depth] = worldToScreen(cam, p);
        if (depth < 4.5) continue;
        (flower && ci % 2 === 0 && i % 3 === 0 ? fl : g).push(p);
      }
    });
    return {grassPts: g, flowerPts: fl};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting, cam, subject[0], subject[2], clear, seed, density]);

  return (
    <group>
      {surfaces}
      {placed.map(({k, s, p}) => {
        const yaw = L.faceYaw + (s.turn ?? 0);
        // street lamp head: model top (y 0.6) reaching 0.18 back along -z, at kit scale 7
        const hx = p[0] - 1.26 * Math.sin(yaw), hz = p[2] - 1.26 * Math.cos(yaw);
        return (
          <React.Fragment key={k}>
            <Asset id={s.id} position={p} rotation={[0, yaw, 0]} scale={s.scale} fitHeight={s.fit} castShadow={!s.id.startsWith('furniture/rug')} />
            {night && s.id === 'city-roads/light-square' && (
              <>
                <mesh position={[hx, 3.98, hz]} rotation={[0, yaw, 0]} scale={[1.6, 0.35, 3.2]}>
                  <sphereGeometry args={[0.12, 14, 8]} />
                  <meshBasicMaterial color="#FFE6B8" toneMapped={false} />
                </mesh>
                <pointLight position={[hx, 3.6, hz]} color="#FFC27A" intensity={14} distance={8} decay={2} />
              </>
            )}
          </React.Fragment>
        );
      })}
      {grass.length > 0 && grassPts.length > 0 && <InstancedScatter ids={grass} points={grassPts} seed={seed * 5 + 2} scale={[0.45, 0.75]} />}
      {flower && flowerPts.length > 0 && <InstancedScatter ids={[flower]} points={flowerPts} seed={seed * 5 + 3} scale={[0.6, 0.9]} />}
    </group>
  );
};
