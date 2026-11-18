import React from 'react';
import {AbsoluteFill} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

export type ThumbText = {
  kicker?: string; // small pill, e.g. "NVIDIA · FACT-CHECKED"
  line1: string; // white line
  line2: string; // accent line
  accent?: string; // line2 colour
  size1?: number;
  size2?: number;
};

/** Thumbnail type: teal pill + 2-line Inter 900 headline. Sits in the top band Shorts UI never covers. */
export const ThumbType: React.FC<ThumbText> = ({kicker, line1, line2, accent = '#FF4D4D', size1 = 112, size2 = 118}) => (
  <AbsoluteFill style={{fontFamily: 'Inter', alignItems: 'center'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,8,22,0.82) 0%, rgba(6,8,22,0.45) 30%, rgba(6,8,22,0) 46%)'}} />
    <div style={{position: 'absolute', top: 210, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {kicker && (
        <div style={{fontWeight: 800, fontSize: 38, letterSpacing: 6, color: '#5FE3E8', background: 'rgba(95,227,232,0.12)', border: '2px solid rgba(95,227,232,0.55)', borderRadius: 999, padding: '10px 30px', marginBottom: 30}}>
          {kicker}
        </div>
      )}
      <div style={{fontWeight: 900, fontSize: size1, lineHeight: 1.0, color: '#FFFFFF', textAlign: 'center', letterSpacing: -3, whiteSpace: 'nowrap', textShadow: '0 8px 30px rgba(0,0,0,0.55)'}}>{line1}</div>
      <div style={{fontWeight: 900, fontSize: size2, lineHeight: 1.0, color: accent, textAlign: 'center', letterSpacing: -4, whiteSpace: 'nowrap', textShadow: `0 0 40px ${accent}8C, 0 8px 30px rgba(0,0,0,0.5)`}}>{line2}</div>
    </div>
  </AbsoluteFill>
);
