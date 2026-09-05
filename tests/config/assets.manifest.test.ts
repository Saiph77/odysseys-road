import { expect, it } from 'vitest';
import { assetsManifest } from '../../src/config/assets.manifest';

it('contains six chapter assets with bounded inclusive frame clips', () => {
  expect(assetsManifest.assets).toHaveLength(6);
  expect(assetsManifest.assets.some((asset) => asset.id.includes('official-trailer'))).toBe(false);
  for (const asset of assetsManifest.assets)
    for (const clip of Object.values(asset.clips)) {
      expect(clip.from).toBeGreaterThanOrEqual(1);
      expect(clip.to).toBeGreaterThanOrEqual(clip.from);
      expect(clip.to).toBeLessThanOrEqual(asset.frameCount);
    }
});
