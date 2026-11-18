import * as THREE from 'three';
import {BlendFunction, Effect, EffectAttribute} from 'postprocessing';

/**
 * Ground haze (v2 look). Rebuilds each pixel's world position from depth and blends
 * toward a haze colour, thicker with distance and near the ground (below `height`).
 * The sky (depth = far plane) is left alone so the horizon stays clean.
 */
export class HazeEffect extends Effect {
  constructor(camera: THREE.PerspectiveCamera, {color = '#36569A', height = 0.9, density = 0.4} = {}) {
    super(
      'HazeEffect',
      /* glsl */ `
      uniform vec3 hazeColor;
      uniform float hazeHeight;
      uniform float hazeDensity;
      uniform mat4 projInv;
      uniform mat4 camWorld;
      void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
        if (depth >= 0.99999) { outputColor = inputColor; return; }
        vec4 v = projInv * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        v /= v.w;
        vec3 w = (camWorld * v).xyz;
        float dist = length(v.xyz);
        float low = clamp(1.0 - w.y / hazeHeight, 0.0, 1.0);
        low = low * low * (3.0 - 2.0 * low);
        // Nothing within ~5 units of the camera (keeps subjects and floors true); builds with distance.
        float far = 1.0 - exp(-max(dist - 5.0, 0.0) * 0.06);
        float a = clamp(hazeDensity * far * (0.45 + 0.55 * low), 0.0, 0.7);
        outputColor = vec4(mix(inputColor.rgb, hazeColor, a), inputColor.a);
      }`,
      {
        attributes: EffectAttribute.DEPTH,
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ['hazeColor', new THREE.Uniform(new THREE.Color(color))],
          ['hazeHeight', new THREE.Uniform(height)],
          ['hazeDensity', new THREE.Uniform(density)],
          // Live references: always the camera's current matrices.
          ['projInv', new THREE.Uniform(camera.projectionMatrixInverse)],
          ['camWorld', new THREE.Uniform(camera.matrixWorld)],
        ]),
      },
    );
  }
  set(color: string, height: number, density: number) {
    (this.uniforms.get('hazeColor')!.value as THREE.Color).set(color);
    this.uniforms.get('hazeHeight')!.value = height;
    this.uniforms.get('hazeDensity')!.value = density;
  }
}

/**
 * Split-tone grade (v2 look), applied after tone mapping: cool tint in the shadows,
 * warm tint in the highlights, saturation and contrast. Optional film grain seeded
 * by the frame number (deterministic: the same frame always gets the same grain).
 */
export class GradeEffect extends Effect {
  constructor() {
    super(
      'GradeEffect',
      /* glsl */ `
      uniform vec3 shadowTint;
      uniform vec3 highTint;
      uniform float amount;
      uniform float sat;
      uniform float contrast;
      uniform float grain;
      uniform float seed;
      float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 norm(vec3 t) { return t / max(lum(t), 1e-3); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed * 0.618) * 43758.5453); }
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = max(inputColor.rgb, 0.0);
        float l = clamp(lum(c), 0.0, 1.0);
        c = mix(vec3(lum(c)), c, sat);
        c = max((c - 0.18) * contrast + 0.18, 0.0);
        float ws = pow(1.0 - l, 2.0);
        float wh = pow(l, 2.0);
        c = mix(c, c * norm(shadowTint), amount * ws);
        c = mix(c, c * norm(highTint), amount * wh);
        if (grain > 0.0) c += (hash(gl_FragCoord.xy) - 0.5) * grain;
        outputColor = vec4(c, inputColor.a);
      }`,
      {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ['shadowTint', new THREE.Uniform(new THREE.Color('#2A4FA8'))],
          ['highTint', new THREE.Uniform(new THREE.Color('#FFD3A0'))],
          ['amount', new THREE.Uniform(0.3)],
          ['sat', new THREE.Uniform(1)],
          ['contrast', new THREE.Uniform(1)],
          ['grain', new THREE.Uniform(0)],
          ['seed', new THREE.Uniform(0)],
        ]),
      },
    );
  }
  set(g: {shadows: string; highlights: string; amount: number; sat: number; contrast: number}, grain: number, frame: number) {
    (this.uniforms.get('shadowTint')!.value as THREE.Color).set(g.shadows);
    (this.uniforms.get('highTint')!.value as THREE.Color).set(g.highlights);
    this.uniforms.get('amount')!.value = g.amount;
    this.uniforms.get('sat')!.value = g.sat;
    this.uniforms.get('contrast')!.value = g.contrast;
    this.uniforms.get('grain')!.value = grain;
    this.uniforms.get('seed')!.value = frame % 997;
  }
}

/**
 * Soft tinted outline (v2 'outline' edge). Depth-discontinuity edge detect in view space,
 * blended toward a tint (never black) with limited strength so it stays gentle.
 */
export class OutlineEffect extends Effect {
  constructor(camera: THREE.PerspectiveCamera, {color = '#3A3F63', strength = 0.55, thickness = 1.0} = {}) {
    super(
      'OutlineEffect',
      /* glsl */ `
      uniform vec3 lineColor;
      uniform float lineStrength;
      uniform float lineThickness;
      uniform mat4 projInv;
      float viewZ(vec2 uv) {
        float d = readDepth(uv);
        vec4 v = projInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
        return -v.z / v.w;
      }
      void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
        if (depth >= 0.99999) { outputColor = inputColor; return; }
        vec2 o = texelSize * lineThickness;
        float c = viewZ(uv);
        float n = viewZ(uv + vec2(0.0, o.y));
        float s = viewZ(uv - vec2(0.0, o.y));
        float e = viewZ(uv + vec2(o.x, 0.0));
        float w = viewZ(uv - vec2(o.x, 0.0));
        float diff = abs(n - c) + abs(s - c) + abs(e - c) + abs(w - c);
        float edge = smoothstep(0.04, 0.22, diff / max(c, 0.5) * 6.0);
        outputColor = vec4(mix(inputColor.rgb, lineColor, edge * lineStrength), inputColor.a);
      }`,
      {
        attributes: EffectAttribute.DEPTH,
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ['lineColor', new THREE.Uniform(new THREE.Color(color))],
          ['lineStrength', new THREE.Uniform(strength)],
          ['lineThickness', new THREE.Uniform(thickness)],
          ['projInv', new THREE.Uniform(camera.projectionMatrixInverse)],
        ]),
      },
    );
  }
}
