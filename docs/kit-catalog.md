# Kit catalogue — what already exists (reuse before building new)

All in `src/kit/`. Put your own shots anywhere under `src/` and import from `kit/`.

## Scene + camera
| Export | File | Use |
|---|---|---|
| `Stage` | Stage.tsx | One-shot wrapper: ThreeCanvas + camera move (`from`/`to` keys), light preset, DOF focus, `shake`, `dolly`. Start every 3D shot here. |
| `pop(f, at, dur)`, `ramp(f, a, b, ease)` | Stage.tsx | Overshoot pop-in scale; 0→1 ramps. |
| `CameraRig`, `mixV` | CameraRig.tsx | Manual camera (Stage uses it). |
| `LightRig`, `presets`, `blendPresets` | lighting.tsx | Presets: `midnightMonitor`, `alarmRed` (accent only), `goldenHour`, `neonNight`, `overcastMorning`, `lampLitCozy`, `duskGlow`. Blend for pulses/transitions. |
| `PostFX` | PostFX.tsx | Bloom, DOF, vignette (Stage includes it). |
| `Captions` | Captions.tsx | Top-third pill captions, teal active word, OpenAI-style name merges, no page ending on a weak word. |
| `ThumbType` | ThumbType.tsx | Thumbnail type: teal kicker pill + 2-line headline. Text lives in each story's `story.ts`. |

## Building blocks
| Export | File | Use |
|---|---|---|
| `FBox` `FIco` `FCyl` | lowpoly.tsx | FACETED (flat-shaded) primitives. |
| `SBall` `SCapsule` | lowpoly.tsx | SMOOTH clay primitives. |
| `FMat` `SMat` `GlowMat` | materials.tsx | Faceted / smooth / emissive materials. |
| `palette` | palette.ts | Channel colours. |

## Characters
| Export | File | Notes |
|---|---|---|
| `Person` | character/Person.tsx | Clay head + faceted outfit. Props: `spec` (PersonSpec: hair, outfit, colours, glasses), `expression` (eyeScale, look, brows, mouth, sweat, blink), `pose` (head, armL/R, elbowL/R, lean, bob, squash), `holdL/holdR`. Auto-blinks + breathes. |
| `examples` | character/examples.ts | Ready PersonSpecs to copy. |
| `Robot` | props/Story.tsx | AI/company stand-in. `color`, `eyes` (open/happy/question/squint), `armL/armR`, `holdL/holdR`. Blinks + floats. |
| `Silhouette` | props/Household.tsx | Faceless glowing figure for anonymous/unnamed people. |

## Props
| Group | Exports |
|---|---|
| Chips/tech (Chips.tsx) | `ChipSlab`, `ChipTower`, `chipTowerTop(count)` |
| Environment (Environment.tsx) | `ServerCity`, `StringLights`, `BokehField` |
| FX (Fx.tsx) | `Label3D` (3D text, glow), `Beam`, `Sparkle`, `Shards`, `LightCone` |
| Household (Household.tsx) | `Table`, `Plate`, `Fork`, `FlagPick`, `PressCamera`, `FrostedPanel`, `CrumpledJacket` |
| Office/evidence (Office.tsx) | `DeskLamp`, `Monitor`, `Folder`, `Clock`, `Newspaper` (headline, paper colour), `Envelope`, `Corkboard`, `PinCard`, `MapPin`, `BorderGate`, `Conveyor`, `RectOutline` |
| Aviation/civic (Aviation.tsx) | `Airplane`, `Router` (status 0..1, dusty), `Laptop`, `DeparturesBoard` (held rows, HOLD/CANCELED), `Podium` (plate), `Dome` (generic legislature), `USMap` + `CENTERS` + `usXZ`, `LineupWall`, `Tag` (verdict/label slab), `Hut`, `Cable` (copper/fiber) |
| Story (Story.tsx) | `Magnifier`, `MoneyBag`, `PhoneBuddy`, `Stamp`, `Pawn`, `PaintRoller`, `Sign` (text + tag) |

