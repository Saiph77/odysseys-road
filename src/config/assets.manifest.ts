import type { AssetManifest } from '../core/contracts';

export const assetsManifest = {
  assets: [
    {
      id: 'act-1-origin',
      path: '/assets/sequences/act-1-origin/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 710,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '002-sea-raft': {
          from: 1,
          to: 134,
        },
        '003-006-memory': {
          from: 135,
          to: 590,
        },
        '006-troy-fire': {
          from: 447,
          to: 590,
        },
        '007-go-home': {
          from: 591,
          to: 710,
        },
      },
    },
    {
      id: 'act-2-ithaca',
      path: '/assets/sequences/act-2-ithaca/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 1051,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '009-015': {
          from: 1,
          to: 940,
        },
        '015-shore-search': {
          from: 893,
          to: 940,
        },
        '016-red-sail-first': {
          from: 941,
          to: 988,
        },
        '017-helmet': {
          from: 989,
          to: 1051,
        },
      },
    },
    {
      id: 'act-3a-launch',
      path: '/assets/sequences/act-3a-launch/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 154,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        full: {
          from: 1,
          to: 153,
        },
      },
    },
    {
      id: 'act-3a-trials',
      path: '/assets/sequences/act-3a-trials/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 762,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '020-forest-mist': {
          from: 1,
          to: 90,
        },
        '021-silver-giant': {
          from: 91,
          to: 186,
        },
        '022-palace-intrigue': {
          from: 187,
          to: 282,
        },
        '023-storm-sea': {
          from: 283,
          to: 378,
        },
        '024-mist-entity': {
          from: 379,
          to: 426,
        },
        '025-mystery-woman': {
          from: 427,
          to: 474,
        },
        '026-fire-battle': {
          from: 475,
          to: 522,
        },
        '027-injured-youth': {
          from: 523,
          to: 594,
        },
        '028-kiss-animal': {
          from: 595,
          to: 642,
        },
        '029-army-plains': {
          from: 643,
          to: 762,
        },
      },
    },
    {
      id: 'act-3b-homeward',
      path: '/assets/sequences/act-3b-homeward/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 309,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '030-red-sail-crossing': {
          from: 1,
          to: 48,
        },
        '031-shore-charge': {
          from: 49,
          to: 96,
        },
        '032-cliff-run': {
          from: 97,
          to: 144,
        },
        '033-ocean-wide': {
          from: 145,
          to: 192,
        },
        '034-oars-rock': {
          from: 193,
          to: 216,
        },
        '035-city-fire-charge': {
          from: 217,
          to: 231,
        },
        '036-beach-landing': {
          from: 232,
          to: 247,
        },
        '037-climb-red-sail': {
          from: 248,
          to: 270,
        },
        '038-statue-fire': {
          from: 271,
          to: 309,
        },
      },
    },
    {
      id: 'act-4-stinger',
      path: '/assets/sequences/act-4-stinger/desktop',
      pattern: 'frame-%04d.jpg',
      frameCount: 98,
      fps: 24,
      width: 1280,
      height: 720,
      poster: '/assets/posters/act-1-origin.jpg',
      clips: {
        '040-cyclops-setup': {
          from: 1,
          to: 60,
        },
        '041-cyclops-hand': {
          from: 61,
          to: 98,
        },
      },
    },
  ],
} as const satisfies AssetManifest;
