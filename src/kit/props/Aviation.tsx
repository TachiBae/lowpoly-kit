import React, {useMemo} from 'react';
import * as THREE from 'three';
import {FBox, FCyl, FIco} from '../lowpoly';
import {Label3D} from './Fx';

type V3 = [number, number, number];
type Placed = {position?: V3; rotation?: V3; scale?: number};

/* ------------------------------------------------------------------ */
/* Airplane: chunky toy jet. Nose points +X.                           */
/* ------------------------------------------------------------------ */
export const Airplane: React.FC<Placed & {color?: string; accent?: string; lights?: number}> = ({position, rotation, scale = 1, color = '#F2EEE4', accent = '#2F7DD1', lights = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
      <capsuleGeometry args={[0.16, 0.95, 6, 10]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
    <FBox size={[0.34, 0.04, 1.35]} position={[0.02, -0.04, 0]} color={color} seed={801} jitter={0.005} />
    <FBox size={[0.2, 0.03, 0.55]} position={[-0.56, 0.02, 0]} color={color} seed={802} jitter={0.005} />
    <FBox size={[0.24, 0.32, 0.03]} position={[-0.58, 0.2, 0]} rotation={[0, 0, -0.35]} color={accent} seed={803} jitter={0.005} />
    <FCyl rTop={0.06} rBottom={0.07} height={0.22} radial={7} position={[0.08, -0.14, 0.32]} rotation={[0, 0, Math.PI / 2]} color="#9AA3B5" seed={804} />
    <FCyl rTop={0.06} rBottom={0.07} height={0.22} radial={7} position={[0.08, -0.14, -0.32]} rotation={[0, 0, Math.PI / 2]} color="#9AA3B5" seed={805} />
    {[0.25, 0.1, -0.05, -0.2].map((x, i) => (
      <mesh key={i} position={[x, 0.06, 0.161]}>
        <boxGeometry args={[0.06, 0.04, 0.005]} />
        <meshStandardMaterial color="#1B2A55" emissive="#9FE8FF" emissiveIntensity={0.4} />
      </mesh>
    ))}
    {lights > 0 && (
      <>
        <mesh position={[0.02, -0.04, 0.68]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshBasicMaterial color="#39E58C" toneMapped={false} />
        </mesh>
        <mesh position={[0.02, -0.04, -0.68]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshBasicMaterial color="#FF4D5E" toneMapped={false} />
        </mesh>
      </>
    )}
  </group>
);

/* ------------------------------------------------------------------ */
/* Router: chunky box, antennas, port LEDs. `status` 0 ok .. 1 alarm.   */
/* ------------------------------------------------------------------ */
export const Router: React.FC<Placed & {status?: number; blink?: number; dusty?: boolean; color?: string}> = ({position, rotation, scale = 1, status = 0, blink = 0, dusty = false, color}) => {
  const body = color ?? (dusty ? '#6E6A5E' : '#2A3146');
  const led = new THREE.Color('#39E58C').lerp(new THREE.Color('#FF3B2F'), status).getStyle();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <FBox size={[1.2, 0.32, 0.8]} position={[0, 0.16, 0]} color={body} seed={811} jitter={0.01} />
      <FBox size={[1.24, 0.04, 0.84]} position={[0, 0.33, 0]} color={dusty ? '#8A8576' : '#1C2233'} seed={812} jitter={0.004} />
      {[-0.42, 0.42].map((x, i) => (
        <group key={i} position={[x, 0.34, -0.3]} rotation={[i === 0 ? 0.15 : -0.1, 0, i === 0 ? 0.25 : -0.2]}>
          <FCyl rTop={0.025} rBottom={0.04} height={0.55} radial={5} position={[0, 0.27, 0]} color="#1A1E29" seed={813 + i} />
        </group>
      ))}
      {[...Array(6)].map((_, i) => {
        const on = ((Math.floor(blink * 3) + i * 2) % 3 !== 0) || status < 0.5;
        return (
          <mesh key={i} position={[-0.42 + i * 0.13, 0.17, 0.405]}>
            <boxGeometry args={[0.06, 0.04, 0.01]} />
            <meshBasicMaterial color={on ? led : '#222'} toneMapped={false} />
          </mesh>
        );
      })}
      {status > 0 && (
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.75, 16, 12]} />
          <meshBasicMaterial color="#FF3B2F" transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.BackSide} />
        </mesh>
      )}
      {dusty && (
        <>
          <FIco radius={0.06} detail={0} position={[0.3, 0.36, 0.2]} color="#9C968A" seed={817} />
          <FIco radius={0.05} detail={0} position={[-0.2, 0.36, 0.25]} color="#9C968A" seed={818} />
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Laptop (open) with glowing screen.                                    */
/* ------------------------------------------------------------------ */
export const Laptop: React.FC<Placed & {screen?: string; glow?: number}> = ({position, rotation, scale = 1, screen = '#39E58C', glow = 1.4}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.7, 0.03, 0.48]} position={[0, 0.015, 0]} color="#22252E" seed={821} jitter={0.004} />
    <group position={[0, 0.03, -0.24]} rotation={[-0.25, 0, 0]}>
      <FBox size={[0.7, 0.46, 0.025]} position={[0, 0.23, 0]} color="#22252E" seed={822} jitter={0.004} />
      <mesh position={[0, 0.23, 0.014]}>
        <planeGeometry args={[0.62, 0.38]} />
        <meshStandardMaterial color={screen} emissive={screen} emissiveIntensity={glow} />
      </mesh>
    </group>
  </group>
);

/* ------------------------------------------------------------------ */
/* Departures board: rows of CITY / TIME / STATUS. `held` rows show the  */
/* `heldText` status in red; the rest show "ON TIME" in green.          */
/* ------------------------------------------------------------------ */
const CITIES = ['ATLANTA', 'CHICAGO', 'DALLAS', 'DENVER', 'NEW YORK', 'SEATTLE'];
const TIMES = ['3:55P', '4:02P', '4:10P', '4:15P', '4:20P', '4:31P'];
export const DeparturesBoard: React.FC<Placed & {held?: number; heldText?: string; flip?: number}> = ({position, rotation, scale = 1, held = 0, heldText = 'HOLD', flip = 0}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[3.4, 2.3, 0.12]} position={[0, 0, -0.07]} color="#0C0F18" seed={831} jitter={0.004} />
    <FBox size={[3.5, 0.08, 0.16]} position={[0, 1.17, -0.05]} color="#2A2F3E" seed={832} jitter={0.004} />
    <Label3D text="DEPARTURES" size={0.2} color="#FFC233" glow={1.6} position={[-1.5, 0.92, 0.01]} anchorX="left" />
    {CITIES.map((c, i) => {
      const isHeld = i < held;
      const flipping = i === Math.floor(held) && flip > 0;
      const y = 0.55 - i * 0.3;
      return (
        <group key={c} position={[0, y, 0.01]} scale={[1, flipping ? Math.abs(Math.cos(flip * Math.PI)) * 0.9 + 0.1 : 1, 1]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[3.2, 0.24]} />
            <meshBasicMaterial color={isHeld ? '#2A0B0E' : '#121726'} />
          </mesh>
          <Label3D text={c} size={0.15} color="#F2EEE4" position={[-1.5, 0, 0]} anchorX="left" />
          <Label3D text={TIMES[i]} size={0.15} color="#9FB3D9" position={[0.15, 0, 0]} anchorX="left" />
          <Label3D text={isHeld ? heldText : 'ON TIME'} size={0.15} color={isHeld ? '#FF4D5E' : '#39E58C'} glow={1.4} position={[1.52, 0, 0]} anchorX="right" />
        </group>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ */
/* Podium with mics and a front plate.                                   */
/* ------------------------------------------------------------------ */
export const Podium: React.FC<Placed & {plate?: string; color?: string}> = ({position, rotation, scale = 1, plate, color = '#3A2A22'}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[0.9, 1.15, 0.55]} position={[0, 0.575, 0]} color={color} seed={841} jitter={0.008} />
    <FBox size={[1.0, 0.06, 0.65]} position={[0, 1.18, 0]} rotation={[0.15, 0, 0]} color="#2A1E18" seed={842} jitter={0.004} />
    {[-0.12, 0, 0.12].map((x, i) => (
      <group key={i} position={[x, 1.2, 0.18]} rotation={[-0.5 + i * 0.05, 0, (i - 1) * 0.2]}>
        <FCyl rTop={0.012} rBottom={0.012} height={0.2} radial={5} position={[0, 0.1, 0]} color="#1A1A1A" seed={843 + i} />
        <FIco radius={0.04} detail={0} position={[0, 0.21, 0]} color={['#C4302B', '#2F7DD1', '#1A1A1A'][i]} seed={846 + i} />
      </group>
    ))}
    {plate && (
      <>
        <mesh position={[0, 0.75, 0.28]}>
          <planeGeometry args={[0.8, 0.22]} />
          <meshStandardMaterial color="#F2EEE4" />
        </mesh>
        <Label3D text={plate} size={0.065} color="#16181E" position={[0, 0.75, 0.285]} maxWidth={0.76} />
      </>
    )}
  </group>
);

/* ------------------------------------------------------------------ */
/* Generic domed legislature building (not a replica).                   */
/* ------------------------------------------------------------------ */
export const Dome: React.FC<Placed & {color?: string; label?: string}> = ({position, rotation, scale = 1, color = '#E9E4D8', label}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[4.2, 0.3, 1.6]} position={[0, 0.15, 0]} color="#CFC8B8" seed={851} jitter={0.01} />
    <FBox size={[3.8, 1.0, 1.3]} position={[0, 0.8, 0]} color={color} seed={852} jitter={0.01} />
    {[...Array(8)].map((_, i) => (
      <FCyl key={i} rTop={0.07} rBottom={0.08} height={0.9} radial={6} position={[-1.4 + i * 0.4, 0.75, 0.7]} color="#F7F3EA" seed={853 + i} />
    ))}
    <FBox size={[3.9, 0.12, 1.4]} position={[0, 1.36, 0]} color="#DCD5C6" seed={862} jitter={0.005} />
    <FCyl rTop={0.75} rBottom={0.8} height={0.5} radial={12} position={[0, 1.65, 0]} color={color} seed={863} />
    <mesh position={[0, 1.9, 0]} castShadow>
      <sphereGeometry args={[0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} flatShading roughness={0.6} />
    </mesh>
    <FCyl rTop={0.06} rBottom={0.12} height={0.45} radial={6} position={[0, 2.85, 0]} color="#F7F3EA" seed={864} />
    {label && <Label3D text={label} size={0.2} color="#16181E" position={[0, 1.15, 0.66]} />}
  </group>
);

/* ------------------------------------------------------------------ */
/* Contiguous US silhouette (simplified) + ARTCC-style center points.   */
/* Map units: x = east, z = south. ~4.3 wide.                             */
/* ------------------------------------------------------------------ */
const US_OUTLINE: [number, number][] = [
  [-124.7, 48.4], [-124.2, 42.0], [-120.6, 34.5], [-117.1, 32.5], [-114.7, 32.7], [-111.1, 31.3], [-108.2, 31.3], [-106.5, 31.8],
  [-103.3, 29.0], [-99.5, 27.5], [-97.2, 25.9], [-97.4, 28.0], [-94.0, 29.7], [-89.6, 29.2], [-88.0, 30.4], [-85.0, 29.7],
  [-82.7, 27.5], [-80.4, 25.2], [-80.0, 26.8], [-81.3, 30.5], [-80.9, 32.0], [-75.5, 35.2], [-76.0, 37.0], [-74.0, 40.5],
  [-70.0, 41.6], [-70.7, 43.1], [-67.0, 44.8], [-69.2, 47.4], [-71.5, 45.0], [-75.0, 45.0], [-79.0, 43.2], [-82.5, 41.7],
  [-84.0, 46.5], [-88.0, 48.0], [-95.2, 49.0], [-123.0, 49.0],
];
export const usXZ = (lon: number, lat: number): [number, number] => [(lon + 96) * 0.075, -(lat - 38) * 0.09];
export const CENTERS: [number, number][] = [
  [-122.3, 47.6], [-122.3, 37.8], [-118.2, 34.0], [-111.9, 40.8], [-104.9, 39.7], [-106.6, 35.1], [-93.3, 45.0], [-94.6, 39.1],
  [-97.3, 32.8], [-95.4, 29.8], [-87.6, 41.9], [-86.2, 39.8], [-90.0, 35.1], [-81.7, 41.5], [-84.4, 33.7], [-81.7, 30.3],
  [-80.2, 25.8], [-77.5, 39.0], [-73.1, 40.8], [-71.5, 42.8],
];

export const USMap: React.FC<Placed & {color?: string; edge?: string; alarm?: number; pulse?: number; centers?: boolean}> = ({
  position,
  rotation,
  scale = 1,
  color = '#2B4C7E',
  edge = '#3FD0E0',
  alarm = 0,
  pulse = 0,
  centers = true,
}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    US_OUTLINE.forEach(([lon, lat], i) => {
      const [x, z] = usXZ(lon, lat);
      if (i === 0) s.moveTo(x, -z);
      else s.lineTo(x, -z);
    });
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.12, bevelEnabled: false});
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 30), [geo]);
  const red = new THREE.Color(color).lerp(new THREE.Color('#5A1018'), alarm).getStyle();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial color={red} flatShading roughness={0.8} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edge} transparent opacity={0.7} />
      </lineSegments>
      {centers &&
        CENTERS.map(([lon, lat], i) => {
          const [x, z] = usXZ(lon, lat);
          const on = alarm > 0 && ((Math.floor(pulse * 6) + i) % 3 !== 0);
          return (
            <group key={i} position={[x, 0.14, z]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 0.06, 10]} />
                <meshBasicMaterial color={alarm > 0 ? (on ? '#FF3B2F' : '#5A1018') : '#3FD0E0'} toneMapped={false} />
              </mesh>
              {alarm > 0 && on && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                  <ringGeometry args={[0.07, 0.09 + 0.05 * ((pulse * 6) % 1), 20]} />
                  <meshBasicMaterial color="#FF3B2F" transparent opacity={0.6} toneMapped={false} />
                </mesh>
              )}
            </group>
          );
        })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Police-style lineup wall with height lines.                           */