## Look v2 (default)
Wrap a composition with `withLook(Component, 'v2')` (see `src/Root.tsx`). v1 is the older darker look, kept for comparison.
To compare any story in v2 without changing it, render the Lab composition `<id>-v2`. The neutral test scene is `Kit/LookLab` (v1) vs `Kit/LookLab-v2`, with stills at frames 30, 90, 150 and 210.

What v2 turns on automatically (no shot code needed):
| Feature | Where | Notes |
|---|---|---|
| Ambient occlusion (n8ao), haze, split-tone grade | PostFX.tsx, lookfx.ts | Values per preset in `lighting.tsx` → `v2` block (`ao`, `haze`, `grade`). Haze starts ~5 units from camera; sky untouched. |
| Cool shadow-side light, rim boost | lighting.tsx `LightRig` | `v2.cool`, `v2.rimBoost`. |
| Facet shading | lowpoly.tsx `facet()` | Per-triangle tone ±7%, objects darker/cooler toward their base (vertex colours). |
| Bevels + faceted floors/walls | lowpoly.tsx `FBox` | Small chamfer on normal boxes; boxes >3 units get subdivided so floors/walls facet. |
| Character polish | character/Person.tsx | Iris ring + second catch-light, soft cheek warmth, contrasting shoe soles, contact-shadow blob (standing at y≈0; `blob` prop overrides). |
| Screen light spill | props/Office.tsx `Monitor` | Coloured point light in front of the screen. |

New v2 props / helpers (use where they help):
| Export | File | Use |
|---|---|---|
| `GodRays` | props/Atmosphere.tsx | Soft light shafts `from` a source `to` a target. Keep them behind characters, never across faces. intensity ~0.15–0.2. |
| `DustMotes` | props/Atmosphere.tsx | Specks drifting in a light. Small volume inside the shaft/lamp glow; 15–20 count. |
| `GroundBlob` | props/Atmosphere.tsx | Soft contact shadow for props. |
| `Scatter`, `Pebbles` | props/Dressing.tsx | Clustered set dressing with size tiers; `avoid` rectangles keep the subject clear. |
| `ScreenGlow` | props/Dressing.tsx | Light + floor glow patch for screens/practicals. |
| `squashPop(f, start)` | Stage.tsx | Squash-and-stretch pop-in (returns [x,y,z] scale) for tags, labels, icons. |
| `grain` prop on `Stage` | Stage.tsx | Frame-seeded film grain, v2 only, default 0 (off). |
| `useLook()` | look.tsx | Branch shot code on the look if a story needs to. |

## Daylight kits (v2)
New files, use with `look: 'v2'` and daylight presets (sunnyDay, peachMorning, softOvercast). Colours from `paletteV2`.
- `props/Daylight.tsx`: `MeadowHill`, `CityDay`, `AirfieldDay` (animated windsock), `ClassroomDay`, `LabDay`. Props: `position`, `scale`.
- `props/PropsV2.tsx`: `MugV2`, `LaptopV2`, `PhoneV2`, `BookStackV2`, `PlantV2`, `LampV2`, `GlobeV2`, `PaperPlaneV2` (rounded, bright, recoloured).
- `props/Clouds.tsx`: `Clouds` (drifting puffs).
- `cards/InfoCardV2.tsx`: `InfoCardV2` (kicker, headline, bigNumber, caption); navy + white + one orange accent, 1080x1920.

