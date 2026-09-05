import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const source = JSON.parse(readFileSync(new URL('./assets.source.json', import.meta.url)));
const report = [];
for (const asset of source.assets) {
  const root = new URL(`../public/assets/sequences/${asset.id}/`, import.meta.url);
  const meta = JSON.parse(readFileSync(new URL('manifest.json', root))).tiers.desktop;
  const files = readdirSync(new URL('desktop/', root)).filter(file => file.endsWith('.jpg')).sort();
  if (files.length !== meta.count) throw new Error(`${asset.id}: count mismatch`);
  let dimensions;
  for (let index = 0; index < files.length; index++) {
    if (files[index] !== `frame-${String(index+1).padStart(4,'0')}.jpg`) throw new Error(`${asset.id}: gap at ${index+1}`);
    const size = await sharp(new URL(`desktop/${files[index]}`, root).pathname).metadata();
    dimensions ??= [size.width,size.height];
    if (size.width !== dimensions[0] || size.height !== dimensions[1]) throw new Error(`${asset.id}: wrong dimensions`);
  }
  const luminance = [];
  for (const file of [files[0],files.at(-1)]) {
    const stats = await sharp(new URL(`desktop/${file}`, root).pathname).resize(64,36).greyscale().stats();
    luminance.push(stats.channels[0].mean);
  }
  if(luminance[0]<0.5 || (luminance[1]<0.5 && !asset.allowDarkLast)) throw new Error(`${asset.id}: unapproved black endpoint ${luminance}`);
  report.push({id:asset.id,count:files.length,dimensions,endpointLuminance:luminance,allowedDarkLast:!!asset.allowDarkLast});
}
mkdirSync(new URL('../artifacts/', import.meta.url),{recursive:true});
writeFileSync(new URL('../artifacts/sequence-verification.json', import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
const count=report.reduce((sum,asset)=>sum+asset.count,0);
if(Math.abs(count-3085)>6) throw new Error(`Unexpected total ${count}`);
console.log(`PASS: ${count} frames, 6 assets`);
