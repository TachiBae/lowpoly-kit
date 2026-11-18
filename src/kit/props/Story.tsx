import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FBox, FCyl, FIco} from '../lowpoly';
import {GlowMat} from '../materials';
import {palette} from '../palette';
import {Label3D} from './Fx';

type V3 = [number, number, number];
type Placed = {position?: V3; rotation?: V3; scale?: number};

/** Giant brass magnifying glass. glint 0..1 sweeps a highlight across the lens. */
export const Magnifier: React.FC<Placed & {glint?: number}> = ({position, rotation, scale = 1, glint = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh castShadow>
      <torusGeometry args={[0.8, 0.11, 6, 16]} />
      <meshStandardMaterial color={palette.brass} roughness={0.35} metalness={0.75} flatShading />
    </mesh>
    <mesh>
      <circleGeometry args={[0.76, 32]} />
      <meshPhysicalMaterial color="#CFEFFF" transparent opacity={0.22} roughness={0.05} clearcoat={1} />
    </mesh>
    <mesh position={[-0.35 + glint * 0.7, 0.3 - glint * 0.6, 0.02]} rotation={[0, 0, 0.7]}>
      <planeGeometry args={[0.08, 0.9]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
    </mesh>
    <FCyl rTop={0.09} rBottom={0.11} height={1.3} radial={6} position={[0, -1.45, 0]} color="#5A3A22" seed={5} />
    <FCyl rTop={0.14} rBottom={0.14} height={0.18} radial={6} position={[0, -0.85, 0]} color={palette.brass} seed={6} />
  </group>
);

/** Faceted gold money bag with a tied neck. */
export const MoneyBag: React.FC<Placed & {color?: string}> = ({position, rotation, scale = 1, color = '#E8B04B'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FIco radius={0.6} detail={1} position={[0, 0.55, 0]} scale={[1, 0.95, 0.9]} color={color} seed={21} />
    <FCyl rTop={0.14} rBottom={0.2} height={0.18} radial={6} position={[0, 1.12, 0]} color="#8A5A2A" seed={22} />
    <FIco radius={0.24} detail={0} position={[0, 1.32, 0]} scale={[1.3, 0.8, 1.1]} color={color} seed={23} />
    <mesh position={[0, 0.6, 0.52]}>
      <boxGeometry args={[0.32, 0.32, 0.04]} />
      <GlowMat color="#FFF2B0" intensity={1.6} />
    </mesh>
  </group>
);

/** The phone character used for "viral posts". badge = number shown is handled by an overlay; badgePop 0..1 scales the badge. */
export const PhoneBuddy: React.FC<Placed & {screen?: string; eyes?: 'open' | 'squint' | 'wide' | 'none'; badgePop?: number; megaphone?: boolean; children?: React.ReactNode}> = ({
  position,
  rotation,
  scale = 1,
  screen = '#2A3A7A',
  eyes = 'open',
  badgePop = 1,
  megaphone = true,
  children,
}) => {
  const eh = eyes === 'squint' ? 0.06 : eyes === 'wide' ? 0.3 : 0.22;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <FBox size={[1.2, 2.2, 0.22]} color="#1A1C24" seed={31} jitter={0.03} />
      <mesh position={[0, 0, 0.145]}>
        <planeGeometry args={[1.02, 1.95]} />
        <meshStandardMaterial color={screen} emissive={screen} emissiveIntensity={1.4} />
      </mesh>
      <group position={[0, 0, 0.155]}>{children}</group>
      {eyes !== 'none' && [0.24, -0.24].map((x) => (
        <mesh key={x} position={[x, 0.35, 0.15]}>
          <planeGeometry args={[0.16, eh]} />
          <meshBasicMaterial color="#05060A" />
        </mesh>
      ))}
      <mesh position={[0.6, 1.1, 0.16]} scale={badgePop}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <GlowMat color="#FF3B4A" intensity={1.8} />
      </mesh>
      {/* Megaphone arm */}
      {megaphone && <group position={[-0.62, 0.1, 0]} rotation={[0, 0, 0.9]}>
        <FCyl rTop={0.05} rBottom={0.05} height={0.6} radial={5} position={[0, 0.3, 0]} color="#1A1C24" seed={32} />
        <FCyl rTop={0.32} rBottom={0.1} height={0.5} radial={7} position={[0, 0.8, 0]} color="#F4F1EA" seed={33} />
      </group>}
    </group>
  );
};

/** Rubber stamp. color = verdict color. */
export const Stamp: React.FC<Placed & {color?: string}> = ({position, rotation, scale = 1, color = palette.verdictFalse}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FIco radius={0.22} detail={0} position={[0, 0.95, 0]} color="#3A2A22" seed={41} />
    <FCyl rTop={0.08} rBottom={0.1} height={0.5} radial={6} position={[0, 0.6, 0]} color="#5A3A22" seed={42} />
    <FBox size={[0.9, 0.2, 0.6]} position={[0, 0.25, 0]} color="#2A2A30" seed={43} />
    <FBox size={[0.85, 0.08, 0.55]} position={[0, 0.1, 0]} color={color} seed={44} jitter={0.01} />
  </group>
);

/** Board member pawn (faceted lathe-like stack). */
export const Pawn: React.FC<Placed & {color?: string; turn?: number}> = ({position, rotation, scale = 1, color = '#59627A', turn = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.32} rBottom={0.42} height={0.18} radial={7} position={[0, 0.09, 0]} color={color} seed={51} />
    <FCyl rTop={0.16} rBottom={0.3} height={0.7} radial={7} position={[0, 0.53, 0]} color={color} seed={52} />
    <FCyl rTop={0.28} rBottom={0.22} height={0.08} radial={7} position={[0, 0.92, 0]} color={color} seed={53} />
    <group position={[0, 1.22, 0]} rotation={[0, turn, 0]}>
      <FIco radius={0.3} detail={1} color={color} seed={54} />
      {[0.1, -0.1].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.27]}>
          <planeGeometry args={[0.06, 0.1]} />
          <meshBasicMaterial color="#05060A" />
        </mesh>
      ))}
    </group>
  </group>
);

