import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const NAVY = '#07192E';
const ACCENT = '#FC7915';
const SLATE = '#56718C';

/** Full-frame 1080x1920 info card: navy + white text + one orange accent. */
export const InfoCardV2: React.FC<{kicker?: string; headline: string; bigNumber?: string; caption?: string}> = ({
  kicker, headline, bigNumber, caption,
}) => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f, [d, d + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rise = (d: number) => (1 - a(d)) * 24;
  const font = 'Inter, "SF Pro Display", system-ui, sans-serif';
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, #0C2540, ${NAVY} 70%)`, fontFamily: font, padding: '160px 90px', justifyContent: 'center'}}>
      {kicker && (
        <div style={{color: ACCENT, fontSize: 40, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase', opacity: a(0), transform: `translateY(${rise(0)}px)`}}>{kicker}</div>
      )}
      <div style={{width: 120, height: 8, borderRadius: 4, background: ACCENT, margin: '28px 0', opacity: a(3)}} />
      <div style={{color: '#FFFFFF', fontSize: 84, fontWeight: 800, lineHeight: 1.08, opacity: a(6), transform: `translateY(${rise(6)}px)`}}>{headline}</div>
      {bigNumber && (
        <div style={{color: '#FFFFFF', fontSize: 240, fontWeight: 900, lineHeight: 1, marginTop: 60, opacity: a(12), transform: `translateY(${rise(12)}px)`}}>{bigNumber}</div>
      )}
      {caption && (
        <div style={{color: SLATE, fontSize: 46, fontWeight: 600, marginTop: 40, lineHeight: 1.25, opacity: a(18), transform: `translateY(${rise(18)}px)`}}>{caption}</div>
      )}
    </AbsoluteFill>
  );
};