/* ------------------------------------------------------------------ */
export const LineupWall: React.FC<Placed & {w?: number; h?: number}> = ({position, rotation, scale = 1, w = 7, h = 3.2}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[w, h, 0.1]} position={[0, h / 2, -0.05]} color="#3A4158" seed={871} jitter={0.004} />
    {[...Array(7)].map((_, i) => (
      <group key={i} position={[0, 0.4 + i * 0.4, 0.01]}>
        <mesh>
          <planeGeometry args={[w, 0.02]} />
          <meshBasicMaterial color="#9FB3D9" transparent opacity={0.5} />
        </mesh>
        <Label3D text={`${(i + 1) * 1}'`} size={0.12} color="#9FB3D9" position={[-w / 2 + 0.25, 0.08, 0]} />
      </group>
    ))}
  </group>
);

/* ------------------------------------------------------------------ */
/* Tag: a flat label slab (used for verdict stamps on suspects).         */
/* ------------------------------------------------------------------ */
const lum = (hex: string) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const Tag: React.FC<Placed & {text: string; color?: string; textColor?: string; w?: number; size?: number}> = ({position, rotation, scale = 1, text, color = '#FF4D5E', textColor: tc, w = 1.6, size = 0.17}) => {
  const textColor = tc ?? (lum(color) > 0.45 ? '#16181E' : '#FFFFFF');
  return (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[w, size * 2.2, 0.05]} color={color} seed={881} jitter={0.004} emissive={color} emissiveIntensity={0.1} />
    <Label3D text={text} size={size} color={textColor} position={[0, 0, 0.03]} maxWidth={w - 0.1} />
  </group>
  );
};