/**
 * Generic faceted AI robot (no brand). eyes: open | happy | question | squint.
 * holdR renders a prop in the right hand.
 */
export const Robot: React.FC<Placed & {color?: string; eyes?: 'open' | 'happy' | 'question' | 'squint'; armR?: number; armL?: number; holdR?: React.ReactNode; holdL?: React.ReactNode; seed?: number}> = ({
  position,
  rotation,
  scale = 1,
  color = '#8E9AAF',
  eyes = 'open',
  armR = 0,
  armL = 0,
  holdR,
  holdL,
  seed = 400,
}) => {
  const lf = useCurrentFrame();
  const period = 70 + (seed % 37);
  const ph = (lf + (seed % 53)) % period;
  const blinkK = ph < 4 ? Math.abs(ph - 2) / 2 : 1; // 1 = open, dips toward 0 on a blink
  const eyeH = (eyes === 'squint' ? 0.03 : eyes === 'happy' ? 0.05 : 0.12) * (0.15 + 0.85 * blinkK);
  const float = 0.015 * Math.sin((lf / 60) * Math.PI * 2 + (seed % 5));
  return (
    <group position={[(position ?? [0, 0, 0])[0], (position ?? [0, 0, 0])[1] + float, (position ?? [0, 0, 0])[2]]} rotation={rotation} scale={scale}>
      <FBox size={[0.6, 0.62, 0.45]} position={[0, 0.55, 0]} color={color} seed={seed} jitter={0.03} />
      <FBox size={[0.3, 0.18, 0.05]} position={[0, 0.58, 0.24]} color="#1B1E28" seed={seed + 1} jitter={0.01} />
      <mesh position={[0, 0.58, 0.27]}>
        <planeGeometry args={[0.22, 0.1]} />
        <GlowMat color="#3FD0E0" intensity={2} />
      </mesh>
      <FCyl rTop={0.12} rBottom={0.15} height={0.2} radial={6} position={[0, 0.15, 0]} color="#3A4256" seed={seed + 2} />
      <FIco radius={0.36} detail={0} position={[0, 1.12, 0]} scale={[1.15, 0.95, 1]} color={color} seed={seed + 3} />
      <FBox size={[0.56, 0.3, 0.06]} position={[0, 1.12, 0.3]} color="#12141C" seed={seed + 4} jitter={0.01} />
      {eyes === 'question' ? (
        <group position={[0, 1.13, 0.34]}>
          <Label3D text="?" size={0.18} color="#FFC233" glow={2} position={[-0.12, 0, 0]} />
          <Label3D text="?" size={0.18} color="#FFC233" glow={2} position={[0.12, 0, 0]} />
        </group>
      ) : (
        [0.12, -0.12].map((x) => (
          <mesh key={x} position={[x, 1.13 + (eyes === 'happy' ? 0.02 : 0), 0.34]}>
            <planeGeometry args={[0.08, eyeH]} />
            <GlowMat color="#7DF9FF" intensity={3} />
          </mesh>
        ))
      )}
      <FCyl rTop={0.015} rBottom={0.015} height={0.22} radial={4} position={[0, 1.55, 0]} color="#3A4256" seed={seed + 5} />
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <GlowMat color="#FF7A5C" intensity={4} />
      </mesh>
      {/* Arms (pivot at shoulder, rotate forward with armR/armL) */}
      <group position={[-0.38, 0.75, 0]} rotation={[-armR, 0, -0.15]}>
        <FCyl rTop={0.06} rBottom={0.05} height={0.45} radial={5} position={[0, -0.22, 0]} color="#3A4256" seed={seed + 6} />
        <FIco radius={0.08} detail={0} position={[0, -0.47, 0]} color={color} seed={seed + 7} />
        {holdR && <group position={[0, -0.52, 0.02]}>{holdR}</group>}
      </group>
      <group position={[0.38, 0.75, 0]} rotation={[-armL, 0, 0.15]}>
        <FCyl rTop={0.06} rBottom={0.05} height={0.45} radial={5} position={[0, -0.22, 0]} color="#3A4256" seed={seed + 8} />
        <FIco radius={0.08} detail={0} position={[0, -0.47, 0]} color={color} seed={seed + 9} />
        {holdL && <group position={[0, -0.52, 0.02]}>{holdL}</group>}
      </group>
    </group>
  );
};

