/** Scroll progress mapping — Pear timeline.js:47-71 (desktop passthrough for V2). */

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function mapScrollProgress(rawProgress: number, isMobile = false): number {
  const raw = clamp(rawProgress);
  if (!isMobile) return raw;
  return raw;
}

export function rawProgressFromMapped(progress: number, isMobile = false): number {
  const mapped = clamp(progress);
  if (!isMobile) return mapped;
  return mapped;
}

export function roadFromProgress(progress: number, timelineEnd: number): number {
  return clamp(progress) * timelineEnd;
}