/* ------------------------------------------------------------------ */
/* Utility hut (remote site) + pole.                                    */
/* ------------------------------------------------------------------ */
export const Hut: React.FC<Placed & {sign?: string}> = ({position, rotation, scale = 1, sign}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <FBox size={[1.6, 1.2, 1.2]} position={[0, 0.6, 0]} color="#B9B2A2" seed={891} jitter={0.01} />
    <FBox size={[1.8, 0.12, 1.4]} position={[0, 1.26, 0]} rotation={[0, 0, 0.05]} color="#6E6A5E" seed={892} jitter={0.008} />
    <FBox size={[0.45, 0.8, 0.04]} position={[0.35, 0.4, 0.61]} color="#5A5F6E" seed={893} jitter={0.004} />
    {sign && (
      <>
        <mesh position={[-0.35, 0.8, 0.611]}>
          <planeGeometry args={[0.7, 0.28]} />
          <meshStandardMaterial color="#F2EEE4" />
        </mesh>
        <Label3D text={sign} size={0.075} color="#16181E" position={[-0.35, 0.8, 0.615]} maxWidth={0.66} />
      </>
    )}
    <FCyl rTop={0.05} rBottom={0.07} height={2.6} radial={6} position={[-1.3, 1.3, -0.2]} color="#6B4A30" seed={894} />
    <FBox size={[0.9, 0.06, 0.06]} position={[-1.3, 2.45, -0.2]} color="#6B4A30" seed={895} jitter={0.004} />
  </group>
);

/** A cable as a tube along a curve. `glow` > 0 for fiber. */
export const Cable: React.FC<{points: V3[]; radius?: number; color?: string; glow?: number}> = ({points, radius = 0.04, color = '#B5642A', glow = 0}) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 48, radius, 8, false), [points, radius]);
  return (
    <mesh geometry={geo} castShadow>
      {glow > 0 ? <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} toneMapped={false} /> : <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />}
    </mesh>
  );
};
