#!/usr/bin/env node
/**
 * Extract single frames at timeline markers for validation.
 *
 * Usage:
 *   node tools/extract-keyframes.mjs \
 *     --input /path/to/trailer.mp4 \
 *     --timeline public/assets/keyframes/official-trailer/timeline.json \
 *     --output public/assets/keyframes/official-trailer/frames
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

function parseArgs(argv) {
  const opts = { input: '', timeline: '', output: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--input' || arg === '-i') { opts.input = next ?? ''; i += 1; }
    else if (arg === '--timeline' || arg === '-t') { opts.timeline = next ?? ''; i += 1; }
    else if (arg === '--output' || arg === '-o') { opts.output = next ?? ''; i += 1; }
  }
  return opts;
}

function formatTs(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}m${s.toFixed(1).padStart(4, '0')}s`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.input || !opts.timeline) {
    console.error('Usage: node tools/extract-keyframes.mjs -i video.mp4 -t timeline.json [-o outdir]');
    process.exit(1);
  }

  const input = resolve(opts.input);
  const timelinePath = resolve(opts.timeline);
  const outDir = resolve(opts.output || join(dirname(timelinePath), 'frames'));

  if (!existsSync(input)) {
    console.error(`Input not found: ${input}`);
    process.exit(1);
  }

  const entries = JSON.parse(readFileSync(timelinePath, 'utf8'));
  mkdirSync(outDir, { recursive: true });

  const results = [];

  for (const entry of entries) {
    const filename = `${entry.id}_${formatTs(entry.t)}.jpg`;
    const outPath = join(outDir, filename);
    const args = [
      '-hide_banner', '-y',
      '-ss', String(entry.t),
      '-i', input,
      '-frames:v', '1',
      '-q:v', '2',
      outPath,
    ];
    const run = spawnSync('ffmpeg', args, { encoding: 'utf8' });
    if (run.status !== 0) {
      console.error(`Failed ${entry.id} @ ${entry.t}s:`, run.stderr?.slice(-200));
      process.exit(1);
    }
    results.push({ ...entry, file: filename, path: outPath.replace(REPO_ROOT + '/', '') });
    process.stdout.write(`✓ ${filename}  ${entry.label}\n`);
  }

  const index = {
    source: input,
    extractedAt: new Date().toISOString().slice(0, 10),
    count: results.length,
    frames: results,
  };
  writeFileSync(join(dirname(timelinePath), 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`\nDone: ${results.length} keyframes → ${outDir}`);
}

main();
