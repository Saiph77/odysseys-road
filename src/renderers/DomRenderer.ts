import type { InteractionFrame, RendererContext, SceneFrame, SceneRenderer } from '../core/contracts';

const NEUTRAL_INTERACTION: InteractionFrame = {
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  focusX: 0,
  confidence: 0,
  detected: false,
  source: 'keyboard',
  timestamp: 0,
};

export class DomRenderer implements SceneRenderer {
  private panel: HTMLElement | null = null;

  private lines: HTMLElement[] = [];

  private context: RendererContext | null = null;

  mount(host: HTMLElement, context: RendererContext) {
    this.context = context;
    this.panel = document.createElement('div');
    this.panel.className = 'dom-scene';
    this.panel.dataset.renderer = 'dom';
    host.appendChild(this.panel);
  }

  update(scene: SceneFrame) {
    if (!this.panel || !this.context) return;
    const content = this.context.content[scene.sceneId];
    if (!content) {
      this.panel.style.opacity = '0';
      return;
    }

    if (this.panel.dataset.sceneId !== scene.sceneId) {
      this.panel.dataset.sceneId = scene.sceneId;
      this.panel.dataset.variant = content.variant ?? 'chapter';
      this.panel.innerHTML = '';
      this.lines = content.lines.map((line) => {
        const element = document.createElement('p');
        element.className = 'dom-scene__line';
        element.textContent = line;
        this.panel!.appendChild(element);
        return element;
      });
    }

    this.panel.style.opacity = String(scene.opacity);
    const reveal = Math.min(1, scene.localProgress * 1.2);
    this.lines.forEach((line, index) => {
      const threshold = (index + 1) / this.lines.length;
      const visible = reveal >= threshold * 0.85;
      line.style.opacity = visible ? '1' : '0';
      line.style.transform = visible ? 'translateY(0)' : 'translateY(0.6rem)';
    });
  }

  destroy() {
    this.panel?.remove();
    this.panel = null;
    this.lines = [];
    this.context = null;
  }

  static neutralInteraction() {
    return NEUTRAL_INTERACTION;
  }
}
