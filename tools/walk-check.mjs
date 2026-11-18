import {build} from 'esbuild';
await build({entryPoints: ['src/kit/character/motion.ts'], bundle: true, format: 'esm', platform: 'node', outfile: 'out/walk-check.mjs', logLevel: 'silent'});
const m = await import(process.cwd() + '/out/walk-check.mjs?'+Date.now());
const thigh = 0.52*0.55, shin = 0.61-thigh;
for (const mode of ['walk','run']) { const w = {from: [0,0,0], to: [0,0,20], start: 0, mode};
 let worst=0, minY=0; let prev=null;
 for (let f=10; f<80; f++) { const r = m.walkAt(f, w, 0.61, 1); const p=r.pose;
  for (const [th,k] of [[p.legL,p.kneeL],[p.legR,p.kneeR]]) {}
  const z=r.pos[2]-(thigh*Math.sin(p.legL)+shin*Math.sin(p.legL+p.kneeL)); const y=p.bob+0.61-(thigh*Math.cos(p.legL)+shin*Math.cos(p.legL+p.kneeL));
  if (prev && y<0.004) worst=Math.max(worst,Math.abs(z-prev)); minY=Math.min(minY,y); prev=z; }
 console.log(mode,'skate at floor (units/frame)',worst.toFixed(3),'min y',minY.toFixed(3)); }
