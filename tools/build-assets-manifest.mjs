import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const source = JSON.parse(readFileSync(new URL('./assets.source.json', import.meta.url)));
const assets = [];
for (const item of source.assets) {
  const root = new URL(`../public/assets/sequences/${item.id}/`, import.meta.url);
  const metadata = JSON.parse(readFileSync(new URL('manifest.json', root)));
  const tier = metadata.tiers.desktop;
  const size = await sharp(new URL('desktop/frame-0001.jpg', root).pathname).metadata();
  const clips = {};
  for (const [id, range] of Object.entries(item.clips)) {
    const from = Math.floor((range[0] - item.start) * source.fps + 1e-7) + 1;
    const to = Math.min(tier.count, Math.floor((range[1] - item.start) * source.fps + 1e-7));
    if (from < 1 || to < from || to > tier.count) throw new Error(`Invalid clip ${item.id}/${id}`);
    clips[id] = { from, to, ...(item.origins?.[id] ? { origin: item.origins[id] } : {}) };
  }
  assets.push({id:item.id,path:`/assets/sequences/${item.id}/desktop`,pattern:tier.pattern,frameCount:tier.count,fps:source.fps,width:size.width,height:size.height,poster:'/assets/posters/act-1-origin.jpg',clips});
}
const output = `import type { AssetManifest } from '../core/contracts';\n\nexport const assetsManifest = ${JSON.stringify({assets}, null, 2)} as const satisfies AssetManifest;\n`;
writeFileSync(new URL('../src/config/assets.manifest.ts', import.meta.url), output);
console.log(`Generated ${assets.length} assets; ${assets.reduce((sum, asset) => sum + asset.frameCount, 0)} frames`);
