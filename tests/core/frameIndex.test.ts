import { describe, expect, it } from 'vitest';
import { assetsManifest } from '../../src/config/assets.manifest';
import type { AssetManifest, SceneFrame } from '../../src/core/contracts';
import { plannedFrameIndex } from '../../src/core/frameIndex';

const manifest: AssetManifest = {
  assets: [
    {
      id: 'fixture',
      path: '/fixture',
      frameCount: 100,
      fps: 24,
      width: 1280,
      height: 720,
      clips: { sample: { from: 11, to: 91 } },
    },
  ],
};
const scene: SceneFrame = {
  sceneId: 'fixture',
  renderer: 'sequence',
  asset: 'fixture',
  clip: 'sample',
  localProgress: 0,
  opacity: 1,
  layer: 10,
};

describe('plannedFrameIndex', () => {
  it.each([
    [0, 11],
    [0.5, 51],
    [1, 91],
    [-1, 11],
    [2, 91],
  ])('maps progress %s to clip frame %s', (progress, expected) => {
    expect(plannedFrameIndex({ ...scene, localProgress: progress }, manifest)).toBe(expected);
  });

  it('applies the configured micro-scrub range', () => {
    expect(
      plannedFrameIndex({ ...scene, behavior: { scrub: { from: 0.2, to: 0.8 } } }, manifest),
    ).toBe(27);
    expect(
      plannedFrameIndex(
        { ...scene, localProgress: 1, behavior: { scrub: { from: 0.2, to: 0.8 } } },
        manifest,
      ),
    ).toBe(75);
  });

  it('does not invent frame data for DOM, transitions or unresolved references', () => {
    expect(plannedFrameIndex({ ...scene, renderer: 'dom' }, manifest)).toBeUndefined();
    expect(plannedFrameIndex({ ...scene, asset: undefined }, manifest)).toBeUndefined();
    expect(plannedFrameIndex({ ...scene, clip: 'missing' }, manifest)).toBeUndefined();
    expect(plannedFrameIndex(scene, assetsManifest)).toBeUndefined();
  });

  it('supports an entire asset without a clip', () => {
    expect(plannedFrameIndex({ ...scene, clip: undefined, localProgress: 1 }, manifest)).toBe(100);
  });
});
