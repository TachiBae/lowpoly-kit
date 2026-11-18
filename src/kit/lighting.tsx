import React, {useMemo} from 'react';
import * as THREE from 'three';
import type {Look} from './look';

type V3 = [number, number, number];

export type LightPreset = {
  skyTop: string;
  skyHorizon: string;
  key: {color: string; intensity: number; position: V3};
  rim: {color: string; intensity: number; position: V3};
  fill: {sky: string; ground: string; intensity: number};
  /** Soft light from the camera side so skin keeps its color under colored keys. */
  face: {color: string; intensity: number};
  fog: {color: string; near: number; far: number};
  bloom: number;
  vignette: number;
  exposure: number;
  /** v2-look settings (ignored by v1). */
  v2?: LookV2;
};

/** v2 look: cool shadow-side light, rim boost, ambient occlusion, ground haze, colour grade. */
export type LookV2 = {
  /** Cool light from the side opposite the key, so shadow sides read cool instead of flat. */
  cool: {color: string; intensity: number};
  /** Multiplier on the rim light. */
  rimBoost: number;
  /** Ambient occlusion: contact shading, tinted (never pure black). radius in world units. */
  ao: {intensity: number; radius: number; color: string};
  /** Low-lying haze that thickens with distance and near the ground. */
  haze: {color: string; height: number; density: number};
  /** Split-tone grade after tone mapping. amount 0-1, sat/contrast around 1. */
  grade: {shadows: string; highlights: string; amount: number; sat: number; contrast: number};
};

