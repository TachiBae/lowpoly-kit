import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import '@fontsource/inter/800.css';
import {Person} from './character/Person';
import {examples} from './character/examples';
import {LightRig, presets} from './lighting';
import {CameraRig} from './CameraRig';
import {PostFX} from './PostFX';
import {ChipSlab} from './props/Chips';
import {Magnifier, MoneyBag, Pawn, PhoneBuddy, Stamp} from './props/Story';

type V3 = [number, number, number];

/** Everything the kit can make, on a slow turntable. Open in Studio to browse. */
export const KitGallery: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const spin = Math.sin(f / 40) * 0.5;
  const cast = [...examples];
  const row1 = cast.slice(0, 3);
  const row2 = cast.slice(3, 7);
  const light = {...presets.duskGlow, fog: {...presets.duskGlow.fog, near: 40, far: 90}};

  const props: {x: number; el: React.ReactNode}[] = [
    {x: -2.75, el: <ChipSlab size={0.8} thickness={0.2} rotation={[0.5, spin, 0]} position={[0, 0.4, 0]} />},
    {x: -1.65, el: <Magnifier scale={0.45} position={[0, 1.35, 0]} rotation={[0, spin, 0.3]} />},
    {x: -0.55, el: <MoneyBag scale={0.55} rotation={[0, spin, 0]} />},
    {x: 0.55, el: <PhoneBuddy scale={0.38} position={[0, 0.45, 0]} rotation={[0, spin, 0]} />},
    {x: 1.65, el: <Stamp scale={0.75} rotation={[0, spin, 0]} />},
    {x: 2.75, el: <Pawn scale={0.6} turn={spin} />},
  ];

  const lineup = (row: typeof cast, y: number, spacing: number) =>
    row.map((spec, i) => {
      const x = (i - (row.length - 1) / 2) * spacing;
      return <Person key={spec.name} spec={spec} position={[x, y, 0] as V3} rotation={[0, spin + (i % 2 ? 0.2 : -0.2), 0]} scale={0.85} expression={{mouth: 'smile', blink: (f + i * 17) % 90 < 3 ? 1 : 0}} pose={{armL: [0, 0, 0.18], armR: [0, 0, -0.18]}} />;
    });

  return (
    <AbsoluteFill style={{backgroundColor: light.skyTop}}>
      <ThreeCanvas width={width} height={height} shadows gl={{toneMapping: THREE.ACESFilmicToneMapping}}>
        <CameraRig position={[0, 3.6, 24]} target={[0, 3.2, 0]} fov={29} />
        <LightRig preset={light} target={[0, 3, 0]} />
        {lineup(row1, 5.4, 1.9)}
        {lineup(row2, 1.6, 1.6)}
        {props.map((p, i) => (
          <group key={i} position={[p.x, -2.1, 0]}>
            {p.el}
          </group>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
          <planeGeometry args={[40, 6]} />
          <shadowMaterial opacity={0.25} />
        </mesh>
        <PostFX focus={[0, 3, 0]} blur={0} bloom={0.6} vignette={0.35} />
      </ThreeCanvas>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 70, fontFamily: 'Inter', fontWeight: 800, color: 'white'}}>
        <div style={{fontSize: 64}}>Low Poly Kit</div>
        <div style={{fontSize: 30, opacity: 0.7, marginTop: 8}}>7 characters from 1 generator · 6 props</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
