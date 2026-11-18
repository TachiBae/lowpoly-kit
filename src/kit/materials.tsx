import React from 'react';

type MatProps = {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  opacity?: number;
  /** v2 facet shading (geometry must carry a colour attribute, as facet() output does). */
  vertexColors?: boolean;
};

/** FACETED family: flat shaded, matte, one saturated color per part. */
export const FMat: React.FC<MatProps> = ({color, emissive, emissiveIntensity = 1, roughness = 0.82, opacity, vertexColors = false}) => (
  <meshStandardMaterial
    key={vertexColors ? 'vc' : 'plain'}
    vertexColors={vertexColors}
    color={color}
    flatShading
    roughness={roughness}
    metalness={0.04}
    emissive={emissive ?? '#000000'}
    emissiveIntensity={emissive ? emissiveIntensity : 0}
    transparent={opacity !== undefined}
    opacity={opacity ?? 1}
  />
);

/** SMOOTH family: soft clay / vinyl, no visible facets. */
export const SMat: React.FC<MatProps> = ({color, emissive, emissiveIntensity = 1, roughness = 0.6, opacity}) => (
  <meshPhysicalMaterial
    color={color}
    roughness={roughness}
    metalness={0}
    clearcoat={0.15}
    clearcoatRoughness={0.6}
    sheen={0.3}
    sheenColor="#ffffff"
    emissive={emissive ?? '#000000'}
    emissiveIntensity={emissive ? emissiveIntensity : 0}
    transparent={opacity !== undefined}
    opacity={opacity ?? 1}
  />
);

/** Glowing practical light (bulbs, LEDs, screens). Blooms in PostFX. */
export const GlowMat: React.FC<{color: string; intensity?: number}> = ({color, intensity = 3}) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
);