// Light rigs as data. Shots name a preset id; blends are a lerp between two.
export const presets = {
  midnightMonitor: {
    skyTop: '#0A1532',
    skyHorizon: '#27468A',
    key: {color: '#4FD6E8', intensity: 160, position: [-4, 6, 6]},
    rim: {color: '#FFB04A', intensity: 7, position: [5, 7, -6]},
    fill: {sky: '#4A62B8', ground: '#0C1226', intensity: 1.5},
    face: {color: '#FFE4CC', intensity: 1.1},
    fog: {color: '#1C2D5E', near: 16, far: 52},
    bloom: 1.2,
    vignette: 0.55,
    exposure: 1.0,
    v2: {cool: {color: '#3D5BD9', intensity: 0.65}, rimBoost: 1.8, ao: {intensity: 3, radius: 0.7, color: '#0A1030'}, haze: {color: '#26407A', height: 0.9, density: 0.48}, grade: {shadows: '#2A4FA8', highlights: '#FFD3A0', amount: 0.17, sat: 1.08, contrast: 1.06}},
  },
  alarmRed: {
    skyTop: '#1A0405',
    skyHorizon: '#5A0E0B',
    key: {color: '#FF3B2F', intensity: 140, position: [-4, 6, 6]},
    rim: {color: '#FF7A3A', intensity: 6, position: [5, 7, -6]},
    fill: {sky: '#5A1A1A', ground: '#0C0404', intensity: 0.7},
    face: {color: '#FFC2B0', intensity: 0.7},
    fog: {color: '#2A0807', near: 12, far: 42},
    bloom: 1.4,
    vignette: 0.6,
    exposure: 1.0,
    v2: {cool: {color: '#6A3AA0', intensity: 0.35}, rimBoost: 1.6, ao: {intensity: 3, radius: 0.7, color: '#1A0508'}, haze: {color: '#3E100C', height: 0.9, density: 0.42}, grade: {shadows: '#4A1440', highlights: '#FFB27A', amount: 0.14, sat: 1.05, contrast: 1.08}},
  },
  goldenHour: {
    skyTop: '#F28C5C',
    skyHorizon: '#FFE0A8',
    key: {color: '#FFC27A', intensity: 120, position: [-7, 4, 5]},
    rim: {color: '#FF8AA8', intensity: 4, position: [6, 5, -6]},
    fill: {sky: '#FFD6B0', ground: '#6B4A3A', intensity: 1.2},
    face: {color: '#FFE8D0', intensity: 0.8},
    fog: {color: '#F5C79A', near: 18, far: 60},
    bloom: 0.8,
    vignette: 0.35,
    exposure: 1.0,
    v2: {cool: {color: '#6E86D8', intensity: 0.55}, rimBoost: 1.6, ao: {intensity: 2.5, radius: 0.7, color: '#3A2448'}, haze: {color: '#F2C49A', height: 1.0, density: 0.28}, grade: {shadows: '#5562B0', highlights: '#FFC890', amount: 0.17, sat: 1.06, contrast: 1.04}},
  },
  neonNight: {
    skyTop: '#0B0420',
    skyHorizon: '#3B0F5C',
    key: {color: '#FF3DCB', intensity: 110, position: [-5, 5, 5]},
    rim: {color: '#2EF2FF', intensity: 7, position: [5, 6, -5]},
    fill: {sky: '#4A1A7A', ground: '#08020F', intensity: 1.0},
    face: {color: '#FFD8F0', intensity: 0.8},
    fog: {color: '#1E0838', near: 12, far: 44},
    bloom: 1.5,
    vignette: 0.5,
    exposure: 1.0,
    v2: {cool: {color: '#2EE6FF', intensity: 0.45}, rimBoost: 1.6, ao: {intensity: 3, radius: 0.7, color: '#12042A'}, haze: {color: '#2C1052', height: 0.9, density: 0.48}, grade: {shadows: '#3A1A8A', highlights: '#FFB8E8', amount: 0.17, sat: 1.1, contrast: 1.06}},
  },
  overcastMorning: {
    skyTop: '#BFD4EA',
    skyHorizon: '#EEF1F4',
    key: {color: '#F2F6FF', intensity: 70, position: [-3, 8, 5]},
    rim: {color: '#FFE7C7', intensity: 2, position: [5, 6, -5]},
    fill: {sky: '#DCE8F5', ground: '#8A9099', intensity: 1.6},
    face: {color: '#FFFFFF', intensity: 0.6},
    fog: {color: '#E3E9F0', near: 20, far: 70},
    bloom: 0.3,
    vignette: 0.25,
    exposure: 1.0,
    v2: {cool: {color: '#9DB6E6', intensity: 0.35}, rimBoost: 1.5, ao: {intensity: 2, radius: 0.7, color: '#4A5670'}, haze: {color: '#E3E9F0', height: 1.1, density: 0.36}, grade: {shadows: '#7086B8', highlights: '#FFF0DA', amount: 0.11, sat: 1.04, contrast: 1.03}},
  },
  lampLitCozy: {
    skyTop: '#05040A',
    skyHorizon: '#1A1208',
    key: {color: '#FFB25E', intensity: 90, position: [3, 4, 3]},
    rim: {color: '#6A7BFF', intensity: 2.5, position: [-5, 6, -5]},
    fill: {sky: '#2A1C10', ground: '#050302', intensity: 0.6},
    face: {color: '#FFD9AA', intensity: 0.6},
    fog: {color: '#0E0A06', near: 10, far: 36},
    bloom: 1.1,
    vignette: 0.65,
    exposure: 1.0,
    v2: {cool: {color: '#4A5CC8', intensity: 0.3}, rimBoost: 1.8, ao: {intensity: 3, radius: 0.7, color: '#08050E'}, haze: {color: '#22160C', height: 0.8, density: 0.42}, grade: {shadows: '#24306A', highlights: '#FFC27A', amount: 0.17, sat: 1.06, contrast: 1.06}},
  },
  duskGlow: {
    skyTop: '#2A1E5C',
    skyHorizon: '#FF8A6B',
    key: {color: '#FFB27A', intensity: 100, position: [-5, 5, 6]},
    rim: {color: '#9A7BFF', intensity: 5, position: [5, 6, -6]},
    fill: {sky: '#7A5AB0', ground: '#1A1030', intensity: 1.1},
    face: {color: '#FFE0C8', intensity: 0.9},
    fog: {color: '#5A3A70', near: 14, far: 50},
    bloom: 1.0,
    vignette: 0.45,
    exposure: 1.0,
    v2: {cool: {color: '#6E5CE6', intensity: 0.55}, rimBoost: 1.7, ao: {intensity: 3, radius: 0.7, color: '#1C1236'}, haze: {color: '#6E4A7C', height: 0.9, density: 0.42}, grade: {shadows: '#3A2E8A', highlights: '#FFC8A0', amount: 0.17, sat: 1.06, contrast: 1.05}},
  },
  sunnyDay: {
    skyTop: '#8EC9F2',
    skyHorizon: '#FFE3C4',
    key: {color: '#FFF1D6', intensity: 110, position: [-6, 9, 6]},
    rim: {color: '#FFD58A', intensity: 3, position: [6, 6, -6]},
    fill: {sky: '#BFE0FA', ground: '#B9A97A', intensity: 1.7},
    face: {color: '#FFF4E6', intensity: 0.7},
    fog: {color: '#E9DCCB', near: 22, far: 72},
    bloom: 0.45,
    vignette: 0.22,
    exposure: 1.0,
    v2: {cool: {color: '#7FA4F0', intensity: 0.4}, rimBoost: 1.4, ao: {intensity: 2.2, radius: 0.7, color: '#5A5FA8'}, haze: {color: '#F2E2CC', height: 1.1, density: 0.3}, grade: {shadows: '#6C74D0', highlights: '#FFE2B0', amount: 0.14, sat: 1.12, contrast: 1.04}},
  },
  peachMorning: {
    skyTop: '#A9C3EE',
    skyHorizon: '#FFC9A8',
    key: {color: '#FFD3A6', intensity: 100, position: [-7, 5, 6]},
    rim: {color: '#FF9CC0', intensity: 3.5, position: [6, 5, -6]},
    fill: {sky: '#D5D0F2', ground: '#B89A7A', intensity: 1.5},
    face: {color: '#FFEBDD', intensity: 0.7},
    fog: {color: '#F7D3BC', near: 20, far: 68},
    bloom: 0.55,
    vignette: 0.26,
    exposure: 1.0,
    v2: {cool: {color: '#8A8CE8', intensity: 0.45}, rimBoost: 1.5, ao: {intensity: 2.2, radius: 0.7, color: '#5A5FA8'}, haze: {color: '#F7D3BC', height: 1.0, density: 0.32}, grade: {shadows: '#7A6FD0', highlights: '#FFD0A8', amount: 0.15, sat: 1.1, contrast: 1.04}},
  },
  softOvercast: {
    skyTop: '#B9C8DF',
    skyHorizon: '#E6E2DC',
    key: {color: '#F4F7FF', intensity: 75, position: [-3, 9, 5]},
    rim: {color: '#FFE9CF', intensity: 2, position: [5, 6, -5]},
    fill: {sky: '#D9E4F4', ground: '#9AA0A8', intensity: 1.7},
    face: {color: '#FFFFFF', intensity: 0.6},
    fog: {color: '#E4E6EA', near: 22, far: 72},
    bloom: 0.3,
    vignette: 0.2,
    exposure: 1.0,
    v2: {cool: {color: '#9DB6E6', intensity: 0.35}, rimBoost: 1.4, ao: {intensity: 2, radius: 0.7, color: '#5A5FA8'}, haze: {color: '#E4E6EA', height: 1.1, density: 0.3}, grade: {shadows: '#7A86C8', highlights: '#FFF0DA', amount: 0.11, sat: 1.1, contrast: 1.03}},
  },
  candyDusk: {
    skyTop: '#7F7BE0',
    skyHorizon: '#FFB0C8',
    key: {color: '#FFB98F', intensity: 105, position: [-7, 4, 5]},
    rim: {color: '#9FD8FF', intensity: 4, position: [6, 5, -6]},
    fill: {sky: '#C9A8E8', ground: '#7A5A80', intensity: 1.45},
    face: {color: '#FFE6DA', intensity: 0.8},
    fog: {color: '#E8B4CC', near: 20, far: 66},
    bloom: 0.7,
    vignette: 0.28,
    exposure: 1.0,
    v2: {cool: {color: '#7E78E8', intensity: 0.5}, rimBoost: 1.5, ao: {intensity: 2.3, radius: 0.7, color: '#4A3E8A'}, haze: {color: '#F0BCD2', height: 1.0, density: 0.32}, grade: {shadows: '#6A5AD0', highlights: '#FFC2A8', amount: 0.15, sat: 1.12, contrast: 1.04}},
  },
  blueHour: {
    skyTop: '#2E3F7A',
    skyHorizon: '#7C6FB0',
    key: {color: '#9FB2FF', intensity: 45, position: [-5, 8, 5]},
    rim: {color: '#FFB86B', intensity: 5, position: [5, 5, -5]},
    fill: {sky: '#5E6CB8', ground: '#262B48', intensity: 1.25},
    face: {color: '#FFE2CC', intensity: 1.1},
    fog: {color: '#535A92', near: 18, far: 60},
    bloom: 1.0,
    vignette: 0.32,
    exposure: 1.0,
    v2: {cool: {color: '#5A70E0', intensity: 0.45}, rimBoost: 1.6, ao: {intensity: 2.4, radius: 0.7, color: '#1C2250'}, haze: {color: '#5F66A0', height: 1.0, density: 0.36}, grade: {shadows: '#3A4AA8', highlights: '#B8C4FF', amount: 0.22, sat: 1.04, contrast: 1.05}},
  },
  sunnyStudio: {
    skyTop: '#FFF3E0',
    skyHorizon: '#FFE6D0',
    key: {color: '#FFF4E2', intensity: 100, position: [-5, 8, 6]},
    rim: {color: '#FFC9E0', intensity: 2.5, position: [5, 6, -5]},
    fill: {sky: '#FFF0E6', ground: '#D9B48A', intensity: 1.9},
    face: {color: '#FFFFFF', intensity: 0.7},
    fog: {color: '#F6E8DA', near: 22, far: 70},
    bloom: 0.4,
    vignette: 0.18,
    exposure: 1.0,
    v2: {cool: {color: '#A6B4F0', intensity: 0.35}, rimBoost: 1.3, ao: {intensity: 2.2, radius: 0.7, color: '#7A6AA8'}, haze: {color: '#F8ECDF', height: 1.1, density: 0.22}, grade: {shadows: '#8A86D0', highlights: '#FFE8C8', amount: 0.12, sat: 1.1, contrast: 1.03}},
  },
} satisfies Record<string, LightPreset>;

