import {useLook} from '../look';
import React from 'react';
import * as THREE from 'three';
import {FBox, FCyl, FIco} from '../lowpoly';
import {GlowMat} from '../materials';
import {Label3D} from './Fx';

type V3 = [number, number, number];
type Placed = {position?: V3; rotation?: V3; scale?: number};

/** Desk lamp. on 0..1 lights the bulb and casts a warm pool. */
export const DeskLamp: React.FC<Placed & {on?: number; color?: string}> = ({position, rotation, scale = 1, on = 1, color = '#FFB547'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.18} rBottom={0.22} height={0.06} radial={8} position={[0, 0.03, 0]} color="#1F2330" seed={301} />
    <FCyl rTop={0.025} rBottom={0.025} height={0.7} radial={5} position={[0, 0.38, 0]} rotation={[0, 0, 0.25]} color="#2A2F3E" seed={302} />
    <group position={[-0.17, 0.72, 0]} rotation={[0, 0, -0.9]}>
      <FCyl rTop={0.06} rBottom={0.22} height={0.26} radial={7} color="#2F7A8C" seed={303} />
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <GlowMat color={color} intensity={0.2 + on * 5} />
      </mesh>
    </group>
    {on > 0 && <pointLight position={[-0.35, 0.55, 0]} color={color} intensity={on * 6} distance={4} decay={1.5} castShadow={false} />}
  </group>
);

/** Monitor with a glowing screen. children render on the screen surface. */
export const Monitor: React.FC<Placed & {screen?: string; children?: React.ReactNode}> = ({position, rotation, scale = 1, screen = '#1E3A6E', children}) => {
  const v2 = useLook() === 'v2';
  return (
  <group position={position} rotation={rotation} scale={scale}>
    {/* v2: the screen lights what's in front of it */}
    {v2 && <pointLight position={[0, 0.75, 0.55]} color={screen} intensity={1.6} distance={2.6} decay={2} />}
    <FBox size={[1.5, 0.95, 0.08]} position={[0, 0.75, 0]} color="#14161D" seed={311} jitter={0.01} />
    <mesh position={[0, 0.75, 0.045]}>
      <planeGeometry args={[1.38, 0.84]} />
      <meshStandardMaterial color={screen} emissive={screen} emissiveIntensity={1.6} />
    </mesh>
    <group position={[0, 0.75, 0.05]}>{children}</group>
    <FBox size={[0.1, 0.3, 0.08]} position={[0, 0.15, -0.02]} color="#14161D" seed={312} jitter={0.01} />
    <FBox size={[0.5, 0.04, 0.3]} position={[0, 0.02, 0]} color="#14161D" seed={313} jitter={0.01} />
  </group>
  );
};

/** Manila folder / dossier. tab = label on the tab, stamp = label on the cover. */
export const Folder: React.FC<Placed & {color?: string; tab?: string; tabColor?: string; cover?: string; coverColor?: string; open?: number}> = ({
  position,
  rotation,
  scale = 1,
  color = '#D9B26A',
  tab,
  tabColor = '#C4302B',
  cover,
  coverColor = '#C4302B',
  open = 0,
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[1.1, 0.03, 0.8]} color={color} seed={321} jitter={0.008} />
    <FBox size={[1.06, 0.02, 0.76]} position={[0, 0.03, 0]} color="#F2EEE4" seed={322} jitter={0.005} />
    <group position={[0, 0.05, -0.4]} rotation={[-open * 2.2, 0, 0]}>
      <FBox size={[1.1, 0.03, 0.8]} position={[0, 0, 0.4]} color={color} seed={323} jitter={0.008} />
      <FBox size={[0.36, 0.03, 0.12]} position={[-0.3, 0, -0.04]} color={color} seed={324} jitter={0.005} />
      {tab && <Label3D text={tab} size={0.065} color={tabColor} position={[-0.3, 0.02, -0.04]} rotation={[-Math.PI / 2, 0, 0]} />}
      {cover && <Label3D text={cover} size={0.15} color={coverColor} position={[0, 0.02, 0.45]} rotation={[-Math.PI / 2, 0, -0.12]} />}
    </group>
  </group>
);

/** Wall/desk clock. t = seconds shown by the hands. */
export const Clock: React.FC<Placed & {t?: number}> = ({position, rotation, scale = 1, t = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.4} rBottom={0.4} height={0.1} radial={12} rotation={[Math.PI / 2, 0, 0]} color="#E8E4DA" seed={331} />
    <mesh position={[0, 0, 0.051]}>
      <torusGeometry args={[0.4, 0.04, 6, 24]} />
      <meshStandardMaterial color="#2A2F3E" flatShading />
    </mesh>
    <mesh position={[0, 0, 0.06]} rotation={[0, 0, -t * ((Math.PI * 2) / 60)]}>
      <boxGeometry args={[0.02, 0.6, 0.01]} />
      <meshStandardMaterial color="#C4302B" />
    </mesh>
    <mesh position={[0, 0.1, 0.07]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.04, 0.22, 0.01]} />
      <meshStandardMaterial color="#1C1E26" />
    </mesh>
    <mesh position={[0.08, 0, 0.07]} rotation={[0, 0, -Math.PI / 2]}>
      <boxGeometry args={[0.04, 0.16, 0.01]} />
      <meshStandardMaterial color="#1C1E26" />
    </mesh>
  </group>
);

