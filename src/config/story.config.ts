import type { StoryConfig } from '../core/contracts';

const TRIALS_SLOTS: ReadonlyArray<{
  id: string;
  clip: string;
  start: number;
  end: number;
  zoom?: true;
}> = [
  { id: 'trials-020', clip: '020-forest-mist', start: 240, end: 302 },
  { id: 'trials-021', clip: '021-silver-giant', start: 302, end: 402, zoom: true },
  { id: 'trials-022', clip: '022-palace-intrigue', start: 402, end: 464 },
  { id: 'trials-023', clip: '023-storm-sea', start: 464, end: 526 },
  { id: 'trials-024', clip: '024-mist-entity', start: 526, end: 588 },
  { id: 'trials-025', clip: '025-mystery-woman', start: 588, end: 650 },
  { id: 'trials-026', clip: '026-fire-battle', start: 650, end: 712 },
  { id: 'trials-027', clip: '027-injured-youth', start: 712, end: 774 },
  { id: 'trials-028', clip: '028-kiss-animal', start: 774, end: 836 },
  { id: 'trials-029', clip: '029-army-plains', start: 836, end: 900 },
] as const;

export const storyConfig = {
  release: {
    id: 'v2-trailer-recut',
    enabledTrackIds: [],
    defaultTrackId: null,
  },
  flow: {
    entry: 'origin',
    order: ['origin', 'ithaca', 'trials', 'homeward', 'stinger'],
  },
  chapters: [
    {
      id: 'origin',
      kind: 'linear',
      timeline: { start: 0, end: 700 },
      scroll: { screens: 7 },
      scenes: [
        {
          id: 'origin-sea',
          road: { start: 0, end: 130 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-1-origin',
          clip: '002-sea-raft',
        },
        {
          id: 'origin-memory',
          road: { start: 130, end: 560 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-1-origin',
          clip: '003-006-memory',
          behavior: { treatment: { kind: 'memory', ramp: 0.05 } },
        },
        {
          id: 'origin-burn',
          road: { start: 520, end: 600 },
          blend: { in: 0, out: 0 },
          layer: 20,
          renderer: 'sequence',
          behavior: {
            transition: {
              kind: 'burn',
              from: { asset: 'act-1-origin', clip: '006-troy-fire', frame: 'last' },
              to: { asset: 'act-1-origin', clip: '007-go-home', frame: 'first' },
            },
          },
        },
        {
          id: 'origin-alone',
          road: { start: 560, end: 700 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-1-origin',
          clip: '007-go-home',
        },
        {
          id: 'origin-captions',
          behavior: {
            dom: { revealSpan: 0.12, stagger: 0.04, offset: 12, backdrop: 0, label: true },
          },
          road: { start: 0, end: 700 },
          blend: { in: 0, out: 0 },
          layer: 50,
          renderer: 'dom',
        },
      ],
    },
    {
      id: 'ithaca',
      kind: 'linear',
      timeline: { start: 0, end: 1000 },
      scroll: { screens: 10 },
      scenes: [
        {
          id: 'ithaca-card',
          behavior: { dom: { revealSpan: 0.22, stagger: 0.06, offset: 18, backdrop: 1 } },
          road: { start: 0, end: 60 },
          blend: { in: 0, out: 0 },
          layer: 50,
          renderer: 'dom',
        },
        {
          id: 'ithaca-home',
          road: { start: 40, end: 760 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-2-ithaca',
          clip: '009-015',
        },
        {
          id: 'ithaca-ring-1',
          road: { start: 720, end: 800 },
          blend: { in: 0, out: 0 },
          layer: 20,
          renderer: 'sequence',
          behavior: {
            transition: {
              kind: 'ring',
              intensity: 1,
              from: { asset: 'act-2-ithaca', clip: '015-shore-search', frame: 'last' },
              to: { asset: 'act-2-ithaca', clip: '016-red-sail-first', frame: 'first' },
            },
          },
        },
        {
          id: 'ithaca-redsail',
          road: { start: 760, end: 900 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-2-ithaca',
          clip: '016-red-sail-first',
        },
        {
          id: 'ithaca-helmet',
          road: { start: 900, end: 1000 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-2-ithaca',
          clip: '017-helmet',
        },
      ],
    },
    {
      id: 'trials',
      kind: 'linear',
      timeline: { start: 0, end: 900 },
      scroll: { screens: 9 },
      scenes: [
        {
          id: 'trials-launch',
          road: { start: 0, end: 160 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3a-launch',
          clip: 'full',
        },
        {
          id: 'trials-card',
          behavior: { dom: { revealSpan: 0.22, stagger: 0.06, offset: 18, backdrop: 1 } },
          road: { start: 160, end: 240 },
          blend: { in: 0, out: 0 },
          layer: 50,
          renderer: 'dom',
        },
        ...TRIALS_SLOTS.map((slot) => ({
          id: slot.id,
          road: { start: slot.start, end: slot.end },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence' as const,
          asset: 'act-3a-trials',
          clip: slot.clip,
          behavior: slot.zoom
            ? {
                scrub: { from: 0.2, to: 0.8 },
                treatment: { kind: 'zoom' as const, from: 1.1, to: 1.0 },
              }
            : { scrub: { from: 0.2, to: 0.8 } },
        })),
      ],
    },
    {
      id: 'homeward',
      kind: 'linear',
      timeline: { start: 0, end: 900 },
      scroll: { screens: 9 },
      scenes: [
        {
          id: 'homeward-ring-2',
          road: { start: 0, end: 80 },
          blend: { in: 0, out: 0 },
          layer: 20,
          renderer: 'sequence',
          behavior: {
            transition: {
              kind: 'ring',
              intensity: 2,
              from: { asset: 'act-3a-trials', clip: '029-army-plains', frame: 'last' },
              to: { asset: 'act-3b-homeward', clip: '030-red-sail-crossing', frame: 'first' },
            },
          },
        },
        {
          id: 'homeward-030',
          road: { start: 0, end: 150 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '030-red-sail-crossing',
        },
        {
          id: 'homeward-031',
          road: { start: 150, end: 250 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '031-shore-charge',
        },
        {
          id: 'homeward-032',
          road: { start: 250, end: 330 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '032-cliff-run',
        },
        {
          id: 'homeward-033',
          road: { start: 330, end: 430 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '033-ocean-wide',
        },
        {
          id: 'homeward-034',
          road: { start: 430, end: 510 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '034-oars-rock',
        },
        {
          id: 'homeward-035',
          road: { start: 510, end: 580 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '035-city-fire-charge',
        },
        {
          id: 'homeward-036',
          road: { start: 580, end: 650 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '036-beach-landing',
        },
        {
          id: 'homeward-037',
          road: { start: 650, end: 780 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '037-climb-red-sail',
        },
        {
          id: 'homeward-ring-3',
          road: { start: 630, end: 700 },
          blend: { in: 0, out: 0 },
          layer: 20,
          renderer: 'sequence',
          behavior: {
            transition: {
              kind: 'ring',
              intensity: 3,
              from: { asset: 'act-3b-homeward', clip: '036-beach-landing', frame: 'last' },
              to: { asset: 'act-3b-homeward', clip: '037-climb-red-sail', frame: 'first' },
            },
          },
        },
        {
          id: 'homeward-038',
          road: { start: 780, end: 900 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-3b-homeward',
          clip: '038-statue-fire',
        },
      ],
    },
    {
      id: 'stinger',
      kind: 'linear',
      timeline: { start: 0, end: 500 },
      scroll: { screens: 5 },
      scenes: [
        {
          id: 'stinger-title',
          behavior: { dom: { revealSpan: 0.22, stagger: 0.1, offset: 18, backdrop: 1 } },
          road: { start: 0, end: 150 },
          blend: { in: 0, out: 0 },
          layer: 50,
          renderer: 'dom',
        },
        {
          id: 'stinger-cave',
          road: { start: 150, end: 260 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-4-stinger',
          clip: '040-cyclops-setup',
        },
        {
          id: 'stinger-hand',
          road: { start: 260, end: 380 },
          blend: { in: 0, out: 0 },
          layer: 10,
          renderer: 'sequence',
          asset: 'act-4-stinger',
          clip: '041-cyclops-hand',
        },
        {
          id: 'stinger-outro',
          behavior: { dom: { revealSpan: 0.22, stagger: 0.1, offset: 18, backdrop: 1 } },
          road: { start: 380, end: 500 },
          blend: { in: 0, out: 0 },
          layer: 50,
          renderer: 'dom',
        },
      ],
    },
  ],
} satisfies StoryConfig;

export type AppStoryConfig = typeof storyConfig;

export function getChapterById(id: string) {
  return storyConfig.chapters.find((chapter) => chapter.id === id);
}

export function getTotalScreens() {
  return storyConfig.chapters.reduce((sum, chapter) => sum + chapter.scroll.screens, 0);
}