export type PresetId = keyof typeof presets;

const lerpColor = (a: string, b: string, t: number) =>
  '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Blend two presets (t = 0 → a, 1 → b). Use over 6-12 frames when a shot switches. */
export const blendPresets = (a: LightPreset, b: LightPreset, t: number): LightPreset => ({
  skyTop: lerpColor(a.skyTop, b.skyTop, t),
  skyHorizon: lerpColor(a.skyHorizon, b.skyHorizon, t),
  key: {
    color: lerpColor(a.key.color, b.key.color, t),
    intensity: lerp(a.key.intensity, b.key.intensity, t),
    position: lerpV(a.key.position, b.key.position, t),
  },
  rim: {
    color: lerpColor(a.rim.color, b.rim.color, t),
    intensity: lerp(a.rim.intensity, b.rim.intensity, t),
    position: lerpV(a.rim.position, b.rim.position, t),
  },
  face: {color: lerpColor(a.face.color, b.face.color, t), intensity: lerp(a.face.intensity, b.face.intensity, t)},
  fill: {
    sky: lerpColor(a.fill.sky, b.fill.sky, t),
    ground: lerpColor(a.fill.ground, b.fill.ground, t),
    intensity: lerp(a.fill.intensity, b.fill.intensity, t),
  },
  fog: {
    color: lerpColor(a.fog.color, b.fog.color, t),
    near: lerp(a.fog.near, b.fog.near, t),
    far: lerp(a.fog.far, b.fog.far, t),
  },
  bloom: lerp(a.bloom, b.bloom, t),
  vignette: lerp(a.vignette, b.vignette, t),
  exposure: lerp(a.exposure, b.exposure, t),
  v2: a.v2 && b.v2 ? (blendDeep(a.v2, b.v2, t) as LookV2) : (t < 0.5 ? a.v2 : b.v2),
});

