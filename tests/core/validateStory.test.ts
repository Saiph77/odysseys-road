import { describe, expect, it } from 'vitest';
import { assetsManifest } from '../../src/config/assets.manifest';
import { storyConfig } from '../../src/config/story.config';
import type { StoryConfig } from '../../src/core/contracts';
import { assertValidStory, validateStory } from '../../src/core/validateStory';

type Mutable<Value> = { -readonly [Key in keyof Value]: Mutable<Value[Key]> };
type Draft = Mutable<StoryConfig>;
const options = { registeredRenderers: ['sequence', 'dom'] as const };
const failures: Array<[string, (draft: Draft) => void]> = [
  ['DUPLICATE_CHAPTER', (draft) => { draft.chapters.push(structuredClone(draft.chapters[0])); }],
  ['DUPLICATE_SCENE', (draft) => { draft.chapters[1].scenes[0].id = draft.chapters[0].scenes[0].id; }],
  ['ROAD_OUT_OF_TIMELINE', (draft) => { draft.chapters[0].scenes[0].road.start = -1; }],
  ['ROAD_INVALID', (draft) => { draft.chapters[0].scenes[0].road.end = 0; }],
  ['ROAD_INVALID', (draft) => { draft.chapters[0].scenes[0].road.start = NaN; }],
  ['ROAD_INVALID', (draft) => { draft.chapters[0].scenes[0].road.end = Infinity; }],
  ['BLEND_NEGATIVE', (draft) => { draft.chapters[0].scenes[0].blend.in = -1; }],
  ['BLEND_NEGATIVE', (draft) => { draft.chapters[0].scenes[0].blend.out = NaN; }],
  ['BLEND_TOO_LONG', (draft) => { draft.chapters[0].scenes[0].blend.in = 131; }],
  ['RENDERER_UNREGISTERED', (draft) => { draft.chapters[0].scenes[0].renderer = 'shader'; }],
  ['RENDERER_UNREGISTERED', (draft) => { draft.chapters[0].scenes[0].renderer = 'video'; }],
  ['RENDERER_UNREGISTERED', (draft) => { draft.chapters[0].scenes[0].renderer = 'mirrors'; }],
  ['ASSET_MISSING', (draft) => { delete draft.chapters[0].scenes[0].asset; }],
  ['ASSET_UNKNOWN', (draft) => {
    draft.chapters[0].scenes[0].asset = 'missing';
    delete draft.chapters[0].scenes[0].clip;
  }],
  ['CLIP_WITHOUT_ASSET', (draft) => { delete draft.chapters[0].scenes[0].asset; }],
  ['CLIP_UNKNOWN', (draft) => { draft.chapters[0].scenes[0].clip = 'missing'; }],
  ['CLIP_UNKNOWN', (draft) => { draft.chapters[0].scenes[0].clip = 'toString'; }],
  ['TRANSITION_ASSET', (draft) => { draft.chapters[0].scenes[2].behavior!.transition!.from.asset = 'missing'; }],
  ['TRANSITION_CLIP', (draft) => { draft.chapters[0].scenes[2].behavior!.transition!.to.clip = 'missing'; }],
  ['TRANSITION_KIND', (draft) => {
    Object.assign(draft.chapters[0].scenes[2].behavior!.transition!, { kind: 'memory' });
  }],
  ['TRANSITION_REF', (draft) => {
    Object.assign(draft.chapters[0].scenes[2].behavior!.transition!, { from: undefined });
  }],
  ['TRANSITION_REF', (draft) => {
    Object.assign(draft.chapters[0].scenes[2].behavior!.transition!.from, { frame: 'middle' });
  }],
  ['TREATMENT_KIND', (draft) => {
    Object.assign(draft.chapters[0].scenes[1].behavior!.treatment!, { kind: 'ring' });
  }],
  ['SEQUENCE_OVERLAP', (draft) => {
    draft.chapters[0].scenes[0].layer = 30;
    draft.chapters[0].scenes[1].layer = 30;
    draft.chapters[0].scenes[1].road.start = 129;
  }],
  ['SCREENS_INVALID', (draft) => { draft.chapters[0].scroll.screens = 0; }],
  ['SCREENS_INVALID', (draft) => { draft.chapters[0].scroll.screens = NaN; }],
  ['TIMELINE_INVALID', (draft) => { draft.chapters[0].timeline.end = Infinity; }],
  ['TIMELINE_START', (draft) => { draft.chapters[0].timeline.start = 1; }],
  ['TIMELINE_END', (draft) => { draft.chapters[0].timeline.end = 701; }],
  ['TIMELINE_GAP', (draft) => { draft.chapters[4].scenes[0].road.start = 1; }],
  ['TIMELINE_GAP', (draft) => { draft.chapters[4].scenes[1].road.start += 1; }],
  ['TIMELINE_GAP', (draft) => { draft.chapters[4].scenes[3].road.end -= 1; }],
  ['GATE_ON_LINEAR', (draft) => { draft.chapters[0].gate = { atRoad: 1 }; }],
  ['GATE_MISSING', (draft) => { draft.chapters[0].kind = 'hub'; }],
  ['GATE_RANGE', (draft) => {
    draft.chapters[0].kind = 'hub';
    draft.chapters[0].gate = { atRoad: 701 };
  }],
  ['FLOW_ENTRY', (draft) => { draft.flow.entry = 'missing'; }],
  ['FLOW_ORDER', (draft) => { draft.flow.order.push('missing'); }],
  ['FLOW_ORDER_ENTRY', (draft) => { draft.flow.order.reverse(); }],
  ['FLOW_ORDER_ENTRY', (draft) => { draft.flow.order = []; }],
  ['FLOW_ORDER_DUPLICATE', (draft) => { draft.flow.order.push('origin'); }],
  ['TRACK_ENABLED_UNKNOWN', (draft) => { draft.release.enabledTrackIds = ['missing']; }],
  ['TRACK_DEFAULT_UNKNOWN', (draft) => { draft.release.defaultTrackId = 'missing'; }],
  ['TRACK_EMPTY', (draft) => {
    draft.release.enabledTrackIds = ['empty'];
    draft.flow.tracks = { empty: [] };
  }],
  ['PLACEHOLDER_UNKNOWN', (draft) => { draft.release.placeholderChapterId = 'missing'; }],
  ['FLOW_REFERENCE', (draft) => { draft.flow.tracks = { future: ['missing'] }; }],
  ['FLOW_REFERENCE', (draft) => { draft.flow.hub = 'missing'; }],
  ['FLOW_REFERENCE', (draft) => { draft.flow.finale = 'missing'; }],
];

describe('validateStory rejection rules', () => {
  it.each(failures)('rejects %s', (code, mutate) => {
    const draft: Draft = structuredClone(storyConfig);
    mutate(draft);
    expect(validateStory(draft, assetsManifest, options).map((entry) => entry.code)).toContain(code);
  });

  it('accepts complete coverage including DOM cards and transition overlays', () => {
    expect(validateStory(storyConfig, assetsManifest, options)).toEqual([]);
    expect(() => assertValidStory(storyConfig, assetsManifest, options)).not.toThrow();
  });

  it('reports unregistered sequence renderers with the Phase 0 registry', () => {
    expect(() => assertValidStory(storyConfig, assetsManifest)).toThrow('RENDERER_UNREGISTERED');
  });

  it('keeps future branch validation without registering a branching runtime', () => {
    const draft: Draft = structuredClone(storyConfig);
    draft.chapters[0].kind = 'hub';
    draft.chapters[0].gate = { atRoad: 0 };
    draft.flow.tracks = { future: ['trials'] };
    draft.release.enabledTrackIds = ['future'];
    draft.release.defaultTrackId = 'future';
    draft.release.placeholderChapterId = 'stinger';
    expect(validateStory(draft, assetsManifest, options)).toEqual([]);
  });
});
