import {useLook} from '../look';
import {GroundBlob} from '../props/Atmosphere';
import React from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {FBox, FCyl, FIco, SBall, SCapsule, rng} from '../lowpoly';
import {GlowMat, SMat} from '../materials';
import {Act, applyAct} from './motion';
import {ArmStyle, BodyStyle, Expression, HandPose, PersonSpec, Pose, V3} from './types';

/**
 * Character generator.
 * One base body (smooth clay head + hands, faceted clothes and hair) with
 * swappable hair, outfits and accessories. A new character = a new PersonSpec.
 *
 * Units: about 2.5 units tall at build.height = 1. Feet at y = 0, facing +z.
 */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

export const Person: React.FC<{
  spec: PersonSpec;
  expression?: Expression;
  pose?: Pose;
  position?: V3;
  rotation?: V3;
  scale?: number;
  /** Anything placed in the left / right hand (a prop, a phone, a fork). */
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  /** v2: soft contact shadow under the feet. Default: on when standing at floor level (y ≈ 0). */
  blob?: boolean;
  /** Arm build (v2 only; v1 always 'classic'). Default: DEFAULT_V2_ARMS. */
  arms?: ArmStyle;
  /** Torso build (v2 only). Default: DEFAULT_V2_BODY. */
  body?: BodyStyle;
  /** v2 motion: keyed poses/expressions (+ gestures, idle, talk, walk in later phases). Static pose/expression are the base. */
  act?: Act;
}> = ({spec, expression = {}, pose = {}, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, holdL, holdR, blob, arms, body, act}) => {
  const look = useLook();
  const armStyle: ArmStyle = look === 'v2' ? arms ?? DEFAULT_V2_ARMS : 'classic';
  const shaped = look === 'v2' && (body ?? DEFAULT_V2_BODY) === 'shaped';
  const showBlob = look === 'v2' && (blob ?? Math.abs(position[1]) < 0.05);
  const seed = hash(spec.name);
  // Life: seeded auto-blink every ~2.5-4 s plus a gentle breathing bob (deterministic from the frame).
  const lf = useCurrentFrame();
  let headSquash = 1;
  if (act) {
    const r = applyAct(lf, act, pose, expression, seed, {L: (0.09 + 0.52 * (spec.build?.height ?? 1)), scale});
    if (r.root) {
      position = r.root.pos;
      rotation = [rotation[0], r.root.yaw, rotation[2]];
    }
    pose = r.pose;
    expression = r.expression;
    headSquash = r.headSquash;
    if (r.phone === 'R' && !holdR) holdR = <HeldPhone />;
    if (r.phone === 'L' && !holdL) holdL = <HeldPhone />;
  }
  const period = 78 + (seed % 41);
  const phase = (lf + (seed % 67)) % period;
  const autoBlink = phase < 4 ? 1 - Math.abs(phase - 1.5) / 1.5 : 0;
  expression = {...expression, blink: Math.max(expression.blink ?? 0, Math.max(0, autoBlink))};
  pose = {...pose, bob: (pose.bob ?? 0) + 0.012 * Math.sin((lf / 90) * Math.PI * 2 + (seed % 7))};
  const bh = spec.build?.height ?? 1;
  const bw = spec.build?.width ?? 1;
  const H = 0.6 * (spec.build?.head ?? 1); // head radius (oversized on purpose)

  const shoeH = 0.09;
  const legH = 0.52 * bh;
  const legR = 0.13 * bw;
  const torsoH = 0.74 * bh;
  const torsoTop = 0.4 * bw;
  const torsoBot = 0.36 * bw;
  const hipY = shoeH + legH;
  const neckY = hipY + torsoH;
  const headY = neckY + H * 0.82;
  // shaped body: arms start inside the rounded shoulder so torso + arm read as one mass
  const shoulderX = shaped ? 0.385 * bw : torsoTop + 0.05;
  const shoulderY = shaped ? neckY - 0.09 : neckY - 0.12;

  const squash = pose.squash ?? 1;
  const squashXZ = 1 / Math.sqrt(squash);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {showBlob && <GroundBlob radius={0.55 * bw} squash={0.75} opacity={0.55} />}
      <group
        position={[pose.shift ?? 0, (pose.bob ?? 0) - (pose.hips ?? 0), 0]}
        rotation={[pose.lean ?? 0, pose.turn ?? 0, -(pose.shift ?? 0) * 1.2]}
        scale={[squashXZ, squash, squashXZ]}
      >
        {/* Legs */}
        {look === 'v2' ? (
          <>
            <LegV2 x={0.15 * bw} hipY={hipY} legH={legH} legR={legR} swing={pose.legL ?? 0} knee={pose.kneeL ?? 0} spec={spec} seed={seed + 1} />
            <LegV2 x={-0.15 * bw} hipY={hipY} legH={legH} legR={legR} swing={pose.legR ?? 0} knee={pose.kneeR ?? 0} spec={spec} seed={seed + 2} />
          </>
        ) : (
          <>
            <Leg x={0.15 * bw} hipY={hipY} legH={legH} legR={legR} swing={pose.legL ?? 0} spec={spec} seed={seed + 1} />
            <Leg x={-0.15 * bw} hipY={hipY} legH={legH} legR={legR} swing={pose.legR ?? 0} spec={spec} seed={seed + 2} />
          </>
        )}

        {/* Torso + outfit */}
        <Outfit spec={spec} hipY={hipY} torsoH={torsoH} torsoTop={torsoTop} torsoBot={torsoBot} neckY={neckY} seed={seed} shaped={shaped} bw={bw} />

        {/* Arms */}
        <Arm
          side={1}
          shoulder={[shoulderX, shoulderY, 0]}
          rot={pose.armL ?? [0, 0, 0.12]}
          elbow={pose.elbowL ?? 0.15}
          spec={spec}
          seed={seed + 3}
          bw={bw}
          hold={holdL}
          handPose={pose.handL}
          style={armStyle}
        />
        <Arm
          side={-1}
          shoulder={[-shoulderX, shoulderY, 0]}
          rot={pose.armR ?? [0, 0, -0.12]}
          elbow={pose.elbowR ?? 0.15}
          spec={spec}
          seed={seed + 4}
          bw={bw}
          hold={holdR}
          handPose={pose.handR}
          style={armStyle}
        />

        {/* Neck */}
        <mesh position={[0, neckY + 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.16, 24]} />
          <SMat color={shade(spec.skin, -0.06)} />
        </mesh>

        {/* Head */}
        <group position={[0, headY, 0]} rotation={pose.head ?? [0, 0, 0]} scale={[1 / Math.sqrt(headSquash), headSquash, 1 / Math.sqrt(headSquash)]}>
          <Head spec={spec} H={H} expression={expression} seed={seed} v2={look === 'v2'} />
        </group>
      </group>
    </group>
  );
};