/** Lerp every number / '#hex' string / number array in two same-shaped objects. */
const blendDeep = (a: unknown, b: unknown, t: number): unknown => {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (typeof a === 'string' && typeof b === 'string') return a.startsWith('#') ? lerpColor(a, b, t) : t < 0.5 ? a : b;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => blendDeep(x, b[i], t));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(a as object)) o[k] = blendDeep((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], t);
    return o;
  }
  return t < 0.5 ? a : b;
};

/** Gradient sky dome. */
export const Sky: React.FC<{top: string; horizon: string}> = ({top, horizon}) => {
  const uniforms = useMemo(
    () => ({top: {value: new THREE.Color(top)}, horizon: {value: new THREE.Color(horizon)}}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  uniforms.top.value.set(top);
  uniforms.horizon.value.set(horizon);
  return (
    <mesh scale={80}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = smoothstep(-0.15, 0.75, vP.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0); }`}
      />
    </mesh>
  );
};

/** Key spot (screen light), rim, hemisphere fill, fog and sky from one preset. */
export const LightRig: React.FC<{preset: LightPreset; target?: V3; shadows?: boolean; faceFrom?: V3; look?: Look}> = ({
  preset,
  target = [0, 0, 0],
  shadows = true,
  faceFrom = [2, 2, 9],
  look = 'v1',
}) => {
  const v2 = look === 'v2' ? preset.v2 : undefined;
  // v2: shadow-side light mirrors the key across the target (low, from the far side).
  const kp = preset.key.position;
  const coolPos: V3 = [target[0] - kp[0] * 0.9, target[1] + Math.max(1.5, kp[1] * 0.35), target[2] + kp[2] * 0.4];
  const groundTint = v2 ? lerpColor(preset.fill.ground, v2.cool.color, 0.12) : preset.fill.ground;
  const targetObj = useMemo(() => new THREE.Object3D(), []);
  targetObj.position.set(...target);
  return (
    <>
      <fog attach="fog" args={[preset.fog.color, preset.fog.near, preset.fog.far]} />
      <Sky top={preset.skyTop} horizon={preset.skyHorizon} />
      <hemisphereLight args={[preset.fill.sky, groundTint, preset.fill.intensity]} />
      {v2 && <directionalLight color={v2.cool.color} intensity={v2.cool.intensity} position={coolPos} target={targetObj} />}
      <primitive object={targetObj} />
      <spotLight
        color={preset.key.color}
        intensity={preset.key.intensity}
        position={[target[0] + preset.key.position[0], target[1] + preset.key.position[1], target[2] + preset.key.position[2]]}
        angle={0.55}
        penumbra={0.8}
        decay={1.6}
        distance={40}
        target={targetObj}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <directionalLight
        color={preset.face.color}
        intensity={preset.face.intensity}
        position={[target[0] + faceFrom[0], target[1] + faceFrom[1], target[2] + faceFrom[2]]}
        target={targetObj}
      />
      <directionalLight
        color={preset.rim.color}
        intensity={preset.rim.intensity * (v2 ? v2.rimBoost : 1)}
        position={[target[0] + preset.rim.position[0], target[1] + preset.rim.position[1], target[2] + preset.rim.position[2]]}
        target={targetObj}
      />
    </>
  );
};
