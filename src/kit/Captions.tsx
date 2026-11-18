import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import '@fontsource/inter/800.css';

/**
 * Top-third caption pill. Words come from word timestamps (Remotion Caption format).
 * The spoken word turns teal and grows slightly. offsetMs shifts time (for clips of a longer VO).
 */
export const Captions: React.FC<{
  captions: Caption[];
  offsetMs?: number;
  activeColor?: string;
  maxWords?: number;
}> = ({captions, offsetMs = 0, activeColor = '#3FD0E0', maxWords = 7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nowMs = (frame / fps) * 1000 + offsetMs;

  const pages = useMemo(() => {
    // 0. Brand-name repair: Whisper splits "OpenAI" into " Open" + " AI".
    captions = captions.reduce<Caption[]>((acc, c) => {
      const prev = acc[acc.length - 1];
      if (prev && prev.text.trim() === 'Open' && c.text.trim() === 'AI') {
        acc[acc.length - 1] = {...prev, text: ' OpenAI', endMs: c.endMs};
      } else acc.push(c);
      return acc;
    }, []);
    const WEAK = /^(the|a|an|in|of|to|on|at|and|or|but|for|by|with|his|her|that)$/i;
    // 1. Phrases: break after . ? ! or on a pause longer than 350ms.
    const phrases: Caption[][] = [];
    let cur: Caption[] = [];
    captions.forEach((c, i) => {
      cur.push(c);
      const next = captions[i + 1];
      const endsSentence = /[.?!]["']?$/.test(c.text.trim());
      const pause = next ? next.startMs - c.endMs : Infinity;
      if (!next || endsSentence || pause > 350) {
        phrases.push(cur);
        cur = [];
      }
    });
    // 2. Long phrases: split into even chunks of at most maxWords, preferring a break after a comma.
    const chunks: Caption[][] = [];
    for (const p of phrases) {
      if (p.length <= maxWords) {
        chunks.push(p);
        continue;
      }
      const n = Math.ceil(p.length / maxWords);
      let start = 0;
      for (let k = 1; k <= n; k++) {
        let end = k === n ? p.length : Math.round((p.length * k) / n);
        const comma = p.slice(start, Math.min(p.length, end + 2)).findIndex((w, j) => j >= end - start - 2 && /,$/.test(w.text.trim()));
        if (k < n && comma >= 0) end = start + comma + 1;
        // Never end a page on a weak word: pull the break back until it ends on a content word.
        while (k < n && end - start > 2 && WEAK.test(p[end - 1].text.trim().replace(/[^a-z]/gi, ''))) end--;
        chunks.push(p.slice(start, end));
        start = end;
      }
    }
    // 3. Polish: weak endings move to the next page; single-word pages join the previous; keep every page to 2 lines.
    const WEAK2 = /^(the|a|an|in|of|to|on|at|and|or|but|for|by|with|his|her|that|is|was|been|are|were|as|its|it|from|than|their|every|more|about|so|not|which|who|still|has|have|had|be)$/i;
    const weak = (w: Caption) => WEAK2.test(w.text.trim().replace(/[^a-z]/gi, ''));
    for (let i = 0; i < chunks.length - 1; i++) {
      const c = chunks[i];
      const hardStop = /[.?!]["']?$/.test(c[c.length - 1].text.trim());
      while (!hardStop && c.length > 2 && weak(c[c.length - 1])) chunks[i + 1].unshift(c.pop()!);
    }
    for (let i = 1; i < chunks.length; i++) {
      if (chunks[i].length === 1 && chunks[i - 1].length <= maxWords) {
        const prev = chunks[i - 1];
        const w = prev.length > 2 ? prev.pop()! : null;
        if (w) chunks[i].unshift(w);
        else {
          prev.push(...chunks[i]);
          chunks.splice(i, 1);
          i--;
        }
      }
    }
    const chars = (c: Caption[]) => c.map((w) => w.text.trim()).join(' ').length;
    for (let i = 0; i < chunks.length; i++) {
      if (chars(chunks[i]) > 42 && chunks[i].length > 3) {
        const mid = Math.ceil(chunks[i].length / 2);
        chunks.splice(i + 1, 0, chunks[i].splice(mid));
      }
    }
    return chunks
      .filter((c) => c.length)
      .map((c) => ({
        startMs: c[0].startMs,
        tokens: c.map((w) => ({text: w.text.trim(), fromMs: w.startMs, toMs: w.endMs})),
      }));
  }, [captions, maxWords]);

  const page = pages.find((p, i) => {
    const end = Math.max(p.tokens[p.tokens.length - 1].toMs + 250, pages[i + 1] ? Math.min(pages[i + 1].startMs, p.tokens[p.tokens.length - 1].toMs + 600) : Infinity);
    return nowMs >= p.startMs - 60 && nowMs < end;
  });
  if (!page) return null;

  const fadeIn = interpolate(nowMs, [page.startMs - 60, page.startMs + 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 300}}>
      <div
        style={{
          opacity: fadeIn,
          transform: `scale(${0.92 + 0.08 * fadeIn})`,
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 28,
          padding: '22px 34px',
          maxWidth: 900,
          textAlign: 'center',
          fontFamily: 'Inter',
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.15,
          color: 'white',
          letterSpacing: -0.5,
        }}
      >
        {page.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs + 80;
          return (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : ''}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  color: active ? activeColor : 'white',
                  textShadow: active ? `0 0 18px ${activeColor}88` : 'none',
                }}
              >
                {t.text}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
