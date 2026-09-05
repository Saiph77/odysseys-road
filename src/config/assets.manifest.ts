/** Build-time helper: frameIndex = floor((t − assetStart) × fps) + 1 (AGENTS §2). */

export function clipFromSeconds(
  assetStartSec: number,
  fromSec: number,
  toSec: number,
  fps = 24,
): { from: number; to: number } {
  return {
    from: Math.floor((fromSec - assetStartSec) * fps) + 1,
    to: Math.floor((toSec - assetStartSec) * fps) + 1,
  };
}

const ORIGIN_START = 5.4;
const ITHACA_START = 37.8;
const LAUNCH_START = 82.0;
const TRIALS_START = 90.25;
const HOMEWARD_START = 122.0;
const STINGER_START = 138.1;

export const assetsManifest = {
  assets: [
    {
      id: 'act-1-origin',
      path: '/assets/sequences/act-1-origin/desktop',
      frameCount: 710,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '002-sea-raft': clipFromSeconds(ORIGIN_START, 5.4, 11.0),
        '003-006-memory': clipFromSeconds(ORIGIN_START, 11.0, 30.0),
        '006-troy-fire': clipFromSeconds(ORIGIN_START, 24.0, 30.0),
        '007-go-home': clipFromSeconds(ORIGIN_START, 30.0, 35.0),
      },
    },
    {
      id: 'act-2-ithaca',
      path: '/assets/sequences/act-2-ithaca/desktop',
      frameCount: 1051,
      fps: 24,
      width: 1280,
      height: 720,
      clips: {
        '009-015': clipFromSeconds(ITHACA_START, 37.8, 77.0),
        '015-shore-search': clipFromSeconds(ITHACA_START, 75.0, 77.0),
        '016-red-sail-first': {
          ...clipFromSeconds(ITHACA_START, 77.0, 79.0),
          origin: [0.62, 0.35] as const,
        },
        '017-helmet': clipFromSeconds(ITHACA_START, 79.0, 81.6),
      },
    },
    {
      id: 'act-3a-launch',
      path: '/assets/sequences/act-3a-launch/desktop',
      frameCount: 154,
      fps: 24,
      width: 1280,
      height: 720,
      clips: {
        full: clipFromSeconds(LAUNCH_START, 82.0, 88.4),
      },
    },
    {
      id: 'act-3a-trials',
      path: '/assets/sequences/act-3a-trials/desktop',
      frameCount: 762,
      fps: 24,
      width: 1280,
      height: 720,
      clips: {
        '020-forest-mist': clipFromSeconds(TRIALS_START, 90.25, 94.0),
        '021-silver-giant': clipFromSeconds(TRIALS_START, 94.0, 98.0),
        '022-palace-intrigue': clipFromSeconds(TRIALS_START, 98.0, 102.0),
        '023-storm-sea': clipFromSeconds(TRIALS_START, 102.0, 106.0),
        '024-mist-entity': clipFromSeconds(TRIALS_START, 106.0, 108.0),
        '025-mystery-woman': clipFromSeconds(TRIALS_START, 108.0, 110.0),
        '026-fire-battle': clipFromSeconds(TRIALS_START, 110.0, 112.0),
        '027-injured-youth': clipFromSeconds(TRIALS_START, 112.0, 115.0),
        '028-kiss-animal': clipFromSeconds(TRIALS_START, 115.0, 117.0),
        '029-army-plains': clipFromSeconds(TRIALS_START, 117.0, 122.0),
      },
    },
    {
      id: 'act-3b-homeward',
      path: '/assets/sequences/act-3b-homeward/desktop',
      frameCount: 310,
      fps: 24,
      width: 1280,
      height: 720,
      clips: {
        '030-red-sail-crossing': {
          ...clipFromSeconds(HOMEWARD_START, 122.0, 124.0),
          origin: [0.6, 0.4] as const,
        },
        '031-shore-charge': clipFromSeconds(HOMEWARD_START, 124.0, 126.0),
        '032-cliff-run': clipFromSeconds(HOMEWARD_START, 126.0, 128.0),
        '033-ocean-wide': clipFromSeconds(HOMEWARD_START, 128.0, 130.0),
        '034-oars-rock': clipFromSeconds(HOMEWARD_START, 130.0, 131.0),
        '035-city-fire-charge': clipFromSeconds(HOMEWARD_START, 131.0, 131.65),
        '036-beach-landing': clipFromSeconds(HOMEWARD_START, 131.65, 132.33),
        '037-climb-red-sail': {
          ...clipFromSeconds(HOMEWARD_START, 132.33, 133.25),
          origin: [0.55, 0.5] as const,
        },
        '038-statue-fire': clipFromSeconds(HOMEWARD_START, 133.25, 134.9),
      },
    },
    {
      id: 'act-4-stinger',
      path: '/assets/sequences/act-4-stinger/desktop',
      frameCount: 98,
      fps: 24,
      width: 1280,
      height: 720,
      clips: {
        '040-cyclops-setup': clipFromSeconds(STINGER_START, 138.1, 140.6),
        '041-cyclops-hand': clipFromSeconds(STINGER_START, 140.6, 142.2),
      },
    },
  ],
} as const;

export type AssetsManifest = typeof assetsManifest;

export function getAssetById(id: string) {
  return assetsManifest.assets.find((asset) => asset.id === id);
}

export function getClip(assetId: string, clipId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return undefined;
  return asset.clips[clipId as keyof typeof asset.clips];
}
