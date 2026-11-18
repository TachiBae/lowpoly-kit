import React, {useLayoutEffect, useMemo} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
// @ts-expect-error troika-three-text ships no types
import {Text as TroikaText} from 'troika-three-text';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {FIco, rng} from '../lowpoly';
import {GlowMat} from '../materials';

type V3 = [number, number, number];

const FONT = staticFile('fonts/Inter-ExtraBold.woff');

/**
 * 3D text that is fully typeset before the frame is captured.
 * Uses troika's Text mesh directly (drei's <Text> suspends while the font loads, and
 * Remotion would capture the frame before it resumes).
 */
export const Label3D: React.FC<{
  text: string;
  size?: number;
  color?: string;
  glow?: number; // >0 makes the text emissive so it blooms
  position?: V3;
  rotation?: V3;
  anchorX?: 'left' | 'center' | 'right';
  maxWidth?: number;
  outline?: string;
}> = ({text, size = 0.3, color = '#FFFFFF', glow = 0, position, rotation, anchorX = 'center', maxWidth, outline}) => {
  const advance = useThree((st) => st.advance);
  const mesh = useMemo(() => new TroikaText(), []);
  const material = useMemo(
    () =>
      glow > 0
        ? new THREE.MeshStandardMaterial({color, emissive: new THREE.Color(color), emissiveIntensity: glow, toneMapped: false})
        : new THREE.MeshBasicMaterial({color, toneMapped: false}),
    [color, glow],
  );

  useLayoutEffect(() => {
    const handle = delayRender(`3D text: ${text}`);
    let done = false;
    mesh.text = text;
    mesh.font = FONT;
    mesh.fontSize = size;
    mesh.anchorX = anchorX;
    mesh.anchorY = 'middle';
    mesh.textAlign = 'center';
    mesh.maxWidth = maxWidth ?? Infinity;
    mesh.outlineWidth = outline ? size * 0.06 : 0;
    mesh.outlineColor = outline ?? '#000000';
    mesh.material = material;
    const finish = () => {
      if (done) return;
      done = true;
      advance(performance.now()); // redraw now that glyphs exist
      continueRender(handle);
    };
    mesh.sync(finish);
    // Safety net: troika's worker can stall under heavy parallel rendering; never hang the render.
    const t = setTimeout(() => {
      mesh.sync(); // nudge once more
      setTimeout(finish, 1500);
    }, 6000);
    return () => {
      clearTimeout(t);
      finish();
    };
  }, [mesh, text, size, anchorX, maxWidth, outline, material, advance]);

  useLayoutEffect(() => () => mesh.dispose(), [mesh]);

  return <primitive object={mesh} position={position} rotation={rotation} />;
};

/** A glowing straight beam between two points (lasers, red string, light rays). */
export const Beam: React.FC<{from: V3; to: V3; radius?: number; color?: string; intensity?: number; glow?: boolean}> = ({
  from,
  to,
  radius = 0.015,
  color = '#FF2A2A',
  intensity = 4,
  glow = true,
}) => {
  const {mid, len, quat} = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return {mid: a.add(b).multiplyScalar(0.5), len: dir.length(), quat: q};
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 6]} />
      {glow ? <GlowMat color={color} intensity={intensity} /> : <meshStandardMaterial color={color} roughness={0.7} />}
    </mesh>
  );
};

/** Four-point sparkle star. s = scale (animate with pop()). */
export const Sparkle: React.FC<{position: V3; s: number; color?: string; size?: number}> = ({position, s, color = '#FFFFFF', size = 0.3}) =>
  s <= 0.001 ? null : (
    <group position={position} scale={s}>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[0, 0, r]}>
          <planeGeometry args={[size * 0.12, size]} />
          <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <GlowMat color={color} intensity={5} />
      </mesh>
    </group>
  );

/** Faceted shards bursting from a point with gravity. t = frames since burst. */
export const Shards: React.FC<{origin: V3; t: number; count?: number; colors?: string[]; speed?: number; seed?: number; size?: number}> = ({
  origin,
  t,
  count = 22,
  colors = ['#7B5CFF', '#B7A6FF', '#E8B04B'],
  speed = 0.09,
  seed = 5,
  size = 0.05,
}) => {
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, () => {
      const a = r() * Math.PI * 2;
      const up = 0.3 + r() * 0.9;
      return {
        v: [Math.cos(a) * speed * (0.5 + r()), up * speed, Math.sin(a) * speed * (0.5 + r()) + speed * 0.4] as V3,
        spin: [r() * 0.4, r() * 0.4, r() * 0.4] as V3,
        c: colors[Math.floor(r() * colors.length)],
        s: size * (0.6 + r() * 0.8),
      };
    });
  }, [count, seed, speed, size, colors]);
  if (t < 0) return null;
  const g = 0.006;
  return (
    <group>
      {parts.map((p, i) => (
        <FIco
          key={i}
          radius={p.s}
          detail={0}
          color={p.c}
          seed={seed + i}
          castShadow={false}
          position={[origin[0] + p.v[0] * t, origin[1] + p.v[1] * t - g * t * t, origin[2] + p.v[2] * t]}
          rotation={[p.spin[0] * t, p.spin[1] * t, p.spin[2] * t]}
        />
      ))}
    </group>
  );
};

/** Visible light cone for spotlights (additive, soft). */
export const LightCone: React.FC<{position: V3; height: number; radius: number; color?: string; opacity?: number}> = ({
  position,
  height,
  radius,
  color = '#FFF6DD',
  opacity = 0.12,
}) => (
  <mesh position={[position[0], position[1] - height / 2, position[2]]}>
    <coneGeometry args={[radius, height, 32, 1, true]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>
);
