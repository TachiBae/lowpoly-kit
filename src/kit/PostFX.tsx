import React, {useEffect, useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {
  BloomEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';
import {N8AOPostPass} from 'n8ao';
import type {Edge, Look} from './look';
import type {LookV2} from './lighting';
import {GradeEffect, HazeEffect, OutlineEffect} from './lookfx';

type V3 = [number, number, number];

/**
 * Miniature look: shallow depth of field, bloom on emissives, vignette, ACES tone mapping.
 *
 * Built directly on `postprocessing` (not @react-three/postprocessing) because the
 * composer must exist on the very first frame a canvas mounts — Remotion renders
 * each frame exactly once, so a composer created a tick later leaves the frame blank.
 *
 * focus = world point that stays sharp. blur = 0 disables DOF (faster previews).
 */
export const PostFX: React.FC<{
  focus: V3;
  focusRange?: number;
  blur?: number;
  bloom?: number;
  vignette?: number;
  /** v2 adds ambient occlusion, ground haze and a colour grade (settings from the preset's v2 block). */
  look?: Look;
  v2?: LookV2;
  /** Current frame (seeds film grain). */
  frame?: number;
  /** Film grain amount (v2 only; 0 = off, ~0.02 subtle). */
  grain?: number;
  /** v2 edge style. 'outline' adds a thin tinted outline; 'clean'/'soft' change nothing here. */
  edge?: Edge;
}> = ({focus, focusRange = 3, blur = 5, bloom = 1.2, vignette = 0.5, look = 'v1', v2, frame = 0, grain = 0, edge = 'clean'}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const useDof = blur > 0;
  const useV2 = look === 'v2' && !!v2;
  const useOutline = useV2 && edge === 'outline';

  const fx = useMemo(() => {
    gl.toneMapping = THREE.NoToneMapping; // tone mapping happens in the last pass
    const composer = new EffectComposer(gl, {frameBufferType: THREE.HalfFloatType, multisampling: 4});
    composer.addPass(new RenderPass(scene, camera));
    let ao: N8AOPostPass | null = null;
    let haze: HazeEffect | null = null;
    let grade: GradeEffect | null = null;
    if (useV2) {
      // Contact shading. accumulate stays false, so a frame renders identically every time.
      ao = new N8AOPostPass(scene, camera, size.width, size.height);
      ao.configuration.gammaCorrection = false; // tone mapping happens later in the chain
      ao.configuration.halfRes = true;
      ao.configuration.depthAwareUpsampling = true;
      ao.configuration.accumulate = false;
      ao.setQualityMode('Medium');
      composer.addPass(ao);
      haze = new HazeEffect(camera as THREE.PerspectiveCamera);
      composer.addPass(new EffectPass(camera, haze));
      if (useOutline) composer.addPass(new EffectPass(camera, new OutlineEffect(camera as THREE.PerspectiveCamera)));
      grade = new GradeEffect();
    }
    const dof = useDof ? new DepthOfFieldEffect(camera, {worldFocusRange: focusRange, bokehScale: blur}) : null;
    if (dof) composer.addPass(new EffectPass(camera, dof));
    const bloomFx = new BloomEffect({intensity: bloom, luminanceThreshold: 0.6, luminanceSmoothing: 0.3, mipmapBlur: true, radius: 0.72});
    const vig = new VignetteEffect({offset: 0.3, darkness: vignette});
    const tone = new ToneMappingEffect({mode: ToneMappingMode.ACES_FILMIC});
    composer.addPass(grade ? new EffectPass(camera, bloomFx, vig, tone, grade) : new EffectPass(camera, bloomFx, vig, tone));
    return {composer, dof, bloomFx, vig, ao, haze, grade};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, useDof, useV2, useOutline]);

  useEffect(() => () => fx.composer.dispose(), [fx]);

  // Live-update values every frame without rebuilding.
  fx.composer.setSize(size.width, size.height);
  fx.bloomFx.intensity = bloom;
  fx.vig.darkness = vignette;
  if (fx.dof) {
    fx.dof.target = new THREE.Vector3(...focus);
    fx.dof.bokehScale = blur;
    fx.dof.cocMaterial.worldFocusRange = focusRange;
  }

  if (useV2 && v2) {
    if (fx.ao) {
      fx.ao.configuration.intensity = v2.ao.intensity;
      fx.ao.configuration.aoRadius = v2.ao.radius;
      fx.ao.configuration.distanceFalloff = 1.0;
      fx.ao.configuration.color = new THREE.Color(v2.ao.color);
    }
    fx.haze?.set(v2.haze.color, v2.haze.height, v2.haze.density);
    fx.grade?.set(v2.grade, grain, frame);
  }

  useFrame((_, delta) => {
    camera.updateMatrixWorld(); // haze reads camera.matrixWorld directly
    fx.composer.render(delta);
  }, 1);

  return null;
};
