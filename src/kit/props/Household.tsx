import React from 'react';
import * as THREE from 'three';
import {FBox, FCyl, FIco} from '../lowpoly';
import {GlowMat} from '../materials';

type V3 = [number, number, number];
type Placed = {position?: V3; rotation?: V3; scale?: number};

/** Wooden table / desk. */
export const Table: React.FC<Placed & {w?: number; d?: number; h?: number; color?: string}> = ({position, rotation, scale = 1, w = 4, d = 2.4, h = 0.95, color = '#8A5A3A'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[w, 0.16, d]} position={[0, h - 0.08, 0]} color={color} seed={61} jitter={0.02} />
    {[
      [w / 2 - 0.15, d / 2 - 0.15],
      [-w / 2 + 0.15, d / 2 - 0.15],
      [w / 2 - 0.15, -d / 2 + 0.15],
      [-w / 2 + 0.15, -d / 2 + 0.15],
    ].map(([x, z], i) => (
      <FBox key={i} size={[0.14, h - 0.16, 0.14]} position={[x, (h - 0.16) / 2, z]} color="#5E3B24" seed={62 + i} jitter={0.01} />
    ))}
  </group>
);

/** White plate (smooth). */
export const Plate: React.FC<Placed & {r?: number}> = ({position, rotation, scale = 1, r = 0.8}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh receiveShadow castShadow>
      <cylinderGeometry args={[r, r * 0.8, 0.06, 48]} />
      <meshPhysicalMaterial color="#B9B4AA" roughness={0.5} clearcoat={0.3} />
    </mesh>
    <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r * 0.97, 0.035, 8, 48]} />
      <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={0.6} />
    </mesh>
  </group>
);

/** Fork (points along -y in hand space, tines at the end). */
export const Fork: React.FC<Placed> = ({position, rotation, scale = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, -0.25, 0]} castShadow>
      <boxGeometry args={[0.05, 0.5, 0.025]} />
      <meshStandardMaterial color="#C9CED6" metalness={0.8} roughness={0.25} />
    </mesh>
    {[-0.03, -0.01, 0.01, 0.03].map((x) => (
      <mesh key={x} position={[x, -0.6, 0]} castShadow>
        <boxGeometry args={[0.012, 0.2, 0.012]} />
        <meshStandardMaterial color="#C9CED6" metalness={0.8} roughness={0.25} />
      </mesh>
    ))}
  </group>
);

/** Toothpick flag with a label face (put Label3D on it). */
export const FlagPick: React.FC<Placed & {children?: React.ReactNode; flagColor?: string}> = ({position, rotation, scale = 1, children, flagColor = '#FFFFFF'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.35, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
      <meshStandardMaterial color="#E9D2A6" roughness={0.8} />
    </mesh>
    <mesh position={[0.24, 0.58, 0]}>
      <boxGeometry args={[0.46, 0.22, 0.01]} />
      <meshStandardMaterial color={flagColor} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
    <group position={[0.24, 0.58, 0.01]}>{children}</group>
  </group>
);

/** Press camera with a flash that fires when flash > 0. */
export const PressCamera: React.FC<Placed & {flash?: number}> = ({position, rotation, scale = 1, flash = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.7, 0.45, 0.35]} color="#22242C" seed={71} jitter={0.015} />
    <FCyl rTop={0.15} rBottom={0.17} height={0.25} radial={8} position={[0, -0.02, 0.28]} rotation={[Math.PI / 2, 0, 0]} color="#15161B" seed={72} />
    <FBox size={[0.3, 0.16, 0.2]} position={[0.12, 0.32, 0]} color="#2C2F38" seed={73} jitter={0.01} />
    <mesh position={[0.12, 0.32, 0.11]}>
      <planeGeometry args={[0.24, 0.1]} />
      <GlowMat color="#FFFFFF" intensity={0.3 + flash * 12} />
    </mesh>
    {flash > 0 && <pointLight position={[0.12, 0.32, 0.6]} color="#FFFFFF" intensity={flash * 25} distance={8} />}
    {/* Stand */}
    <FCyl rTop={0.04} rBottom={0.04} height={2.4} radial={5} position={[0, -1.4, 0]} color="#1A1B20" seed={74} />
  </group>
);

/** Frosted glass panel. */
export const FrostedPanel: React.FC<Placed & {w?: number; h?: number; opacity?: number}> = ({position, rotation, scale = 1, w = 2.4, h = 3.2, opacity = 0.35}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial color="#DDE8FF" transparent opacity={opacity} roughness={0.9} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <FBox size={[w + 0.1, 0.08, 0.1]} position={[0, h / 2, 0]} color="#8C97B5" seed={81} jitter={0.005} />
    <FBox size={[w + 0.1, 0.08, 0.1]} position={[0, -h / 2, 0]} color="#8C97B5" seed={82} jitter={0.005} />
  </group>
);

/** Generic faceless silhouette (for people who must not be depicted). */
export const Silhouette: React.FC<Placed & {color?: string; opacity?: number}> = ({position, rotation, scale = 1, color = '#7B5CFF', opacity = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FIco radius={0.42} detail={1} position={[0, 2.0, 0]} color={color} emissive={color} emissiveIntensity={0.5} opacity={opacity} seed={91} />
    <FIco radius={0.5} detail={1} position={[0, 2.2, -0.12]} scale={[1.05, 0.9, 0.9]} color={color} emissive={color} emissiveIntensity={0.4} opacity={opacity} seed={92} />
    <FCyl rTop={0.32} rBottom={0.5} height={1.4} radial={7} position={[0, 0.95, 0]} color={color} emissive={color} emissiveIntensity={0.4} opacity={opacity} seed={93} />
  </group>
);

/** Crumpled jacket left behind. */
export const CrumpledJacket: React.FC<Placed & {color?: string}> = ({position, rotation, scale = 1, color = '#2C2C36'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FIco radius={0.45} detail={1} scale={[1.3, 0.35, 1]} color={color} roughness={0.35} seed={95} />
    <FIco radius={0.22} detail={0} position={[0.45, 0.05, 0.25]} scale={[1.6, 0.5, 0.7]} rotation={[0, 0.6, 0]} color={color} roughness={0.35} seed={96} />
    <FIco radius={0.22} detail={0} position={[-0.42, 0.04, -0.2]} scale={[1.6, 0.5, 0.7]} rotation={[0, -0.9, 0]} color={color} roughness={0.35} seed={97} />
  </group>
);