/** Folded newspaper with a headline. */
export const Newspaper: React.FC<Placed & {headline?: string; date?: string; paper?: string}> = ({position, rotation, scale = 1, headline = 'REPORT', date, paper = '#CFC8B8'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[1.0, 0.04, 1.3]} color={paper} seed={341} jitter={0.01} />
    <Label3D text={headline} size={0.105} color="#16181E" position={[0, 0.025, -0.4]} rotation={[-Math.PI / 2, 0, 0]} maxWidth={0.9} />
    {date && <Label3D text={date} size={0.07} color="#C4302B" position={[0.3, 0.025, -0.58]} rotation={[-Math.PI / 2, 0, 0]} />}
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[-0.2, 0.023, -0.15 + i * 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.04]} />
        <meshBasicMaterial color="#8E8A80" />
      </mesh>
    ))}
    <mesh position={[0.3, 0.023, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.32, 0.4]} />
      <meshBasicMaterial color="#9CA6B8" />
    </mesh>
  </group>
);

/** Envelope. */
export const Envelope: React.FC<Placed & {label?: string}> = ({position, rotation, scale = 1, label}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.8, 0.5, 0.03]} color="#F2EEE4" seed={351} jitter={0.008} />
    <mesh position={[0, 0.08, 0.017]} rotation={[0, 0, Math.PI / 4]}>
      <planeGeometry args={[0.42, 0.42]} />
      <meshStandardMaterial color="#E2DCCB" />
    </mesh>
    {label && <Label3D text={label} size={0.06} color="#1C1E26" position={[0, -0.12, 0.02]} />}
  </group>
);

/** Corkboard for red-string conspiracy boards. */
export const Corkboard: React.FC<Placed & {w?: number; h?: number}> = ({position, rotation, scale = 1, w = 3, h = 2}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[w, h, 0.08]} color="#B07A48" seed={361} jitter={0.01} />
    <FBox size={[w + 0.12, 0.1, 0.12]} position={[0, h / 2, 0]} color="#5A3A22" seed={362} jitter={0.005} />
    <FBox size={[w + 0.12, 0.1, 0.12]} position={[0, -h / 2, 0]} color="#5A3A22" seed={363} jitter={0.005} />
    <FBox size={[0.1, h, 0.12]} position={[w / 2, 0, 0]} color="#5A3A22" seed={364} jitter={0.005} />
    <FBox size={[0.1, h, 0.12]} position={[-w / 2, 0, 0]} color="#5A3A22" seed={365} jitter={0.005} />
  </group>
);

/** Pinned card on a board. */
export const PinCard: React.FC<Placed & {color?: string; children?: React.ReactNode}> = ({position, rotation, scale = 1, color = '#F2EEE4', children}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.7, 0.5, 0.02]} color={color} seed={371} jitter={0.005} />
    <mesh position={[0, 0.2, 0.04]}>
      <sphereGeometry args={[0.04, 10, 8]} />
      <meshStandardMaterial color="#D63A3A" roughness={0.4} />
    </mesh>
    <group position={[0, -0.02, 0.02]}>{children}</group>
  </group>
);

/** Map pin. */
export const MapPin: React.FC<Placed & {color?: string}> = ({position, rotation, scale = 1, color = '#E5484D'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.12} rBottom={0.0} height={0.3} radial={7} position={[0, 0.15, 0]} color={color} seed={381} />
    <FIco radius={0.14} detail={1} position={[0, 0.34, 0]} color={color} seed={382} />
    <mesh position={[0, 0.36, 0.1]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshBasicMaterial color="#FFFFFF" />
    </mesh>
  </group>
);

/** Border gate with a barrier arm (down = 1). */
export const BorderGate: React.FC<Placed & {down?: number}> = ({position, rotation, scale = 1, down = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.25, 0.7, 0.25]} position={[-0.9, 0.35, 0]} color="#3A4256" seed={391} jitter={0.01} />
    <group position={[-0.9, 0.62, 0]} rotation={[0, 0, (1 - down) * 1.3]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0.15 + i * 0.3, 0, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.08]} />
          <meshStandardMaterial color={i % 2 ? '#F2EEE4' : '#E5484D'} flatShading />
        </mesh>
      ))}
    </group>
    <mesh position={[-0.9, 0.78, 0.13]}>
      <sphereGeometry args={[0.05, 8, 6]} />
      <GlowMat color={down > 0.5 ? '#FF3B30' : '#39E58C'} intensity={4} />
    </mesh>
  </group>
);

/** Simple conveyor belt. offset scrolls the slats. */
export const Conveyor: React.FC<Placed & {length?: number; offset?: number}> = ({position, rotation, scale = 1, length = 3, offset = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[length, 0.12, 0.6]} position={[0, 0.06, 0]} color="#252B3A" seed={395} jitter={0.008} />
    {Array.from({length: 12}, (_, i) => {
      const x = ((((i * length) / 12 + offset) % length) + length) % length - length / 2;
      return (
        <mesh key={i} position={[x, 0.125, 0]}>
          <boxGeometry args={[0.04, 0.01, 0.56]} />
          <meshStandardMaterial color="#3D465C" />
        </mesh>
      );
    })}
  </group>
);

/** Thin rectangle outline (for stamp borders). */
export const RectOutline: React.FC<{w: number; h: number; t?: number; color: string; position?: V3; rotation?: V3}> = ({w, h, t = 0.03, color, position, rotation}) => (
  <group position={position} rotation={rotation}>
    {[
      [0, h / 2, w, t],
      [0, -h / 2, w, t],
      [w / 2, 0, t, h],
      [-w / 2, 0, t, h],
    ].map(([x, y, a, b], i) => (
      <mesh key={i} position={[x, y, 0]}>
        <planeGeometry args={[a, b]} />
        <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);
