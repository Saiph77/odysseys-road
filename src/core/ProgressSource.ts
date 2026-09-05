import type { ProgressSource } from './contracts';
import { mapScrollProgress } from './timeline';

type Publish = (rawProgress: number) => void;

function readScrollProgress(): number {
  const stage = document.querySelector<HTMLElement>('.stage');
  if (!stage) return 0;
  const maxScroll = stage.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return mapScrollProgress(window.scrollY / maxScroll);
}

export class ScrollProgressSource implements ProgressSource {
  readonly kind = 'scroll' as const;

  private publish: Publish | null = null;

  private readonly onScroll = () => {
    this.publish?.(readScrollProgress());
  };

  start(publish: Publish) {
    this.publish = publish;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    this.onScroll();
  }

  stop() {
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
  window.scrollTo({ top: maxScroll * Math.min(1, Math.max(0, progress)), behavior: 'auto' });
}
