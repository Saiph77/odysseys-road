import { expect, it, vi } from 'vitest';
import { FrameStore, frameUrl } from '../../src/renderers/sequence/FrameStore';
import type { AssetManifestEntry } from '../../src/core/contracts';

const asset: AssetManifestEntry = {
  id: 'sample',
  path: '/sample',
  pattern: 'frame-%04d.jpg',
  frameCount: 30,
  fps: 24,
  width: 1280,
  height: 720,
  clips: {},
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

it('formats asset-owned filename patterns', () => {
  expect(frameUrl(asset, 12)).toBe('/sample/frame-0012.jpg');
});
it('deduplicates loads, prefetches nearby frames and retains a nearest decoded frame', async () => {
  const load = vi.fn(async () => ({
    image: {} as ImageBitmap,
    width: 1280,
    height: 720,
    close: vi.fn(),
  }));
  const store = new FrameStore(load);
  expect(store.sample(asset, 10)).toBeUndefined();
  store.sample(asset, 10);
  await settle();
  expect(load).toHaveBeenCalledTimes(7);
  expect(store.sample(asset, 10)?.index).toBe(10);
  expect(store.sample(asset, 30)?.index).toBe(13);
  store.destroy();
});
it('evicts decoded frames by LRU and releases bitmap resources', async () => {
  const close = vi.fn();
  const store = new FrameStore(
    async () => ({ image: {} as ImageBitmap, width: 1280, height: 720, close }),
    2,
  );
  store.request(asset, 1);
  store.request(asset, 2);
  await settle();
  store.request(asset, 3);
  await settle();
  expect(store.stats.decoded).toBe(2);
  expect(close).toHaveBeenCalledTimes(1);
  store.destroy();
  expect(close).toHaveBeenCalledTimes(3);
});
it('releases a decode that completes after teardown', async () => {
  const close = vi.fn();
  let complete!: (value: {
    image: ImageBitmap;
    width: number;
    height: number;
    close: () => void;
  }) => void;
  const store = new FrameStore(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  store.request(asset, 1);
  store.destroy();
  complete({ image: {} as ImageBitmap, width: 1280, height: 720, close });
  await settle();
  expect(close).toHaveBeenCalledOnce();
  expect(store.stats.decoded).toBe(0);
});
