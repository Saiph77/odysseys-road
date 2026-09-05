#!/usr/bin/env node
/**
 * Extract a scroll-ready image sequence from a video via ffmpeg.
 *
 * Output layout matches docs/ARCHITECTURE.md §7.4:
 *   <out>/<asset-id>/desktop/frame-0001.<ext>
 *   <out>/<asset-id>/manifest.json
 *
 * Usage:
 *   node tools/extract-sequence-frames.mjs --input /path/to/video.mp4 --id ch01-opening
 *   node tools/extract-sequence-frames.mjs --input video.mp4 --id open-1 --fps 30 --width 1440
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DEFAULT_FPS = 30;
const DEFAULT_FORMAT = 'jpg';
const DEFAULT_QUALITY = 2; // ffmpeg mjpeg: 2 ≈ high quality

function printHelp() {
  console.log(`extract-sequence-frames — video → dense scroll sequence

Options:
  --input, -i     Source video (required)
  --id            Asset id / folder name (required)
  --output, -o    Root output dir (default: public/assets/sequences)
  --fps           Extraction rate (default: ${DEFAULT_FPS})
  --format        jpg | png (default: ${DEFAULT_FORMAT})
  --quality       JPEG quality 1-31, lower is better (default: ${DEFAULT_QUALITY})
  --width         Optional max width; height keeps aspect ratio
  --tier          Tier folder name (default: desktop)
  --start         Start time seconds (default: 0)
  --duration      Clip length seconds (default: full video)
  --dry-run       Print ffmpeg command without running
  --help, -h      Show this help

Examples:
  node tools/extract-sequence-frames.mjs -i ~/Downloads/open-1.mp4 --id ch01-opening
  node tools/extract-sequence-frames.mjs -i open-1.mp4 --id open-1 --fps 24 --width 1280
`);
}

function parseArgs(argv) {
  const opts = {
    input: '',
    id: '',
    output: join(REPO_ROOT, 'public', 'assets', 'sequences'),
    fps: DEFAULT_FPS,
    format: DEFAULT_FORMAT,
    quality: DEFAULT_QUALITY,
    width: 0,
    tier: 'desktop',
    start: 0,
    duration: 0,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case '--input':
      case '-i':
        opts.input = next ?? '';
        i += 1;
        break;
      case '--id':
        opts.id = next ?? '';
        i += 1;
        break;
      case '--output':
      case '-o':
        opts.output = resolve(next ?? '');
        i += 1;
        break;
      case '--fps':
        opts.fps = Number(next);
        i += 1;
        break;
      case '--format':
        opts.format = (next ?? DEFAULT_FORMAT).toLowerCase();
        i += 1;
        break;
      case '--quality':
        opts.quality = Number(next);
        i += 1;
        break;
      case '--width':
        opts.width = Number(next);
        i += 1;
        break;
      case '--tier':
        opts.tier = next ?? 'desktop';
        i += 1;
        break;
      case '--start':
        opts.start = Number(next);
        i += 1;
        break;
      case '--duration':
        opts.duration = Number(next);
        i += 1;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return opts;
}

function requireFfmpeg() {
  const probe = spawnSync('ffprobe', ['-version'], { encoding: 'utf8' });
  if (probe.status !== 0) {
    console.error('ffprobe not found. Install ffmpeg (brew install ffmpeg).');
    process.exit(1);
  }
}

function probeVideo(inputPath) {
  const result = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height,r_frame_rate,duration',
      '-show_entries',
      'format=duration',
      '-of',
      'json',
      inputPath,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    console.error(result.stderr || 'ffprobe failed');
    process.exit(1);
  }

  const json = JSON.parse(result.stdout);
  const stream = json.streams?.[0] ?? {};
  const formatDuration = Number(json.format?.duration ?? 0);
  const streamDuration = Number(stream.duration ?? 0);
  const duration = streamDuration || formatDuration;

  let fps = 30;
  if (stream.r_frame_rate) {
    const [num, den] = stream.r_frame_rate.split('/').map(Number);
    if (num && den) fps = num / den;
  }

  return {
    width: Number(stream.width ?? 0),
    height: Number(stream.height ?? 0),
    duration,
    nativeFps: fps,
  };
}

function countFrames(dir, ext) {
  return readdirSync(dir).filter((name) => name.startsWith('frame-') && name.endsWith(`.${ext}`)).length;
}

function buildFfmpegArgs(opts, frameDir, ext) {
  const pattern = join(frameDir, `frame-%04d.${ext}`);
  const vf = [];
  if (opts.width > 0) {
    vf.push(`scale=${opts.width}:-2:flags=lanczos`);
  }
  vf.push(`fps=${opts.fps}`);

  const args = ['-hide_banner', '-y'];
  if (opts.start > 0) args.push('-ss', String(opts.start));
  args.push('-i', opts.input);
  if (opts.duration > 0) args.push('-t', String(opts.duration));
  args.push('-an', '-vf', vf.join(','), '-fps_mode', 'vfr');

  if (ext === 'jpg') {
    args.push('-q:v', String(opts.quality));
  }

  args.push('-start_number', '1', pattern);
  return args;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.input || !opts.id) {
    console.error('Missing required --input and --id');
    printHelp();
    process.exit(1);
  }

  if (!['jpg', 'jpeg', 'png'].includes(opts.format)) {
    console.error(`Unsupported format: ${opts.format}`);
    process.exit(1);
  }

  const ext = opts.format === 'jpeg' ? 'jpg' : opts.format;
  const inputPath = resolve(opts.input);
  if (!existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  requireFfmpeg();
  const meta = probeVideo(inputPath);

  const assetRoot = join(opts.output, opts.id);
  const frameDir = join(assetRoot, opts.tier);
  mkdirSync(frameDir, { recursive: true });

  const clipDuration = opts.duration > 0 ? opts.duration : meta.duration - opts.start;
  const estimatedFrames = Math.max(1, Math.round(clipDuration * opts.fps));

  console.log('Source');
  console.log(`  path     ${inputPath}`);
  console.log(`  size     ${meta.width}×${meta.height}`);
  console.log(`  duration ${meta.duration.toFixed(3)}s (native ~${meta.nativeFps.toFixed(2)} fps)`);
  console.log('Extract');
  console.log(`  asset    ${opts.id}`);
  console.log(`  out      ${frameDir}`);
  console.log(`  fps      ${opts.fps} (~${estimatedFrames} frames)`);
  if (opts.width > 0) console.log(`  width    ${opts.width}px (height proportional)`);

  const ffmpegArgs = buildFfmpegArgs(opts, frameDir, ext);
  console.log(`\nffmpeg ${ffmpegArgs.join(' ')}`);

  if (opts.dryRun) {
    process.exit(0);
  }

  const run = spawnSync('ffmpeg', ffmpegArgs, { encoding: 'utf8', stdio: 'inherit' });
  if (run.status !== 0) {
    process.exit(run.status ?? 1);
  }

  const count = countFrames(frameDir, ext);
  const manifest = {
    id: opts.id,
    source: inputPath,
    extractedAt: new Date().toISOString().slice(0, 10),
    tiers: {
      [opts.tier]: {
        count,
        pattern: `frame-%04d.${ext}`,
        width: opts.width > 0 ? opts.width : meta.width,
        height: null,
        fps: opts.fps,
        format: ext,
      },
    },
    scroll: {
      note: 'Map scroll progress 0..1 → frame index 1..count (see tools/sequence-scroll-preview)',
      recommendedRoadLength: null,
    },
  };

  writeFileSync(join(assetRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nDone: ${count} frames → ${frameDir}`);
  console.log(`Manifest: ${join(assetRoot, 'manifest.json')}`);
  console.log('\nPreview scroll:');
  console.log(`  cd ${REPO_ROOT} && python3 -m http.server 4173`);
  console.log(`  open http://localhost:4173/tools/sequence-scroll-preview/?asset=../../public/assets/sequences/${opts.id}`);
}

main();
