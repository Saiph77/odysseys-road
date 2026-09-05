import type { AssetManifestEntry } from '../../core/contracts';
import { renderConfig } from '../../config/render.config';

export type DecodedFrame = {
  image: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};
type CachedFrame = DecodedFrame & { key: string; assetId: string; index: number };
type Job = { asset: AssetManifestEntry; index: number; priority: number };
type Loader = (url: string, signal: AbortSignal) => Promise<DecodedFrame>;

export function frameUrl(asset: AssetManifestEntry, index: number) {
  if (!asset.pattern) throw new Error(`Missing frame pattern: ${asset.id}`);
  return `${asset.path}/${asset.pattern.replace(/%0(\d+)d/, (_, digits: string) => String(index).padStart(Number(digits), '0'))}`;
}

async function decodeFrame(url: string, signal: AbortSignal): Promise<DecodedFrame> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Frame unavailable: ${response.status} ${url}`);
  const bitmap = await createImageBitmap(await response.blob());
  return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
}

export class FrameStore {
  private readonly cache = new Map<string, CachedFrame>();
  private readonly pending = new Map<string, AbortController>();
  private readonly jobs = new Map<string, Job>();
  private readonly failed = new Set<string>();
  private readonly listeners = new Set<() => void>();
  private clock = 0;
  private disposed = false;

  constructor(
    private readonly load: Loader = decodeFrame,
    private readonly capacity: number = renderConfig.decodedFrames,
  ) {}

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  sample(asset: AssetManifestEntry, index: number): CachedFrame | undefined {
    this.request(asset, index, true);
    for (let distance = 1; distance <= renderConfig.prefetchRadius; distance++) {
      this.request(asset, index - distance, false);
      this.request(asset, index + distance, false);
    }
    const exact = this.cache.get(`${asset.id}:${index}`);
    const nearest =
      exact ??
      [...this.cache.values()]
        .filter((frame) => frame.assetId === asset.id)
        .sort((first, second) => Math.abs(first.index - index) - Math.abs(second.index - index))[0];
    if (nearest) {
      this.cache.delete(nearest.key);
      this.cache.set(nearest.key, nearest);
    }
    return nearest;
  }

  request(asset: AssetManifestEntry, index: number, urgent = true) {
    if (this.disposed || index < 1 || index > asset.frameCount) return;
    const key = `${asset.id}:${index}`;
    if (this.cache.has(key) || this.pending.has(key) || this.failed.has(key)) return;
    this.jobs.set(key, { asset, index, priority: urgent ? ++this.clock : 0 });
    while (this.jobs.size > renderConfig.queueLimit) {
      const oldest = [...this.jobs].sort(
        (first, second) => first[1].priority - second[1].priority,
      )[0];
      this.jobs.delete(oldest[0]);
    }
    this.pump();
  }

  private pump() {
    while (!this.disposed && this.pending.size < renderConfig.concurrentDecodes && this.jobs.size) {
      const [key, job] = [...this.jobs].sort(
        (first, second) => second[1].priority - first[1].priority,
      )[0];
      this.jobs.delete(key);
      const controller = new AbortController();
      this.pending.set(key, controller);
      void this.load(frameUrl(job.asset, job.index), controller.signal)
        .then((frame) => {
          if (this.disposed) {
            frame.close();
            return;
          }
          this.cache.set(key, { ...frame, key, assetId: job.asset.id, index: job.index });
          while (this.cache.size > this.capacity) {
            const oldest = this.cache.entries().next().value!;
            oldest[1].close();
            this.cache.delete(oldest[0]);
          }
          this.listeners.forEach((callback) => callback());
        })
        .catch((error: unknown) => {
          if (!this.disposed) {
            this.failed.add(key);
            console.warn(`Frame decode failed: ${key}`, error);
          }
        })
        .finally(() => {
          this.pending.delete(key);
          this.pump();
        });
    }
  }

  get stats() {
    return {
      decoded: this.cache.size,
      pending: this.pending.size,
      queued: this.jobs.size,
      failed: this.failed.size,
    };
  }

  destroy() {
    this.disposed = true;
    this.pending.forEach((controller) => controller.abort());
    this.cache.forEach((frame) => frame.close());
    this.pending.clear();
    this.cache.clear();
    this.jobs.clear();
    this.failed.clear();
    this.listeners.clear();
  }
}
