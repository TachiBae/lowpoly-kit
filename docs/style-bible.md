# Style bible v2

Direction: daylight toy-diorama. Bright sky, warm ground, soft cool shadows, a few clean accents.
Decisions in force (change by telling Claude): palette = blend; no Color References images yet (drop them in library/refs/); no recurring host character yet.

## Palette
Tokens: `paletteV2` in src/kit/palette.ts. 60/30/10 rule: neutrals (sky, ground), mid tones (buildings, props), accents (sun, pink, cyan, violet).
Info cards: deep navy + white text + one orange accent (#FC7915), as in the reference Short.
Shadows are tinted blue-violet (#5A5FA8), never black. Outlines, if used, are #3A3F63 and thin.

## Shapes
Rounded over sharp: bevel every box, big soft heads, mitten hands. Facets only where flat shading adds interest (terrain, rocks, machines).

## Characters
Large head, dot eyes with iris ring and two catch-lights, soft cheek warmth, light and dark shoe soles, contact shadow. Roles come from costume and prop, never likeness.

## Lighting
Daylight presets lead (day, golden, overcast). Dark presets (midnightMonitor, alarmRed) stay for tension beats only, max one accent per video.

## Edges
Candidates to review in Step 6: cleaner AA, softer bevels, thin tinted outline. Pick one.

## What exists now (built)
- Presets: sunnyDay, peachMorning, softOvercast (+ Clouds prop). Dark presets kept for tension beats.
- Characters: 8 new hairs, 7 new outfits, 3 hats, 5 mouths, 3 brows, eyeShape (happy/sleepy/wink/sparkle/squint), nose styles, freckles, 6 hand poses; acting.ts (13 expressions, 10 poses); 6 new example characters.
- Kits: props/Daylight.tsx (MeadowHill, CityDay, AirfieldDay, ClassroomDay, LabDay), props/PropsV2.tsx, cards/InfoCardV2.tsx.
- Edge: `edge` prop on Stage or EdgeContext: 'clean' | 'soft' | 'outline'. Default clean; soft recommended (no extra cost).
- Test scenes: DaylightLab, DaylightLab-soft, DaylightLab-outline (stills at 30/90/150/210).
- Props: Kenney CC0 library wired in (see kit-catalog "Kenney asset library").