/** Small phone that appears in the hand during the phoneLook gesture (screen faces up toward the face). */
const HeldPhone: React.FC = () => (
  // Stands up out of the fist (local z = up when the forearm is level); broad faces point along local x,
  // i.e. toward the face and toward the camera. Screen on both faces so either side reads.
  <group position={[0, 0.07, 0.15]} rotation={[0, 0, 0.9]} scale={1.45}>
    <mesh castShadow>
      <boxGeometry args={[0.028, 0.12, 0.22]} />
      <meshStandardMaterial color="#26283A" roughness={0.5} />
    </mesh>
    {[1, -1].map((sd) => (
      <mesh key={sd} position={[sd * 0.0145, 0, 0]} rotation={[0, (sd * Math.PI) / 2, 0]}>
        <planeGeometry args={[0.19, 0.1]} />
        <meshStandardMaterial color="#7FE3FF" emissive="#57C8FF" emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/** v2 leg: thigh + shin with a knee (shin bends backward). The foot counter-rotates so the sole stays level with the body. */
const LegV2: React.FC<{
  x: number;
  hipY: number;
  legH: number;
  legR: number;
  swing: number;
  knee: number;
  spec: PersonSpec;
  seed: number;
}> = ({x, hipY, legH, legR, swing, knee, spec, seed}) => {
  const thigh = legH * 0.55;
  const shin = legH - thigh;
  const kR = legR * 1.03;
  const col = spec.outfit.style === 'spacesuit' ? spec.outfit.main : spec.outfit.pants;
  return (
    <group position={[x, hipY, 0]} rotation={[swing, 0, 0]}>
      <FCyl rTop={legR * 1.08} rBottom={kR} height={thigh} position={[0, -thigh / 2, 0]} color={col} seed={seed} radial={6} />
      <group position={[0, -thigh, 0]} rotation={[knee, 0, 0]}>
        <mesh>
          <sphereGeometry args={[kR * 0.98, 8, 6]} />
          <meshStandardMaterial color={col} roughness={0.85} flatShading />
        </mesh>
        <FCyl rTop={kR} rBottom={legR} height={shin} position={[0, -shin / 2, 0]} color={col} seed={seed + 5} radial={6} />
        <group position={[0, -shin, 0]} rotation={[-(swing + knee), 0, 0]}>
          <FBox size={[0.27, 0.04, 0.4]} position={[0, -0.07, 0.065]} color={soleFor(spec.outfit.shoes)} seed={seed + 19} jitter={0.008} />
          <FBox size={[0.24, 0.12, 0.36]} position={[0, -0.03, 0.06]} color={spec.outfit.shoes ?? '#15161A'} seed={seed + 9} jitter={0.015} />
        </group>
      </group>
    </group>
  );
};

const Leg: React.FC<{
  x: number;
  hipY: number;
  legH: number;
  legR: number;
  swing: number;
  spec: PersonSpec;
  seed: number;
  v2?: boolean;
}> = ({x, hipY, legH, legR, swing, spec, seed, v2 = false}) => (
  <group position={[x, hipY, 0]} rotation={[swing, 0, 0]}>
    {v2 && (
      // v2: contrasting sole so feet read against the floor.
      <FBox size={[0.27, 0.04, 0.4]} position={[0, -legH - 0.07, 0.065]} color={soleFor(spec.outfit.shoes)} seed={seed + 19} jitter={0.008} />
    )}
    <FCyl
      rTop={legR * 1.08}
      rBottom={legR}
      height={legH}
      position={[0, -legH / 2, 0]}
      color={spec.outfit.style === 'spacesuit' ? spec.outfit.main : spec.outfit.pants}
      seed={seed}
      radial={6}
    />
    <FBox
      size={[0.24, 0.12, 0.36]}
      position={[0, -legH - 0.03, 0.06]}
      color={spec.outfit.shoes ?? '#15161A'}
      seed={seed + 9}
      jitter={0.015}
    />
  </group>
);

const Arm: React.FC<{
  side: 1 | -1;
  shoulder: V3;
  rot: V3;
  elbow: number;
  spec: PersonSpec;
  seed: number;
  bw: number;
  hold?: React.ReactNode;
  handPose?: HandPose;
  style?: ArmStyle;
}> = ({side, shoulder, rot, elbow, spec, seed, bw, hold, handPose = 'relaxed', style = 'classic'}) => {
  if (style !== 'classic') return <ArmV2 {...{side, shoulder, rot, elbow, spec, seed, bw, hold, handPose, style}} />;
  const upper = 0.38;
  const fore = 0.34;
  const r = 0.11 * bw;
  const sleeve =
    spec.outfit.style === 'tee' || spec.outfit.style === 'uniform' ? spec.outfit.main : spec.outfit.main;
  const bareForearm = spec.outfit.style === 'tee';
  const rough = 0.82 - 0.5 * (spec.outfit.shine ?? 0);
  return (
    <group position={shoulder} rotation={rot}>
      <FIco radius={r * 1.25} detail={0} color={sleeve} seed={seed + 1} position={[0, -0.02, 0]} roughness={rough} />
      <FCyl rTop={r * 1.05} rBottom={r} height={upper} position={[0, -upper / 2, 0]} color={sleeve} seed={seed} radial={6} roughness={rough} />
      <group position={[0, -upper, 0]} rotation={[-elbow, 0, 0]}>
        {bareForearm ? (
          <mesh position={[0, -fore / 2, 0]} castShadow>
            <capsuleGeometry args={[r * 0.75, fore - r, 6, 12]} />
            <SMat color={spec.skin} />
          </mesh>
        ) : (
          <FCyl rTop={r} rBottom={r * 0.92} height={fore} position={[0, -fore / 2, 0]} color={sleeve} seed={seed + 2} radial={6} roughness={rough} />
        )}
        {/* Cuff + hand */}
        {handPose === 'relaxed' ? (
          <>
            <SBall radius={0.11} position={[0, -fore - 0.07, 0.01]} scale={[0.95, 1.05, 0.85]} color={spec.skin} />
            <SBall radius={0.045} position={[side * 0.07, -fore - 0.03, 0.06]} color={spec.skin} />
          </>
        ) : (
          <group position={[0, -fore - 0.07, 0.01]}>
            <SBall radius={0.11} scale={handPose === 'fist' ? [1, 0.9, 0.95] : handPose === 'open' || handPose === 'wave' ? [1.15, 1.1, 0.6] : [0.95, 1.05, 0.85]} color={spec.skin} />
            {handPose === 'thumbsUp' && <SCapsule radius={0.04} length={0.1} position={[side * 0.02, 0.13, 0.03]} color={spec.skin} />}
            {handPose === 'point' && <SCapsule radius={0.032} length={0.12} position={[0, -0.15, 0.03]} color={spec.skin} />}
            {handPose !== 'thumbsUp' && <SBall radius={0.045} position={[side * 0.08, 0.02, 0.05]} color={spec.skin} />}
          </group>
        )}
        {hold && <group position={[0, -fore - 0.12, 0.05]}>{hold}</group>}
      </group>
    </group>
  );
};

const Outfit: React.FC<{
  spec: PersonSpec;
  hipY: number;
  torsoH: number;
  torsoTop: number;
  torsoBot: number;
  neckY: number;
  seed: number;
  shaped?: boolean;
  bw?: number;
}> = ({spec, hipY, torsoH, torsoTop, torsoBot, neckY, seed, shaped = false, bw = 1}) => {
  const o = spec.outfit;
  const cy = hipY + torsoH / 2;
  const front = shaped ? 0.385 * bw * Math.cos(Math.PI / 10) * TORSO_DEPTH - 0.005 : torsoBot * 0.98;
  const zs: [number, number, number] = shaped ? [1, 1, TORSO_DEPTH] : [1, 1, 1];
  const style = o.style;
  const open = style === 'leatherJacket' || style === 'suit' || style === 'labCoat';
  const torsoColor = style === 'tee' ? o.inner : o.main;
  const rough = 0.82 - 0.5 * (o.shine ?? 0);

  return (
    <group>
      {shaped ? (
        <ShapedTorso hipY={hipY} torsoH={torsoH} bw={bw} color={torsoColor} rough={rough} />
      ) : (
        <>
                <FCyl rTop={torsoTop} rBottom={torsoBot} height={torsoH} radial={8} position={[0, cy, 0]} color={torsoColor} seed={seed + 10} jitter={0.025} roughness={rough} />
          {/* Shoulder caps so the torso reads chunky */}
          <FIco radius={0.17} detail={0} position={[torsoTop - 0.04, neckY - 0.1, 0]} scale={[1.2, 0.7, 1]} color={torsoColor} seed={seed + 11} roughness={rough} />
          <FIco radius={0.17} detail={0} position={[-torsoTop + 0.04, neckY - 0.1, 0]} scale={[1.2, 0.7, 1]} color={torsoColor} seed={seed + 12} roughness={rough} />
        </>
      )}

      {open && (
        <>
          {/* Shirt / tee showing between open lapels */}
          <FBox size={[0.3, torsoH * 0.96, 0.06]} position={[0, cy + 0.01, front]} color={o.inner} seed={seed + 13} jitter={0.012} />
          {/* Lapels */}
          <FBox size={[0.13, torsoH * 0.92, 0.07]} position={[0.19, cy, front + 0.03]} rotation={[0, -0.25, 0.1]} color={shade(o.main, 0.05)} seed={seed + 14} jitter={0.012} />
          <FBox size={[0.13, torsoH * 0.92, 0.07]} position={[-0.19, cy, front + 0.03]} rotation={[0, 0.25, -0.1]} color={shade(o.main, 0.05)} seed={seed + 15} jitter={0.012} />
          {/* Collar */}
          <FBox size={[0.24, 0.14, 0.07]} position={[0.17, neckY - 0.01, 0.2]} rotation={[-0.45, -0.5, 0.35]} color={shade(o.main, 0.07)} seed={seed + 16} jitter={0.01} />
          <FBox size={[0.24, 0.14, 0.07]} position={[-0.17, neckY - 0.01, 0.2]} rotation={[-0.45, 0.5, -0.35]} color={shade(o.main, 0.07)} seed={seed + 17} jitter={0.01} />
          {/* Pocket slits */}
          <FBox size={[0.12, 0.025, 0.03]} position={[0.26, cy - 0.17, front + 0.02]} rotation={[0, -0.4, 0.5]} color={shade(o.main, -0.08)} seed={seed + 18} jitter={0.004} />
          <FBox size={[0.12, 0.025, 0.03]} position={[-0.26, cy - 0.17, front + 0.02]} rotation={[0, 0.4, -0.5]} color={shade(o.main, -0.08)} seed={seed + 19} jitter={0.004} />
        </>
      )}

      {style === 'suit' && (
        <FBox size={[0.08, torsoH * 0.7, 0.04]} position={[0, cy + 0.04, front + 0.05]} color={o.accent ?? '#B02A3A'} seed={seed + 20} jitter={0.008} />
      )}

      {style === 'labCoat' && (
        <FCyl rTop={torsoBot * 1.02} rBottom={torsoBot * 1.18} height={0.42} radial={8} position={[0, hipY - 0.2, 0]} color={o.main} seed={seed + 21} />
      )}

      {style === 'hoodie' && (
        <>
          <FIco radius={0.3} detail={1} position={[0, neckY - 0.02, -0.22]} scale={[1.25, 0.7, 0.8]} color={shade(o.main, -0.05)} seed={seed + 22} />
          <FBox size={[0.42, 0.18, 0.06]} position={[0, cy - 0.16, front + 0.02]} color={shade(o.main, -0.06)} seed={seed + 23} jitter={0.01} />
          <FBox size={[0.025, 0.2, 0.025]} position={[0.07, neckY - 0.14, front + 0.04]} color={o.accent ?? '#EDEDED'} seed={seed + 24} jitter={0.004} />
          <FBox size={[0.025, 0.2, 0.025]} position={[-0.07, neckY - 0.14, front + 0.04]} color={o.accent ?? '#EDEDED'} seed={seed + 25} jitter={0.004} />
        </>
      )}

      {style === 'uniform' && (
        <>
          <FCyl rTop={torsoBot * 1.03} rBottom={torsoBot * 1.03} height={0.08} radial={8} position={[0, hipY + 0.05, 0]} scale={zs} color={o.accent ?? '#2A2A2A'} seed={seed + 26} />
          <FBox size={[0.12, 0.12, 0.04]} position={[0.2, cy + 0.12, front + 0.01]} color={shade(o.main, -0.08)} seed={seed + 27} jitter={0.006} />
          <FBox size={[0.12, 0.12, 0.04]} position={[-0.2, cy + 0.12, front + 0.01]} color={shade(o.main, -0.08)} seed={seed + 28} jitter={0.006} />
        </>
      )}

      {style === 'spacesuit' && (
        <>
          <FCyl rTop={0.27} rBottom={0.3} height={0.1} radial={10} position={[0, neckY, 0]} color={o.accent ?? '#9AA3B5'} seed={seed + 29} />
          <FBox size={[0.34, 0.22, 0.08]} position={[0, cy + 0.06, front + 0.03]} color={shade(o.main, -0.12)} seed={seed + 30} jitter={0.01} />
          {[-0.09, 0, 0.09].map((x, i) => (
            <mesh key={i} position={[x, cy + 0.06, front + 0.08]}>
              <sphereGeometry args={[0.025, 8, 6]} />
              <GlowMat color={['#FF4D5E', '#39E58C', '#3FD0E0'][i]} intensity={2.5} />
            </mesh>
          ))}
        </>
      )}

      {style === 'apron' && (
        <FBox size={[0.46, torsoH * 0.8, 0.05]} position={[0, cy - 0.04, front + 0.04]} color={o.accent ?? '#F4F1EA'} seed={seed + 32} jitter={0.008} />
      )}
      {style === 'sweater' && (
        <FCyl rTop={0.2} rBottom={0.22} height={0.1} radial={10} position={[0, neckY - 0.02, 0]} color={shade(o.main, 0.08)} seed={seed + 33} />
      )}
      {style === 'raincoat' && (
        <>
          <FCyl rTop={torsoBot * 1.02} rBottom={torsoBot * 1.2} height={0.4} radial={8} position={[0, hipY - 0.18, 0]} color={o.main} seed={seed + 34} />
          <FIco radius={0.3} detail={1} position={[0, neckY - 0.02, -0.22]} scale={[1.25, 0.7, 0.8]} color={shade(o.main, -0.05)} seed={seed + 35} />
        </>
      )}
      {style === 'overalls' && (
        <>
          <FBox size={[0.4, 0.3, 0.05]} position={[0, cy - 0.05, front + 0.03]} color={o.accent ?? o.pants} seed={seed + 36} jitter={0.008} />
          <FBox size={[0.07, 0.5, 0.04]} position={[0.14, cy + 0.12, front + 0.03]} color={o.accent ?? o.pants} seed={seed + 37} jitter={0.006} />
          <FBox size={[0.07, 0.5, 0.04]} position={[-0.14, cy + 0.12, front + 0.03]} color={o.accent ?? o.pants} seed={seed + 38} jitter={0.006} />
        </>
      )}
      {style === 'dress' && (
        <FCyl rTop={torsoBot * 1.05} rBottom={torsoBot * 1.7} height={0.5} radial={10} position={[0, hipY - 0.1, 0]} color={o.main} seed={seed + 39} />
      )}
      {style === 'vest' && (
        <FBox size={[0.36, torsoH * 0.9, 0.05]} position={[0, cy, front + 0.04]} color={o.accent ?? shade(o.main, -0.1)} seed={seed + 41} jitter={0.008} />
      )}
      {style === 'chef' && (
        <>
          {[0.08, -0.08].map((x, i) => (
            <mesh key={i} position={[x, cy + 0.12, front + 0.06]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <meshStandardMaterial color={o.accent ?? '#9AA3B5'} roughness={0.4} metalness={0.4} />
            </mesh>
          ))}
        </>
      )}

      {spec.accessories?.badge && (
        <FBox size={[0.1, 0.13, 0.03]} position={[-0.24, cy + 0.12, front + 0.06]} color={spec.accessories.badge} seed={seed + 31} jitter={0.004} />
      )}
    </group>
  );
};

const mouthShape = (m: Expression['mouth']): [number, number] => {
  switch (m) {
    case 'small':
      return [0.85, 0.5];
    case 'open':
      return [1.1, 1.0];
    case 'wide':
      return [1.6, 0.85];
    case 'o':
      return [0.7, 0.95];
    case 'smile':
      return [1.5, 0.32];
    case 'frown':
      return [1.2, 0.22];
    case 'grin':
      return [1.7, 0.5];
    case 'tongue':
      return [1.2, 0.8];
    case 'smirk':
      return [1.1, 0.2];
    case 'kiss':
      return [0.45, 0.55];
    case 'teeth':
      return [1.6, 0.6];
    default:
      return [1.25, 0.16];
  }
};

const Head: React.FC<{spec: PersonSpec; H: number; expression: Expression; seed: number; v2?: boolean}> = ({spec, H, expression, seed, v2 = false}) => {
  const eyeScale = expression.eyeScale ?? 1;
  const blink = expression.blink ?? 0;
  const [lx, ly] = expression.look ?? [0, 0];
  const ex = 0.33 * H;
  const ey = 0.02 * H;
  const ez = Math.sqrt(H * H - ex * ex - ey * ey) * 0.93;
  const [mw, mh0] = mouthShape(expression.mouth);
  const mh = expression.mouthOpen !== undefined ? 0.16 + 0.95 * expression.mouthOpen : mh0;
  const my = -0.4 * H;
  const mz = Math.sqrt(H * H - my * my) * 0.99;
  const brow = expression.brows ?? 'neutral';
  const browTilt = brow === 'worried' ? -0.34 : brow === 'sad' ? -0.42 : brow === 'angry' ? 0.36 : 0;
  const browLift = brow === 'raised' ? 0.1 * H : brow === 'worried' ? 0.04 * H : brow === 'sad' ? 0.03 * H : brow === 'flat' ? -0.03 * H : brow === 'angry' ? -0.015 * H : 0;
  const eyeShape = expression.eyeShape ?? 'dot';
  const glasses = spec.accessories?.glasses;
  const gColor = spec.accessories?.glassesColor ?? '#2A2326';

  return (
    <group>
      {/* Skull: smooth clay */}
      <SBall radius={H} color={spec.skin} />
      {/* Ears */}
      <SBall radius={0.16 * H} position={[0.97 * H, -0.04 * H, -0.02]} scale={[0.5, 0.85, 0.7]} color={shade(spec.skin, -0.03)} />
      <SBall radius={0.16 * H} position={[-0.97 * H, -0.04 * H, -0.02]} scale={[0.5, 0.85, 0.7]} color={shade(spec.skin, -0.03)} />
      {/* Nose */}
      {spec.face?.noseStyle !== 'none' && (
        <SBall radius={(spec.face?.noseStyle === 'button' ? 0.07 : 0.11) * H} position={[0, -0.13 * H, 0.97 * H]} scale={spec.face?.noseStyle === 'long' ? [0.9, 1.5, 1.3] : [1, 0.95, 0.9]} color={shade(spec.skin, -0.02)} />
      )}
      {spec.face?.freckles &&
        [[-0.2, -0.2], [-0.32, -0.16], [-0.12, -0.15], [0.2, -0.2], [0.32, -0.16], [0.12, -0.15]].map(([fx, fy], i) => (
          <mesh key={i} position={[fx * H, fy * H, 0.93 * H]}>
            <sphereGeometry args={[0.018 * H, 6, 5]} />
            <meshStandardMaterial color={shade(spec.skin, -0.28)} roughness={0.8} />
          </mesh>
        ))}

      {/* Eyes: white sclera, black pupil, glint */}
      {[1, -1].map((s) => {
        const closed = eyeShape === 'happy' || (eyeShape === 'wink' && s === -1);
        if (closed)
          return (
            <group key={s} position={[s * ex, ey, ez]} rotation={[0, s * 0.33, 0]}>
              <mesh position={[0, -0.02 * H, 0.05 * H]}>
                <torusGeometry args={[0.13 * H, 0.03 * H, 8, 20, Math.PI]} />
                <meshStandardMaterial color="#1A1416" roughness={0.5} />
              </mesh>
            </group>
          );
        const lid = eyeShape === 'sleepy' ? 0.5 : eyeShape === 'squint' ? 0.4 : 1;
        return (
        <group key={s} position={[s * ex, ey, ez]} rotation={[0, s * 0.33, 0]}>
          <SBall radius={0.16 * H} scale={[1, 1.15 * eyeScale * lid * Math.max(0.08, 1 - blink), 0.45]} color="#F7F4EE" roughness={0.35} castShadow={false} />
          {blink < 0.7 && (
            <>
              {v2 && (
                // v2: coloured iris ring behind the pupil for depth.
                <SBall radius={0.105 * H * Math.min(1.15, eyeScale)} position={[lx * 0.05 * H, ly * 0.05 * H, 0.045 * H]} scale={[1, 1.1, 0.45]} color={IRIS} roughness={0.3} castShadow={false} />
              )}
              <SBall radius={(v2 ? 0.066 : 0.085) * H * Math.min(1.15, eyeScale)} position={[lx * 0.05 * H, ly * 0.05 * H, 0.06 * H]} scale={[1, 1.1, 0.5]} color="#0D0D10" roughness={0.25} castShadow={false} />
              <mesh position={[lx * 0.05 * H + 0.03 * H, ly * 0.05 * H + 0.04 * H, 0.1 * H]}>
                <sphereGeometry args={[0.024 * H, 10, 8]} />
                <GlowMat color="#FFFFFF" intensity={1.2} />
              </mesh>
              {v2 && (
                // v2: small second catch-light, lower and opposite.
                <mesh position={[lx * 0.05 * H - 0.035 * H, ly * 0.05 * H - 0.035 * H, 0.1 * H]}>
                  <sphereGeometry args={[0.012 * H, 8, 6]} />
                  <GlowMat color="#FFFFFF" intensity={0.8} />
                </mesh>
              )}
              {eyeShape === 'sparkle' && (
                <mesh position={[lx * 0.05 * H - 0.04 * H, ly * 0.05 * H + 0.0, 0.11 * H]}>
                  <sphereGeometry args={[0.03 * H, 10, 8]} />
                  <GlowMat color="#FFFFFF" intensity={1.6} />
                </mesh>
              )}
            </>
          )}
        </group>
        );
      })}

      {/* Brows */}
      {[1, -1].map((s) => (
        <SCapsule
          key={s}
          radius={0.035 * H}
          length={0.2 * H}
          position={[s * ex, ey + 0.27 * H * Math.max(1, eyeScale) + browLift + (brow === 'skeptical' && s === 1 ? 0.1 * H : 0), ez * 0.98]}
          rotation={[0, s * 0.3, Math.PI / 2 + s * browTilt]}
          color={spec.hair.style === 'bald' ? shade(spec.skin, -0.25) : spec.hair.color}
        />
      ))}

      {/* Mouth */}
      <group position={[expression.mouth === 'smirk' ? 0.08 * H : 0, my, mz]} rotation={[0.42, 0, expression.mouth === 'smirk' ? 0.28 : 0]}>
        <SBall radius={0.1 * H} scale={[mw, mh, 0.6]} color="#3B1518" roughness={0.4} castShadow={false} />
        {expression.mouth === 'teeth' && (
          <SBall radius={0.08 * H} position={[0, 0.045 * H * mh, 0.04]} scale={[mw * 0.85, mh * 0.3, 0.4]} color="#F7F4EE" castShadow={false} />
        )}
        {mh > 0.45 && (
          <SBall radius={0.07 * H} position={[0, -0.04 * H * mh, 0.03]} scale={[mw * 0.9, mh * 0.45, 0.4]} color="#E06A78" castShadow={false} />
        )}
      </group>

      {/* Sweat drop */}
      {expression.sweat && (
        <mesh position={[0.62 * H, 0.5 * H, 0.62 * H]} rotation={[0, 0, -0.3]} scale={[0.7, 1.1, 0.6]}>
          <sphereGeometry args={[0.1 * H, 24, 16]} />
          <meshPhysicalMaterial color="#9AD8FF" roughness={0.1} clearcoat={1} emissive="#3A8CC8" emissiveIntensity={0.35} />
        </mesh>
      )}

      {/* v2: soft cheek warmth (always on, subtle); expression.blush still adds the strong version */}
      {v2 &&
        [1, -1].map((s) => (
          <SoftDisc key={`w${s}`} position={[s * 0.5 * H, -0.22 * H, 0.83 * H]} rotation={[0, s * 0.55, 0]} radius={0.16 * H} color="#FF8A7A" opacity={0.22} />
        ))}

      {/* Blush */}
      {expression.blush &&
        [1, -1].map((s) => (
          <mesh key={s} position={[s * 0.52 * H, -0.2 * H, 0.8 * H]} rotation={[0, s * 0.55, 0]}>
            <circleGeometry args={[0.12 * H, 20]} />
            <meshBasicMaterial color="#FF7A8A" transparent opacity={0.45} />
          </mesh>
        ))}

      {/* Glasses */}
      {glasses === 'rect' &&
        [1, -1].map((s) => (
          <group key={s} position={[s * ex, ey - 0.01 * H, ez + 0.13 * H]} rotation={[0, s * 0.25, 0]}>
            <RectFrame w={0.42 * H} h={0.32 * H} t={0.035 * H} color={gColor} />
          </group>
        ))}
      {glasses === 'round' &&
        [1, -1].map((s) => (
          <mesh key={s} position={[s * ex, ey, ez + 0.13 * H]} rotation={[0, s * 0.25, 0]}>
            <torusGeometry args={[0.19 * H, 0.022 * H, 8, 28]} />
            <meshStandardMaterial color={gColor} roughness={0.4} metalness={0.3} />
          </mesh>
        ))}
      {glasses && (
        <>
          <mesh position={[0, ey + 0.02 * H, ez + 0.16 * H]}>
            <boxGeometry args={[0.2 * H, 0.03 * H, 0.03 * H]} />
            <meshStandardMaterial color={gColor} roughness={0.4} metalness={0.3} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.84 * H, ey + 0.02 * H, 0.55 * H]} rotation={[0, -s * 0.39, 0]}>
              <boxGeometry args={[0.035 * H, 0.035 * H, 0.97 * H]} />
              <meshStandardMaterial color={gColor} roughness={0.4} metalness={0.3} />
            </mesh>
          ))}
        </>
      )}

      <Hair spec={spec} H={H} seed={seed} />
      {v2 && <HairBack spec={spec} H={H} seed={seed} />}
      {expression.hearts &&
        [1, -1].map((s2) => (
          <group key={s2} position={[s2 * 1.05 * H, (s2 > 0 ? 0.9 : 0.7) * H, 0.35 * H]} rotation={[0, 0, s2 * -0.25]} scale={0.22 * H}>
            <mesh geometry={HEART}>
              <meshStandardMaterial color="#FF5C8A" emissive="#FF5C8A" emissiveIntensity={0.35} roughness={0.5} />
            </mesh>
          </group>
        ))}
      <Hat spec={spec} H={H} seed={seed} />
    </group>
  );
};

