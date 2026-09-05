import type { ProgressSource } from './contracts';
import { mapScrollProgress, rawProgressFromMapped } from './timeline';

type Publish = (rawProgress: number) => void;

let seekTarget: { progress: number; top: number } | null = null;

function readScrollProgress(): number {
  const stage = document.querySelector<HTMLElement>('.stage');
  if (!stage) return 0;
  const maxScroll = stage.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  if (seekTarget && Math.abs(window.scrollY - seekTarget.top) < 1) return seekTarget.progress;
  seekTarget = null;
  return mapScrollProgress(window.scrollY / maxScroll);
}

export class ScrollProgressSource implements ProgressSource {
  readonly kind = 'scroll' as const;

  private publish: Publish | null = null;

  private pendingFrame: number | null = null;

  private readonly onScroll = () => {
    if (this.pendingFrame !== null) return;
    this.pendingFrame = window.requestAnimationFrame(() => {
      this.pendingFrame = null;
      this.publish?.(readScrollProgress());
    });
  };

  start(publish: Publish) {
    this.stop();
    this.publish = publish;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    publish(readScrollProgress());
  }

  stop() {
    if (this.pendingFrame !== null) window.cancelAnimationFrame(this.pendingFrame);
    this.pendingFrame = null;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.publish = null;
  }
}

export class DebugProgressSource implements ProgressSource {
  readonly kind = 'debug' as const;

  private publish: Publish | null = null;

  private current = 0;

  start(publish: Publish) {
    this.publish = publish;
    publish(this.current);
  }

  stop() {
    this.publish = null;
  }

  setProgress(progress: number) {
    this.current = Math.min(1, Math.max(0, progress));
    this.publish?.(this.current);
  }
}

export function scrollToProgress(progress: number) {
  const stage = document.querySelector<HTMLElement>('.stage');
  if (!stage) return;
  const maxScroll = stage.scrollHeight - window.innerHeight;
  const rawProgress = rawProgressFromMapped(progress);
  const top = Math.max(0, maxScroll) * rawProgress;
  seekTarget = { progress: mapScrollProgress(rawProgress), top };
  window.scrollTo({ top, behavior: 'auto' });
}
