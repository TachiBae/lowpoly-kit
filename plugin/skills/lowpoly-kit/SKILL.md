---
name: lowpoly-kit
description: Build vertical (1080x1920) low-poly 3D shots in Remotion with lowpoly-kit - chibi characters, expressions, gestures, walking and sitting, shot recipes, sets and lighting presets. Use when the user works in a lowpoly-kit project or asks for a low-poly character shot, scene or Short.
---

# lowpoly-kit

Remotion + react-three-fiber kit. Every frame is a pure function of the frame number.

## Before writing code
Read these in the project (they are the source of truth, this file is only a map):
- `docs/kit-catalog.md`: every component and helper
- `docs/style-bible.md`: palette, materials, lighting, camera
- `docs/qa-checklist.md`: check before calling a video done
- `src/examples/ExampleShort.tsx`: a working three-shot Short to copy from

## Building a shot
- Wrap each shot in `ShotScene` (`src/kit/scene/ShotScene.tsx`) with a `recipe` (`closeUp`, `medium`, `wide`, `overShoulder`, `lowHero`, `insert`) and a `setting` (`suburb`, `downtown`, `airfield`, `office`, `newsroom`, `home`).
- Characters are `Person` with a `PersonSpec` (`src/kit/character/types.ts`; ready-made casts in `examples.ts`).
- Expressions and poses: `src/kit/character/acting.ts`. Gestures (`act.gestures`, ids in `gestures.ts`): `{g: 'wave', at: 40}`. Walking: `act.walk` / `walkAt`; sitting: `sitPose` (`motion.ts`).
- Lighting presets: `src/kit/lighting.tsx`. Props: `Asset` with Kenney ids from `docs/asset-library.md`.
- Register compositions in `src/Root.tsx` with `withLook(Component, 'v2')`, 1080x1920 at 30 fps.

## Rules
- One action per shot; shots last 1-2 s, so land the gesture or walk at 20-40% of the shot.
- Deterministic only: never `Math.random()` or `useFrame`; use the seeded helpers (`lcg`, `seed` props).
- Check visually with `npm run stills -- <CompositionId> <outDir> <frames...>` before a full render.
- Run `npm run check` after changing motion code (type check + motion and foot-slide checks).
- Render with `--gl=angle` on Mac (`--gl=swangle` on GPU-less Linux).
