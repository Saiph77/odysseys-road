import type {
  DirectorFrame,
  RendererContext,
  SceneFrame,
  SceneRenderer,
  RendererKey,
} from './contracts';
import { createRenderer } from '../renderers/rendererRegistry';
import { DomRenderer } from '../renderers/DomRenderer';

type Entry = {
  host: HTMLElement;
  renderer: SceneRenderer;
  scene: SceneFrame;
  ready: boolean;
  active: boolean;
};

export class RendererHost {
  private readonly entries = new Map<string, Entry>();
  constructor(
    private readonly root: HTMLElement,
    private readonly context: RendererContext,
  ) {}

  update(frame: DirectorFrame) {
    const activeKeys = new Set<string>();
    for (const scene of frame.activeScenes) {
      const key =
        scene.renderer === 'sequence' ? `${scene.renderer}:${scene.layer}` : scene.sceneId;
      activeKeys.add(key);
      let entry = this.entries.get(key);
      if (!entry) {
        const host = document.createElement('div');
        host.className = 'renderer-layer';
        this.root.appendChild(host);
        const renderer = createRenderer(scene.renderer as RendererKey);
        entry = { host, renderer, scene, ready: false, active: true };
        this.entries.set(key, entry);
        const mounted = entry;
        try {
          const result = renderer.mount(host, this.context);
          if (result instanceof Promise) {
            void result
              .then(() => {
                if (!mounted.active) {
                  renderer.destroy();
                  return;
                }
                mounted.ready = true;
                renderer.update(mounted.scene, DomRenderer.neutralInteraction());
              })
              .catch((error: unknown) => {
                console.error('Renderer mount failed', key, error);
                this.release(key, mounted);
              });
          } else mounted.ready = true;
        } catch (error) {
          this.release(key, mounted);
          throw error;
        }
      }
      entry.scene = scene;
      entry.host.style.zIndex = String(scene.layer);
      if (entry.active && entry.ready)
        entry.renderer.update(scene, DomRenderer.neutralInteraction());
    }
    for (const [key, entry] of this.entries) if (!activeKeys.has(key)) this.release(key, entry);
  }

  private release(key: string, entry: Entry) {
    entry.active = false;
    entry.renderer.destroy();
    entry.host.remove();
    if (this.entries.get(key) === entry) this.entries.delete(key);
  }

  destroy() {
    for (const [key, entry] of this.entries) this.release(key, entry);
  }
}
