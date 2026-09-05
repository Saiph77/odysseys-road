import { describe, expect, it } from 'vitest';
import { storyConfig } from '../../src/config/story.config';
import type { ChapterDefinition } from '../../src/core/contracts';
import { resolveActiveScenes } from '../../src/core/SceneRegistry';
import { progressForChapterRoad, StoryDirector } from '../../src/core/StoryDirector';
import { mapScrollProgress, rawProgressFromMapped } from '../../src/core/timeline';

describe('chapter boundaries and inverse seek', () => {
  const director = new StoryDirector(storyConfig);

  it.each([
    [7 / 40, 'origin', 'ithaca'],
    [17 / 40, 'ithaca', 'trials'],
    [26 / 40, 'trials', 'homeward'],
    [35 / 40, 'homeward', 'stinger'],
  ])('resolves both sides of %s', (boundary, before, after) => {
    expect(director.fromProgress(boundary - 1e-6).chapterId).toBe(before);
    expect(director.fromProgress(boundary).chapterId).toBe(after);
    expect(director.fromProgress(boundary).road).toBe(0);
    expect(director.fromProgress(boundary + 1e-6).chapterId).toBe(after);
  });

  it.each(storyConfig.chapters)('round-trips chapter $id through physical progress', (chapter) => {
    for (const fraction of [0, 0.1, 0.5, 0.9, 0.999]) {
      const road = fraction * chapter.timeline.end;
      const mapped = progressForChapterRoad(storyConfig, chapter.id, road);
      const result = director.fromProgress(
        mapScrollProgress(rawProgressFromMapped(mapped)),
        'debug',
      );
      expect(result.chapterId).toBe(chapter.id);
      expect(result.road).toBeCloseTo(road, 8);
      expect(result.source).toBe('debug');
    }
  });

  it('clamps progress and preserves the last scene at the end', () => {
    expect(director.fromProgress(-1).road).toBe(0);
    const final = director.fromProgress(2);
    expect(final.chapterId).toBe('stinger');
    expect(final.road).toBe(500);
    expect(final.activeScenes.map((scene) => scene.sceneId)).toEqual(['stinger-outro']);
  });
});

describe('SceneRegistry interval ownership and opacity', () => {
  it.each(storyConfig.chapters)('has no double sequence at hard cuts in $id', (chapter) => {
    const sequences = chapter.scenes.filter(
      (scene) => scene.renderer === 'sequence' && scene.layer === 10,
    );
    for (const scene of sequences) {
      const active = resolveActiveScenes(chapter, scene.road.start).filter(
        (frame) => frame.layer === 10,
      );
      expect(active.map((frame) => frame.sceneId)).toEqual([scene.id]);
    }
  });

  it('keeps the overlay on both sides of the burn cut and releases it at its end', () => {
    const origin = storyConfig.chapters[0];
    const before = resolveActiveScenes(origin, 550);
    const after = resolveActiveScenes(origin, 560);
    expect(before.map((scene) => scene.sceneId)).toContain('origin-memory');
    expect(after.map((scene) => scene.sceneId)).not.toContain('origin-memory');
    expect(after.map((scene) => scene.sceneId)).toContain('origin-alone');
    expect(after.find((scene) => scene.sceneId === 'origin-burn')?.opacity).toBe(1);
    expect(resolveActiveScenes(origin, 600).map((scene) => scene.sceneId)).not.toContain(
      'origin-burn',
    );
  });

  const fixture: ChapterDefinition = {
    id: 'blend-fixture',
    kind: 'linear',
    timeline: { start: 0, end: 100 },
    scroll: { screens: 1 },
    scenes: [
      {
        id: 'blend-scene',
        road: { start: 0, end: 100 },
        blend: { in: 20, out: 20 },
        layer: 10,
        renderer: 'dom',
      },
    ],
  };

  it.each([
    [5, 0.15625],
    [10, 0.5],
    [20, 1],
    [50, 1],
    [80, 1],
    [90, 0.5],
    [95, 0.15625],
  ])('uses reversible smoothstep at Road %s', (road, opacity) => {
    expect(resolveActiveScenes(fixture, road)[0].opacity).toBeCloseTo(opacity);
    expect(resolveActiveScenes(fixture, 100 - road)[0].opacity).toBeCloseTo(opacity);
  });

  it('omits fully transparent and out-of-range scenes', () => {
    for (const road of [-1, 0, 100, 101]) expect(resolveActiveScenes(fixture, road)).toEqual([]);
  });
});