const RectFrame: React.FC<{w: number; h: number; t: number; color: string}> = ({w, h, t, color}) => {
  const m = <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />;
  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, t, t]} />
        {m}
      </mesh>
      <mesh position={[0, -h / 2, 0]}>
        <boxGeometry args={[w, t, t]} />
        {m}
      </mesh>
      <mesh position={[w / 2, 0, 0]}>
        <boxGeometry args={[t, h + t, t]} />
        {m}
      </mesh>
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[t, h + t, t]} />
        {m}
      </mesh>
    </group>
  );
};

const Hair: React.FC<{spec: PersonSpec; H: number; seed: number}> = ({spec, H, seed}) => {
  const c = spec.hair.color;
  const c2 = shade(c, 0.08);
  const style = spec.hair.style;
  if (style === 'bald') return null;

  const cap = (sy = 0.7, y = 0.5, z = -0.2) => (
    <FIco radius={H} detail={1} position={[0, y * H, z * H]} scale={[1.1, sy, 1.08]} color={c} seed={seed + 40} />
  );

  if (style === 'buzz') return cap(0.62, 0.42, -0.12);

  if (style === 'swept') {
    return (
      <group>
        {cap()}
        <FIco radius={0.5 * H} detail={1} position={[0.2 * H, 0.95 * H, 0.38 * H]} rotation={[0.3, 0.2, -0.3]} scale={[1.35, 0.75, 1.0]} color={c2} seed={seed + 41} />
        <FIco radius={0.45 * H} detail={1} position={[-0.3 * H, 0.9 * H, 0.32 * H]} rotation={[0.2, -0.2, 0.25]} scale={[1.25, 0.75, 1.0]} color={c} seed={seed + 42} />
        <FIco radius={0.5 * H} detail={1} position={[0.0, 1.02 * H, -0.12 * H]} scale={[1.4, 0.7, 1.2]} color={c2} seed={seed + 43} />
        <FIco radius={0.32 * H} detail={1} position={[0.9 * H, 0.28 * H, -0.18 * H]} scale={[0.55, 1.0, 1.1]} color={c} seed={seed + 44} />
        <FIco radius={0.32 * H} detail={1} position={[-0.9 * H, 0.28 * H, -0.18 * H]} scale={[0.55, 1.0, 1.1]} color={c} seed={seed + 45} />
      </group>
    );
  }

  if (style === 'bun') {
    return (
      <group>
        {cap(0.66, 0.45, -0.16)}
        <FIco radius={0.36 * H} detail={1} position={[0, 1.02 * H, -0.5 * H]} color={c2} seed={seed + 46} />
      </group>
    );
  }

  if (style === 'curly') {
    const r = rng(seed + 47);
    const clumps = Array.from({length: 16}, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const ring = i % 2 === 0 ? 0.75 : 0.45;
      return [Math.cos(a) * ring * H, (0.55 + r() * 0.35) * H, Math.sin(a) * ring * H - 0.12 * H] as V3;
    });
    return (
      <group>
        {cap(0.68, 0.48, -0.16)}
        {clumps.map((p, i) => (
          <FIco key={i} radius={0.3 * H} detail={0} position={p} color={i % 3 === 0 ? c2 : c} seed={seed + 50 + i} />
        ))}
      </group>
    );
  }

  if (style === 'pigtails' || style === 'ponytail' || style === 'topknot') {
    return (
      <group>
        {cap(0.7, 0.46, -0.16)}
        <FIco radius={0.45 * H} detail={1} position={[0.1 * H, 0.78 * H, 0.5 * H]} scale={[1.5, 0.45, 0.6]} color={c2} seed={seed + 90} />
        {style === 'pigtails' && [1, -1].map((s) => (
          <FIco key={s} radius={0.3 * H} detail={1} position={[s * 0.95 * H, -0.05 * H, -0.2 * H]} scale={[0.8, 1.5, 0.8]} color={c} seed={seed + 91 + s} />
        ))}
        {style === 'ponytail' && <FIco radius={0.32 * H} detail={1} position={[0, 0.1 * H, -1.0 * H]} scale={[0.8, 1.7, 0.8]} color={c} seed={seed + 93} />}
        {style === 'topknot' && <FIco radius={0.3 * H} detail={1} position={[0, 1.1 * H, -0.1 * H]} color={c2} seed={seed + 94} />}
      </group>
    );
  }
  if (style === 'afro') {
    return <FIco radius={1.18 * H} detail={1} position={[0, 0.38 * H, -0.2 * H]} scale={[1.0, 0.95, 0.95]} color={c} seed={seed + 95} />;
  }
  if (style === 'mohawk' || style === 'spiky') {
    const n = style === 'mohawk' ? 6 : 9;
    return (
      <group>
        {cap(0.6, 0.4, -0.12)}
        {Array.from({length: n}, (_, i) => {
          const a = style === 'mohawk' ? 0 : ((i / n) * 2 - 1) * 1.1;
          const z = style === 'mohawk' ? (i / (n - 1) - 0.5) * 1.6 * H : -0.1 * H;
          return <FCyl key={i} rTop={0.01} rBottom={0.16 * H} height={0.55 * H} radial={5} position={[Math.sin(a) * 0.7 * H, 1.0 * H, z]} rotation={[0, 0, -Math.sin(a) * 0.5]} color={i % 2 ? c2 : c} seed={seed + 100 + i} />;
        })}
      </group>
    );
  }
  if (style === 'sidePart' || style === 'shaggy') {
    return (
      <group>
        {cap(0.72, 0.46, -0.16)}
        <FIco radius={0.6 * H} detail={1} position={[0.3 * H, 0.85 * H, 0.3 * H]} rotation={[0.3, 0.2, -0.5]} scale={[1.4, 0.55, 1.0]} color={c2} seed={seed + 110} />
        {style === 'shaggy' && [1, -1].map((s) => (
          <FIco key={s} radius={0.4 * H} detail={1} position={[s * 0.92 * H, 0.1 * H, 0.0]} scale={[0.6, 1.1, 0.9]} color={c} seed={seed + 111 + s} />
        ))}
      </group>
    );
  }

  // bob and long share the frame
  return (
    <group>
      {cap(0.72, 0.48, -0.18)}
      <FIco radius={0.55 * H} detail={1} position={[0.86 * H, -0.12 * H, -0.12 * H]} scale={[0.55, 1.35, 1.05]} color={c} seed={seed + 70} />
      <FIco radius={0.55 * H} detail={1} position={[-0.86 * H, -0.12 * H, -0.12 * H]} scale={[0.55, 1.35, 1.05]} color={c} seed={seed + 71} />
      <FIco radius={0.9 * H} detail={1} position={[0, 0, -0.5 * H]} scale={[1.12, 1.1, 0.6]} color={c} seed={seed + 72} />
      <FIco radius={0.5 * H} detail={1} position={[0.1 * H, 0.7 * H, 0.55 * H]} rotation={[0.2, 0, 0.15]} scale={[1.5, 0.45, 0.6]} color={c2} seed={seed + 73} />
      {style === 'long' && (
        <FIco radius={0.8 * H} detail={1} position={[0, -0.75 * H, -0.5 * H]} scale={[1.2, 1.6, 0.5]} color={c} seed={seed + 74} />
      )}
    </group>
  );
};

