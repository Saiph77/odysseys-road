import { describe, expect, it } from 'vitest';
import { assetsManifest } from '../../src/config/assets.manifest';
import { storyConfig } from '../../src/config/story.config';
import { StoryDirector } from '../../src/core/StoryDirector';
import { resolveActiveScenes } from '../../src/core/SceneRegistry';
import { validateStory } from '../../src/core/validateStory';
import type { StoryConfig } from '../../src/core/contracts';

const baseOptions = { registeredRenderers: ['dom', 'sequence'] as const };

describe('validateStory', () => {
  it('accepts the shipped story config', () => {
    expect(validateStory(storyConfig, assetsManifest, baseOptions)).toEqual([]);
  });

  it('rejects duplicate scene ids', () => {
    const bad = {
      ...storyConfig,
      chapters: storyConfig.chapters.map((chapter) =>
        chapter.id === 'origin'
          ? {
              ...chapter,
              scenes: [...chapter.scenes, chapter.scenes[0]],
            }
          : chapter,
      ),
    } satisfies StoryConfig;
    expect(
      validateStory(bad, assetsManifest, baseOptions).some((i) => i.code === 'DUPLICATE_SCENE'),
    ).toBe(true);
  });

  it('rejects road out of timeline', () => {
    const bad = {
      ...storyConfig,
      chapters: storyConfig.chapters.map((chapter) =>
        chapter.id === 'stinger'
          ? {
              ...chapter,
              scenes: chapter.scenes.map((scene) =>
                scene.id === 'stinger-outro'
                  ? { ...scene, road: { start: 0, end: chapter.timeline.end + 50 } }
                  : scene,
              ),
            }
          : chapter,
      ),
    } satisfies StoryConfig;
    expect(
      validateStory(bad, assetsManifest, baseOptions).some(
        (i) => i.code === 'ROAD_OUT_OF_TIMELINE',
      ),
    ).toBe(true);
  });

  it('rejects sequence overlap on layer 10', () => {
    const bad = {
      ...storyConfig,
      chapters: storyConfig.chapters.map((chapter) =>
        chapter.id === 'homeward'
          ? {
              ...chapter,
              scenes: chapter.scenes.map((scene) =>
                scene.id === 'homeward-031'
                  ? { ...scene, road: { start: 100, end: scene.road.end } }
                  : scene,
              ),
            }
          : chapter,
      ),
    } satisfies StoryConfig;
    expect(
      validateStory(bad, assetsManifest, baseOptions).some((i) => i.code === 'SEQUENCE_OVERLAP'),
    ).toBe(true);
  });

  it('rejects unregistered renderer', () => {
    expect(
      validateStory(storyConfig, assetsManifest, { registeredRenderers: ['dom'] }).some(
        (i) => i.code === 'RENDERER_UNREGISTERED',
      ),
    ).toBe(true);
  });

  it('rejects unknown clip', () => {
    const bad = {
      ...storyConfig,
      chapters: storyConfig.chapters.map((chapter) =>
        chapter.id === 'origin'
          ? {
              ...chapter,
              scenes: chapter.scenes.map((scene) =>
                scene.id === 'origin-sea' ? { ...scene, clip: 'missing-clip' } : scene,
              ),
            }
          : chapter,
      ),
    } satisfies StoryConfig;
    expect(
      validateStory(bad, assetsManifest, baseOptions).some((i) => i.code === 'CLIP_UNKNOWN'),
    ).toBe(true);
  });

  it('rejects transition clip that does not exist', () => {
    const bad = {
      ...storyConfig,
      chapters: storyConfig.chapters.map((chapter) =>
        chapter.id === 'origin'
          ? {
              ...chapter,
              scenes: chapter.scenes.map((scene) =>
                scene.id === 'origin-burn'
                  ? {
                      ...scene,
                      behavior: {
                        transition: {
                          kind: 'burn' as const,
                          from: { asset: 'act-1-origin', clip: 'missing', frame: 'last' as const },
                          to: {
                            asset: 'act-1-origin',
                            clip: '007-go-home',
                            frame: 'first' as const,
                          },
                        },
                      },
                    }
                  : scene,
              ),
            }
          : chapter,
      ),
    } satisfies StoryConfig;
    expect(
      validateStory(bad, assetsManifest, baseOptions).some((i) => i.code === 'TRANSITION_CLIP'),
    ).toBe(true);
  });
});

describe('StoryDirector', () => {
  const director = new StoryDirector(storyConfig);

  it('maps rawProgress 0 to origin road 0', () => {
    const frame = director.fromProgress(0);
    expect(frame.chapterId).toBe('origin');
    expect(frame.road).toBeCloseTo(0, 5);
  });

  it('maps rawProgress 1 to stinger road 500', () => {
    const frame = director.fromProgress(1);
    expect(frame.chapterId).toBe('stinger');
    expect(frame.road).toBeCloseTo(500, 5);
  });

  it('keeps chapter ownership stable near boundaries', () => {
    const originWeight = 7 / 40;
    const before = director.fromProgress(originWeight - 1e-6);
    const after = director.fromProgress(originWeight);
    expect(before.chapterId).toBe('origin');
    expect(before.road).toBeCloseTo(700, 0);
    expect(after.chapterId).toBe('ithaca');
    expect(after.road).toBeCloseTo(0, 5);
  });
});

describe('SceneRegistry', () => {
  const origin = storyConfig.chapters.find((chapter) => chapter.id === 'origin')!;

  it('activates overlapping memory and burn scenes with expected opacity', () => {
    const active = resolveActiveScenes(origin, 550);
    const ids = active.map((scene) => scene.sceneId);
    expect(ids).toContain('origin-memory');
    expect(ids).toContain('origin-burn');
    expect(ids).toContain('origin-captions');
    const burn = active.find((scene) => scene.sceneId === 'origin-burn');
    expect(burn?.opacity).toBeGreaterThan(0);
    expect(burn?.localProgress).toBeCloseTo(0.375, 2);
  });
});
