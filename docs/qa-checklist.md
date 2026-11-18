# QA checklist — check before every full render, and on the QA strip after

## Stills (render 1 frame per shot, contact sheet; look at every one)
- [ ] Nothing important cropped at frame edges (signs, text, faces, hands).
- [ ] Captions (top third) never cover a face, a key prop or on-screen text.
- [ ] On-screen text readable at phone size; no text under the caption pill.
- [ ] No blown-out whites (open folders, lamps, papers) — check bloom.
- [ ] Every shot reads in under 1.5s: one clear subject, foreground blur at edges.
- [ ] No two consecutive shots with the same framing; at least one wide shot.
- [ ] Real people: generic figures only (no likeness), company names as plain text, no logos; anonymous people = faceless silhouette.
- [ ] Cutaways: solid navy background from frame 0 (only inner content fades) — prevents 1-frame dark flashes.
- [ ] First frame is already "loud" (light at full, frame-0 hit) — no fade-in from black.
- [ ] Last shot's end camera matches the first shot's start camera (loop).

## Captions
- [ ] Brand names spelled right (OpenAI, Anthropic, Nvidia…) — fix in words.json pre-pass.
- [ ] No caption page ends on a weak word (the/a/of/to/and…).
- [ ] Max ~7 words per page, 1–2 lines.

## Final file (check before publishing)
- [ ] 1080x1920, 30fps, frames = shot list total, duration ≈ VO length.
- [ ] Loudness about -14 to -16.5 LUFS integrated.
- [ ] black-frame flashes: 0.
- [ ] QA strip (8 frames) looks right.
- [ ] Listen to the mix on a phone speaker and earbuds.
- v2 stories: god-rays and dust never cross a face; haze does not wash out the floor near the subject; render the same frame twice and confirm the PNGs are identical when adding any new effect.
- Kit changes: re-render a few frames of the Lab compositions before and after and compare.

## v2 scene layers
- Every v2 shot has a foreground element (except overShoulder, insert may be minimal), none in the top 40% (caption area), no covered faces.
- Emptiness (tools/emptiness.py on preview stills): aim < 0.30 average; blurred insert shots may be higher.
- Consecutive shots use consecutive shotIndex.