const Hat: React.FC<{spec: PersonSpec; H: number; seed: number}> = ({spec, H, seed}) => {
  const hat = spec.accessories?.hat;
  const color = spec.accessories?.hatColor ?? '#D23A3A';
  if (!hat) {
    if (spec.accessories?.headset) return <Headset H={H} seed={seed} />;
    return null;
  }
  if (hat === 'cap') {
    return (
      <group>
        <FIco radius={1.04 * H} detail={1} position={[0, 0.42 * H, -0.04 * H]} scale={[1.0, 0.62, 1.0]} color={color} seed={seed + 80} />
        <FBox size={[1.0 * H, 0.06 * H, 0.75 * H]} position={[0, 0.48 * H, 0.95 * H]} rotation={[-0.12, 0, 0]} color={shade(color, -0.08)} seed={seed + 81} jitter={0.01} />
      </group>
    );
  }
  if (hat === 'hardhat') {
    return (
      <group>
        <FIco radius={1.08 * H} detail={1} position={[0, 0.48 * H, 0]} scale={[1.0, 0.72, 1.02]} color={color} seed={seed + 82} />
        <FCyl rTop={1.25 * H} rBottom={1.28 * H} height={0.06 * H} radial={12} position={[0, 0.42 * H, 0.05 * H]} color={shade(color, -0.06)} seed={seed + 83} />
      </group>
    );
  }
  if (hat === 'beanie') {
    return (
      <group>
        <FIco radius={1.05 * H} detail={1} position={[0, 0.45 * H, -0.03 * H]} scale={[1.0, 0.7, 1.02]} color={color} seed={seed + 85} />
        <FCyl rTop={1.02 * H} rBottom={1.04 * H} height={0.16 * H} radial={12} position={[0, 0.2 * H, -0.03 * H]} color={shade(color, -0.08)} seed={seed + 86} />
        <FIco radius={0.16 * H} detail={0} position={[0, 1.1 * H, -0.03 * H]} color={shade(color, 0.1)} seed={seed + 87} />
      </group>
    );
  }
  if (hat === 'chef') {
    return (
      <group>
        <FCyl rTop={0.9 * H} rBottom={0.88 * H} height={0.3 * H} radial={12} position={[0, 0.7 * H, -0.03 * H]} color={color} seed={seed + 88} />
        <FIco radius={0.95 * H} detail={1} position={[0, 1.1 * H, -0.03 * H]} scale={[1.05, 0.7, 1.05]} color={color} seed={seed + 89} />
      </group>
    );
  }
  if (hat === 'headband') {
    return <FCyl rTop={1.03 * H} rBottom={1.03 * H} height={0.14 * H} radial={14} position={[0, 0.5 * H, -0.03 * H]} color={color} seed={seed + 79} />;
  }
  return <FIco radius={0.95 * H} detail={1} position={[0.15 * H, 0.75 * H, -0.05 * H]} rotation={[0, 0, -0.25]} scale={[1.15, 0.35, 1.1]} color={color} seed={seed + 84} />;
};

