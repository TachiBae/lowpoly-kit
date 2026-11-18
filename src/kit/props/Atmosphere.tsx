import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {rng} from '../lowpoly';

type V3 = [number, number, number];

/**
 * Soft contact shadow under a character or prop (v2 look). Sits just above the floor.
 * radius in world units; squash < 1 makes it an ellipse (front-to-back).
 */
export const GroundBlob: React.FC<{position?: V3; radius?: number; squash?: number; opacity?: number; color?: string}> = ({
  position = [0, 0, 0],
  radius = 0.5,
  squash = 0.8,
  opacity = 0.5,
  color = '#05060C',
}) => {
  const uniforms = useMemo(() => ({uColor: {value: new THREE.Color(color)}, uOpacity: {value: opacity}}), []); // eslint-disable-line react-hooks/exhaustive-deps
  uniforms.uColor.value.set(color);
  uniforms.uOpacity.value = opacity;
  return (
    <mesh position={[position[0], position[1] + 0.012, position[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[radius * 2, radius * 2 * squash]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
          void main(){ float d = length(vUv * 2.0 - 1.0); float a = uOpacity * pow(1.0 - smoothstep(0.0, 1.0, d), 1.8); gl_FragColor = vec4(uColor, a); }`}
      />
    </mesh>
  );
};

/** Shared soft-shaft material: fades along the beam and toward its silhouette edges. */
const shaftVert = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const shaftFrag = `uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ float along = pow(vUv.y, 1.4); float edge = pow(abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(uColor * uAlpha * along * edge, 1.0); }`;

/**
 * Fake god-rays (v2 look): a few soft additive shafts from a light source toward a target,
 * with a deterministic slow shimmer. Cheap and identical on every render.
 * from = light position, to = centre of where the light lands, spread = shaft radius at `to`.
 */
export const GodRays: React.FC<{from: V3; to: V3; spread?: number; count?: number; color?: string; intensity?: number; seed?: number}> = ({
  from,
  to,
  spread = 1.2,
  count = 4,
  color = '#FFF2D6',
  intensity = 0.22,
  seed = 7,
}) => {
  const f = useCurrentFrame();
  const shafts = useMemo(() => {
    const r = rng(seed);
    const dir = new THREE.Vector3(...from).sub(new THREE.Vector3(...to));
    const len = dir.length();
    return [...Array(count)].map(() => {
      const off = new THREE.Vector3((r() - 0.5) * spread, 0, (r() - 0.5) * spread * 0.6);
      const end = new THREE.Vector3(...to).add(off);
      const d = new THREE.Vector3(...from).sub(end);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      const mid = new THREE.Vector3(...from).add(end).multiplyScalar(0.5);
      return {q, mid, len: d.length() || len, rBottom: spread * (0.25 + r() * 0.35), phase: r() * 6.28, speed: 0.03 + r() * 0.04};
    });
  }, [from.join(), to.join(), spread, count, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const col = useMemo(() => new THREE.Color(color), [color]);
  return (
    <group>
      {shafts.map((s, i) => {
        const a = intensity * (0.7 + 0.3 * Math.sin(f * s.speed + s.phase));
        return (
          <mesh key={i} position={s.mid} quaternion={s.q} renderOrder={5}>
            <cylinderGeometry args={[0.04, s.rBottom, s.len, 24, 1, true]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
              uniforms={{uColor: {value: col}, uAlpha: {value: a}}}
              vertexShader={shaftVert}
              fragmentShader={shaftFrag}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Dust motes drifting in a light (v2 look): tiny glowing specks in a box, slow deterministic drift.
 * center/size = the volume; keep it inside a light shaft or lamp glow so bloom catches them.
 */
export const DustMotes: React.FC<{center: V3; size: V3; count?: number; color?: string; seed?: number; speed?: number}> = ({
  center,
  size,
  count = 18,
  color = '#FFF4DC',
  seed = 3,
  speed = 1,
}) => {
  const f = useCurrentFrame();
  const motes = useMemo(() => {
    const r = rng(seed);
    return [...Array(count)].map(() => ({p: [r(), r(), r()] as V3, ph: r() * 6.28, s: 0.006 + r() * 0.012, w: 0.4 + r() * 0.6}));
  }, [count, seed]);
  return (
    <group>
      {motes.map((m, i) => {
        const t = f * 0.01 * speed;
        const y = ((m.p[1] + t * 0.25 * m.w) % 1) - 0.5;
        const x = m.p[0] - 0.5 + 0.04 * Math.sin(t * 3 + m.ph);
        const z = m.p[2] - 0.5 + 0.04 * Math.cos(t * 2.3 + m.ph);
        const tw = 0.5 + 0.5 * Math.sin(f * 0.15 + m.ph);
        return (
          <mesh key={i} position={[center[0] + x * size[0], center[1] + y * size[1], center[2] + z * size[2]]} renderOrder={6}>
            <sphereGeometry args={[m.s, 6, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.15 + 0.45 * tw} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};
