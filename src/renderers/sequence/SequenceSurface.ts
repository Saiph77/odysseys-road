import type { RendererContext, SceneFrame, SceneRenderer } from '../../core/contracts';
import { renderConfig } from '../../config/render.config';
import { FrameStore, type DecodedFrame } from './FrameStore';
import { sequenceFrame, type SequenceDraw } from './sequenceFrame';

export abstract class SequenceSurface implements SceneRenderer {
  protected canvas!: HTMLCanvasElement;
  protected context!: RendererContext;
  protected scene: SceneFrame | undefined;
  private host!: HTMLElement;
  private scheduled: number | undefined;
  private unsubscribe: (() => void) | undefined;
  private resize: ResizeObserver | undefined;
  protected alive = false;

  constructor(
    protected readonly store: FrameStore,
    private readonly effects: boolean,
  ) {}

  mount(host: HTMLElement, context: RendererContext) {
    this.host = host;
    this.context = context;
    this.alive = true;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sequence-canvas';
    this.canvas.style.opacity = '0';
    host.appendChild(this.canvas);
    this.initialize();
    this.unsubscribe = this.store.subscribe(this.invalidate);
    this.resize = new ResizeObserver(this.invalidate);
    this.resize.observe(host);
  }

  update(scene: SceneFrame) {
    this.scene = scene;
    this.invalidate();
  }

  private invalidate = () => {
    if (!this.alive || this.scheduled !== undefined) return;
    this.scheduled = requestAnimationFrame(() => {
      this.scheduled = undefined;
      this.render();
    });
  };

  private render() {
    if (!this.scene || !this.alive) return;
    const frame = sequenceFrame(
      this.scene,
      this.context.assets,
      this.effects,
      this.context.reducedMotion,
    );
    if (!frame) {
      this.canvas.style.opacity = '0';
      return;
    }
    const from = this.store.sample(frame.from.asset, frame.from.index);
    const to = this.store.sample(frame.to.asset, frame.to.index);
    this.canvas.dataset.sceneId = this.scene.sceneId;
    this.canvas.dataset.requestedFrame = String(frame.from.index);
    this.canvas.dataset.exact = String(
      from?.index === frame.from.index && to?.index === frame.to.index,
    );
    if (!from || !to) return;
    const ratio = Math.min(devicePixelRatio, renderConfig.dprCap);
    const width = Math.round(this.host.clientWidth * ratio),
      height = Math.round(this.host.clientHeight * ratio);
    if (width === 0 || height === 0) return;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.draw(frame, from, to);
    this.canvas.dataset.renderedFrame = String(from.index);
    this.canvas.dataset.ready = 'true';
    this.canvas.style.opacity = String(this.scene.opacity);
  }

  protected abstract initialize(): void;
  protected abstract draw(
    frame: SequenceDraw,
    from: DecodedFrame & { key: string },
    to: DecodedFrame & { key: string },
  ): void;
  protected abstract dispose(): void;

  destroy() {
    this.alive = false;
    if (this.scheduled !== undefined) cancelAnimationFrame(this.scheduled);
    this.scheduled = undefined;
    this.unsubscribe?.();
    this.resize?.disconnect();
    this.dispose();
    this.canvas?.remove();
  }
}
