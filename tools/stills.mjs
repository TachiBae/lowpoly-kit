// Render preview stills in one go (one bundle, one browser).
// Usage: node tools/stills.mjs <composition-id> <outDir> [frames...]   (no frames = frame 0)
// Env: GL (default angle; cloud: swangle), SCALE (default 0.4), BROWSER (optional executable path)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [id, outDir, ...fr] = process.argv.slice(2);
if (!id || !outDir) { console.error('usage: node tools/stills.mjs <composition-id> <outDir> [frames...]'); process.exit(1); }
const frames = fr.length ? fr.map(Number) : [0];
fs.mkdirSync(outDir, {recursive: true});
const gl = process.env.GL || 'angle';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: process.env.BROWSER || null, chromiumOptions: {gl}});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, chromiumOptions: {gl}});
let i = 0;
for (const frame of frames) {
  i++;
  const out = path.join(outDir, `s${String(i).padStart(2, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output: out, scale: Number(process.env.SCALE || 0.4), puppeteerInstance: browser, chromiumOptions: {gl}, timeoutInMilliseconds: 240000});
  console.log(`${i}/${frames.length} frame ${frame} -> ${out}`);
}
await browser.close({silent: true});
