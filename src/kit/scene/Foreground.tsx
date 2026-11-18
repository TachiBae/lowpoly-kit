import React, {useMemo} from 'react';
import {Asset} from '../props/Asset';
import {Cam, faceCamYaw, half, lcg, screenToWorld} from '../frame';
import {SettingId, settings} from './settings';

type V3 = [number, number, number];
export type FgSide = 'left' | 'right' | 'bottomLeft' | 'bottomRight';
export type FgStrength = 'bold' | 'subtle';

// Anchors sit outside the frame so only part of the element shows (and its base is never seen).
const ANCHOR: Record<FgSide, [number, number]> = {
  left: [-1.2, -1.1],
  right: [1.2, -1.1],
  bottomLeft: [-0.85, -1.2],
  bottomRight: [0.85, -1.2],
};

/**
 * Foreground framing: ONE element, 1.2-2.6 units from the camera, mostly off-frame, slightly darkened so it
 * reads as a soft frame (DOF blurs it). Never reaches the caption third. Side flips away from the subject.
 */
export const Foreground: React.FC<{
  setting: SettingId;
  cam: Cam;
  strength?: FgStrength;
  side?: FgSide;
  seed?: number;
  d?: number;
  subjectU?: number;
}> = ({setting, cam, strength = 'subtle', side = 'bottomLeft', seed = 1, d = 1.8, subjectU = 0}) => {
  const list = settings[setting].fg;
  const o = useMemo(() => {
    const r = lcg(seed * 31 + 5);
    let sd = side;
    const onLeft = sd === 'left' || sd === 'bottomLeft';
    if (Math.abs(subjectU) > 0.45 && subjectU < 0 === onLeft) sd = onLeft ? (sd === 'left' ? 'right' : 'bottomRight') : sd === 'right' ? 'left' : 'bottomLeft';
    const [u, v] = ANCHOR[sd];
    const H = half(cam, d).halfH * 2;
    const p = screenToWorld(cam, u, v, d) as V3;
    return {id: list[Math.floor(r() * list.length)], p, h: (strength === 'bold' ? 0.42 : 0.26) * H, ry: (r() - 0.5) * 0.8};
  }, [cam, list, side, seed, strength, d, subjectU]);
  return <Asset id={o.id} position={o.p} rotation={[0, faceCamYaw(cam, o.p) + o.ry, 0]} fitHeight={o.h} mix={{color: '#33405E', amount: 0.22}} castShadow={false} receiveShadow={false} />;
};