/** Paint roller (held at the handle end; roller at -y). */
export const PaintRoller: React.FC<Placed & {paint?: string}> = ({position, rotation, scale = 1, paint = '#6B4A2E'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.035} rBottom={0.035} height={0.3} radial={5} position={[0, -0.15, 0]} color="#E5484D" seed={421} />
    <FCyl rTop={0.012} rBottom={0.012} height={0.25} radial={4} position={[0, -0.4, 0]} color="#9AA3B5" seed={422} />
    <FCyl rTop={0.07} rBottom={0.07} height={0.32} radial={8} position={[0, -0.55, 0]} rotation={[0, 0, Math.PI / 2]} color={paint} seed={423} />
  </group>
);

/** Hand-held protest-style sign. */
export const Sign: React.FC<Placed & {text: string; tag?: string; color?: string; textColor?: string}> = ({position, rotation, scale = 1, text, tag, color = '#F2EEE4', textColor = '#C4302B'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FCyl rTop={0.025} rBottom={0.025} height={0.9} radial={5} position={[0, -0.15, 0]} color="#8A5A3A" seed={431} />
    <FBox size={[0.9, 0.5, 0.04]} position={[0, 0.5, 0]} color={color} seed={432} jitter={0.008} />
    <Label3D text={text} size={0.16} color={textColor} position={[0, 0.54, 0.025]} />
    {tag && <Label3D text={tag} size={0.07} color="#1C1E26" position={[0, 0.36, 0.025]} />}
  </group>
);