## Kenney asset library (CC0)
1,867 low-poly models in public/kenney (nature, furniture, food, car, city kits, space, train, holiday, survival, pets, market, factory, watercraft...). Full name list: docs/asset-library.md.
- `<Asset id="nature/tree_oak" position={[x,0,z]} />` (src/kit/props/Asset.tsx). Auto-scaled to Person size per kit (KIT_SCALE); `scale`, `rotation`, `colors={{materialName:'#hex'}}`, `tint`, `harmonize` (0-1, pulls colours to paletteV2; foliage always to palette greens).
- `<AssetScatter ids={[...]} count={30} area={[xMin,xMax,zMin,zMax]} avoid={[[...]]} seed={n} />` for ground dressing.
- Textures were baked to vertex colours (tools/bake-kenney.py) because textured GLBs hang in headless renders. Re-run it on any new kit; originals in ../_archive/kenney-textures.
- Vertical frame tip: visible half-width ≈ 0.24 × distance from camera (fov 46). Keep props inside it.

## Scene layers (Step 2): three layers per shot
`<ShotScene recipe setting seed shotIndex subject duration preset edge angle propY shoulder overrides>` (src/kit/scene/ShotScene.tsx) builds background + ground/mid-ground + foreground around your characters (children).
- Recipes (scene/recipes.ts): closeUp, medium, wide, overShoulder (pass `shoulder` spec), lowHero, insert (pass `propY`). Bold foreground on closeUp/lowHero, subtle elsewhere.
- Settings (scene/settings.ts): suburb, downtown, airfield, office. Edit the item lists there to change what appears.
- Pieces: `Backdrop` (near band 18 u, far band 36 u, horizon cards, office back wall), `GroundDressing` (paths/road/rug, context props, instanced grass), `Foreground` (1-2 blurred elements, side rotates with shotIndex), `frame.ts` (screen/world math: screenToGround, screenToWorld, faceCamYaw).
- Pass consecutive `shotIndex` values for consecutive shots (different foreground side each time).
- Test comps: DaylightLab2 (6 shots), BackdropTest (4 settings). Emptiness tool: tools/emptiness.py.
- Composition rules (refined after review, keep them): grass only in 3-6 tidy clusters on soft ground, never on paths/roads and never within 4.5 units of the camera; props sit in fixed screen slots (`u` = screen x) and are dropped if they would cover a subject (front) or stand behind a head (tall items); rows of buildings share one facing; one foreground element only, darkened and mostly off-frame; open ground gets orderly texture (mowing stripes, paving seams, road markings) instead of clutter.
- Pass `clear` (half-width of the subject group, ~1.7 for two people) so props keep clear of everyone.
- Emptiness score is only a guide: tidy shots score ~0.4. Judge by eye: subject reads first, nothing touches heads, no random clutter.

## Additions (Nov 18)
- v2 defaults: tube arms + shaped torso (`DEFAULT_V2_ARMS` / `DEFAULT_V2_BODY` in character/Person.tsx). HairBack shell covers the back of the head on every style except bald/mohawk.
- Expressions fixed/strengthened: brow tilt directions corrected (angry = inner ends down), sad looks down, smug has a lopsided smirk, love shows floating hearts (`hearts: true`).
- Presets: candyDusk, blueHour (night; ShotScene turns street lamps on and darkens the sidewalk), sunnyStudio (bright interiors).
- Settings: newsroom (screen wall, platform, carpet runner) and home (sofa, rugs, plank floor). `props/Podium.tsx`: place in front of a speaker (default position [0, 0, 0.55]).
- Reference sheets: ../library/reference/ (style-sheet.png, cast-turnaround.jpg, expressions.jpg). Compositions: CastTurnaround, CastExpressions (1920x1080), PresetLab, SetLab, EdgeLab, BodyLab, ArmLab.
- Hands (v2, Nov 18): smaller mitten hands sized to the wrist (palm ~2x wrist radius). relaxed = palm + fused finger mitten + thumb on the front edge; open/wave = palm turned forward, 4 short fingers + thumb; fist = knuckle roll + wrapped thumb; point = fist + index along the forearm; thumbsUp = thumb always points to the sky (uses the arm pitch). Poses: `point` now points sideways (reads in frame), `wave` arm lowered so the hand clears the head. Test: HandLab composition (1920x1080, 3 frames).