const Headset: React.FC<{H: number; seed: number}> = ({H, seed}) => (
  <group>
    <mesh position={[0, 0.25 * H, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[1.05 * H, 0.04 * H, 6, 24, Math.PI]} />
      <meshStandardMaterial color="#202228" roughness={0.5} />
    </mesh>
    <FCyl rTop={0.22 * H} rBottom={0.22 * H} height={0.14 * H} radial={8} position={[1.04 * H, 0, 0]} rotation={[0, 0, Math.PI / 2]} color="#202228" seed={seed + 90} />
    <FCyl rTop={0.22 * H} rBottom={0.22 * H} height={0.14 * H} radial={8} position={[-1.04 * H, 0, 0]} rotation={[0, 0, Math.PI / 2]} color="#202228" seed={seed + 91} />
    <SCapsule radius={0.025 * H} length={0.55 * H} position={[0.85 * H, -0.32 * H, 0.45 * H]} rotation={[1.1, 0, 0.6]} color="#202228" />
  </group>
);

/* ---------- v2 helpers ---------- */
const IRIS = '#4A2E1E';

/** Light sole for dark shoes, dark sole for light shoes. */
const soleFor = (shoe?: string) => {
  const c = new THREE.Color(shoe ?? '#15161A');
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return l < 0.25 ? '#D9D2C3' : '#2A2522';
};

/** Soft round gradient decal (cheeks). */
const SoftDisc: React.FC<{position: V3; rotation: V3; radius: number; color: string; opacity: number}> = ({position, rotation, radius, color, opacity}) => {
  const uniforms = React.useMemo(() => ({uColor: {value: new THREE.Color(color)}, uOpacity: {value: opacity}}), [color, opacity]);
  return (
    <mesh position={position} rotation={rotation}>
      <circleGeometry args={[radius, 24]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main(){ float d = length(vUv * 2.0 - 1.0); gl_FragColor = vec4(uColor, uOpacity * pow(1.0 - smoothstep(0.0, 1.0, d), 1.5)); }`}
      />
    </mesh>
  );
};


/** Default arm build for v2 characters (set after the arm comparison). */
export const DEFAULT_V2_ARMS: ArmStyle = 'tube';

/** Tube along a curve whose radius tapers from r0 (start) to r1 (end). */
const taperedTube = (curve: THREE.Curve<THREE.Vector3>, r0: number, r1: number, tubular: number, radial: number) => {
  const g = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const P = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, P);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(P).multiplyScalar(r).add(P);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
};

/**
 * v2 hand: small mitten sized to the wrist (palm about 2x the wrist radius, not 3.4x).
 * Hand space: fingers extend along -y (away from the elbow), +z is forward, palm faces the body (-side * x).
 * `pitch` = total forward rotation of the forearm (shoulder x - elbow), used so a thumbs-up points to the sky.
 */
const HandV2: React.FC<{side: 1 | -1; skin: string; pose: HandPose; pitch?: number}> = ({side, skin, pose, pitch = 0}) => {
  const k = shade(skin, -0.04); // fingers a hair darker than the palm so shapes read
  const palmFacesForward = pose === 'wave' || pose === 'open';
  const closed = pose === 'fist' || pose === 'point' || pose === 'thumbsUp';
  return (
    <group rotation={[0, palmFacesForward ? side * (Math.PI / 2) : 0, 0]} scale={1.12}>
      {/* palm */}
      <SBall radius={0.068} scale={closed ? [0.95, 0.92, 1.0] : palmFacesForward ? [0.55, 1.0, 1.08] : [0.66, 1.0, 0.98]} color={skin} />

      {pose === 'relaxed' && (
        <>
          {/* fingers together as one mitten, fused with the palm, tips curling slightly toward the body */}
          <SBall radius={0.052} position={[-side * 0.008, -0.052, 0.0]} rotation={[0, 0, -side * 0.22]} scale={[0.6, 1.05, 1.02]} color={skin} />
          {/* thumb on the front edge (faces the camera), resting down-forward */}
          <SCapsule radius={0.022} length={0.036} position={[-side * 0.006, -0.018, 0.062]} rotation={[0.45, 0, 0]} color={k} />
        </>
      )}

      {palmFacesForward && (
        <>
          {[-0.042, -0.014, 0.014, 0.042].map((z, i) => (
            <SCapsule key={i} radius={0.0155} length={i === 1 || i === 2 ? 0.05 : 0.042} position={[0, -0.098 - (i === 1 || i === 2 ? 0.006 : 0), z]} rotation={[z * 4.2, 0, 0]} color={k} />
          ))}
          <SCapsule radius={0.018} length={0.038} position={[0, -0.02, 0.078]} rotation={[1.05, 0, 0]} color={skin} />
        </>
      )}

      {closed && (
        <>
          {/* curled fingers: a knuckle roll across the front-bottom of the fist */}
          <SCapsule radius={0.03} length={0.07} position={[side * 0.004, -0.045, 0.028]} rotation={[Math.PI / 2, 0, 0]} color={k} />
          {pose === 'point' && <SCapsule radius={0.02} length={0.062} position={[0, -0.108, 0.045]} color={k} />}
          {pose === 'thumbsUp' ? (
            // thumb points to world up whatever the arm angle: local direction = (0, cos(-pitch), sin(-pitch))
            <SCapsule radius={0.022} length={0.05} position={[-side * 0.03, 0.068 * Math.cos(-pitch), 0.068 * Math.sin(-pitch)]} rotation={[-pitch, 0, 0]} color={skin} />
          ) : (
            // thumb wrapped across the front of the fist
            <SCapsule radius={0.019} length={0.036} position={[-side * 0.022, -0.012, 0.062]} rotation={[0, 0, side * 1.25]} color={skin} />
          )}
        </>
      )}
    </group>
  );
};

/**
 * v2 arms: shorter (reach the hip), tapered (thick shoulder, slim wrist), no hard elbow seam.
 * tube = one continuous 8-sided faceted tube; clay = the same, smooth; refined = separate tapered pieces + joint balls.
 */
const ArmV2: React.FC<{
  side: 1 | -1; shoulder: V3; rot: V3; elbow: number; spec: PersonSpec; seed: number; bw: number;
  hold?: React.ReactNode; handPose: HandPose; style: ArmStyle;
}> = ({side, shoulder, rot, elbow, spec, seed, bw, hold, handPose, style}) => {
  const upper = 0.34;
  const fore = 0.3;
  const r0 = 0.1 * bw; // shoulder
  const rE = 0.082 * bw; // elbow
  const r1 = 0.07 * bw; // wrist
  const sleeve = spec.outfit.main;
  const bare = spec.outfit.style === 'tee';
  const rough = 0.82 - 0.5 * (spec.outfit.shine ?? 0);
  const smooth = style === 'clay';
  const radial = smooth ? 20 : 8;
  const e = elbow;
  const S = new THREE.Vector3(0, 0, 0);
  const E = new THREE.Vector3(0, -upper, 0);
  const W = new THREE.Vector3(0, -upper - fore * Math.cos(e), fore * Math.sin(e));
  const geo = React.useMemo(() => {
    if (style === 'refined') return null;
    // soft elbow: the curve passes near (not through) the elbow so the bend is rounded
    const mid1 = S.clone().lerp(E, 0.55);
    const mid2 = E.clone().lerp(W, 0.45);
    const sleeveEnd = bare ? 0.5 : 1;
    const full = new THREE.CatmullRomCurve3([S, mid1, E, mid2, W], false, 'centripetal', 0.5);
    const tubular = smooth ? 28 : 14;
    if (!bare) return {sleeve: taperedTube(full, r0, r1, tubular, radial), skin: null as THREE.BufferGeometry | null};
    const up = new THREE.CatmullRomCurve3([S, S.clone().lerp(E, 0.5), S.clone().lerp(E, 0.95)]);
    const lo = new THREE.CatmullRomCurve3([S.clone().lerp(E, 0.7), E, mid2, W], false, 'centripetal', 0.5);
    void sleeveEnd;
    return {sleeve: taperedTube(up, r0 * 1.08, rE * 1.12, 8, radial), skin: taperedTube(lo, rE * 0.82, r1 * 0.9, 16, 16)};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e, bw, style, bare]);

  const sleeveMat = smooth ? <SMat color={sleeve} roughness={rough} /> : <meshStandardMaterial color={sleeve} roughness={rough} flatShading />;
  return (
    <group position={shoulder} rotation={rot}>
      {/* round shoulder */}
      <mesh position={[0, -0.01, 0]} castShadow>
        <sphereGeometry args={[r0 * 1.12, smooth ? 24 : 10, smooth ? 16 : 7]} />
        {sleeveMat}
      </mesh>
      {geo && (
        <>
          <mesh geometry={geo.sleeve} castShadow>{sleeveMat}</mesh>
          {geo.skin && (
            <mesh geometry={geo.skin} castShadow>
              <SMat color={spec.skin} />
            </mesh>
          )}
        </>
      )}
      {style === 'refined' && (
        <>
          <FCyl rTop={r0} rBottom={rE} height={upper} position={[0, -upper / 2, 0]} color={sleeve} seed={seed} radial={8} roughness={rough} jitter={0.004} />
          <mesh position={[0, -upper, 0]} castShadow>
            <sphereGeometry args={[rE * 1.02, 10, 7]} />
            <meshStandardMaterial color={sleeve} roughness={rough} flatShading />
          </mesh>
          <group position={[0, -upper, 0]} rotation={[-e, 0, 0]}>
            {bare ? (
              <mesh position={[0, -fore / 2, 0]} castShadow>
                <cylinderGeometry args={[rE * 0.85, r1 * 0.9, fore, 16]} />
                <SMat color={spec.skin} />
              </mesh>
            ) : (
              <FCyl rTop={rE} rBottom={r1} height={fore} position={[0, -fore / 2, 0]} color={sleeve} seed={seed + 2} radial={8} roughness={rough} jitter={0.004} />
            )}
          </group>
        </>
      )}
      {/* cuff + hand at the wrist, oriented with the forearm */}
      <group position={[0, -upper, 0]} rotation={[-e, 0, 0]}>
        {!bare && (
          <mesh position={[0, -fore + 0.01, 0]} castShadow>
            <cylinderGeometry args={[r1 * 1.18, r1 * 1.18, 0.05, smooth ? 20 : 8]} />
            <meshStandardMaterial color={shade(sleeve, -0.08)} roughness={rough} flatShading={!smooth} />
          </mesh>
        )}
        <group position={[0, -fore - 0.052, 0.006]}>
          <HandV2 side={side} skin={spec.skin} pose={handPose} pitch={rot[0] - elbow} />
        </group>
        {hold && <group position={[0, -fore - 0.13, 0.05]}>{hold}</group>}
      </group>
    </group>
  );
};


/** Default torso build for v2 characters. */
export const DEFAULT_V2_BODY: BodyStyle = 'shaped';

/**
 * Lathe torso: hip -> slight waist -> chest -> sloped, rounded shoulders -> neck.
 * 10 flat facets so it stays low-poly. Profile in units of torso height (y) and body width (r).
 */
/** Depth of the shaped torso relative to its width (bodies are wider than deep). */
export const TORSO_DEPTH = 0.86;

const ShapedTorso: React.FC<{hipY: number; torsoH: number; bw: number; color: string; rough: number}> = ({hipY, torsoH, bw, color, rough}) => {
  const geo = React.useMemo(() => {
    // [radius, height] — few rings = big clean facets (no banding)
    const prof: [number, number][] = [
      [0.0, 0.0], [0.36, 0.0], [0.375, 0.1], [0.355, 0.32], [0.395, 0.62], [0.385, 0.8],
      [0.31, 0.95], [0.18, 1.05], [0.0, 1.08],
    ];
    const pts = prof.map(([r, y]) => new THREE.Vector2(r * bw, y * torsoH));
    const g = new THREE.LatheGeometry(pts, 10, Math.PI / 10);
    g.computeVertexNormals();
    return g;
  }, [torsoH, bw]);
  return (
    <mesh geometry={geo} position={[0, hipY, 0]} scale={[1, 1, TORSO_DEPTH]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={rough} flatShading />
    </mesh>
  );
};


/** Heart shape for the love expression (unit size, centred). */
const HEART = (() => {
  const h = new THREE.Shape();
  h.moveTo(0, -0.9);
  h.bezierCurveTo(-0.15, -0.65, -1, -0.25, -1, 0.25);
  h.bezierCurveTo(-1, 0.75, -0.45, 0.95, 0, 0.55);
  h.bezierCurveTo(0.45, 0.95, 1, 0.75, 1, 0.25);
  h.bezierCurveTo(1, -0.25, 0.15, -0.65, 0, -0.9);
  const g = new THREE.ExtrudeGeometry(h, {depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 2, curveSegments: 10});
  g.center();
  return g;
})();

/**
 * v2: hair shell over the back of the skull so no style shows a bald back (front stays open for the face).
 * Short styles get a short shell (nape above the neck); mohawk and bald get none.
 */
const HairBack: React.FC<{spec: PersonSpec; H: number; seed: number}> = ({spec, H, seed}) => {
  const st = spec.hair.style as string;
  if (st === 'bald' || st === 'mohawk') return null;
  const short = st === 'buzz' || st === 'spiky' || st === 'sidePart' || st === 'swept' || st === 'topknot';
  return (
    <FIco
      radius={H}
      detail={1}
      position={[0, (short ? 0.02 : -0.04) * H, -0.3 * H]}
      scale={[1.03, short ? 0.96 : 1.0, short ? 0.8 : 0.84]}
      color={spec.hair.color}
      seed={seed + 99}
    />
  );
};
