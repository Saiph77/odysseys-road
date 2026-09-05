import type { AudioBus, RendererKey, SceneRenderer } from '../core/contracts';
import { SequenceRendererGL } from './sequence/SequenceRendererGL';
import { SequenceRenderer2D } from './sequence/SequenceRenderer2D';
import type { FrameStore } from './sequence/FrameStore';
import type { RendererContext, SceneFrame, InteractionFrame } from '../core/contracts';

export function sequenceFactory(
  store: FrameStore,
  capabilities: { webgl: boolean; effects: boolean },
): SceneRenderer {
  let backend: SceneRenderer = capabilities.webgl
    ? new SequenceRendererGL(store, capabilities.effects)
    : new SequenceRenderer2D(store, capabilities.effects);
  let host: HTMLElement, context: RendererContext;
  let latest: { scene: SceneFrame; interaction: InteractionFrame } | undefined;
  const fallback = () => {
    backend.destroy();
    backend = new SequenceRenderer2D(store, capabilities.effects);
    backend.mount(host, { ...context, reducedMotion: true });
    if (latest) backend.update(latest.scene, latest.interaction);
  };
  return {
    mount(container, rendererContext) {
      host = container;
      context = rendererContext;
      host.addEventListener('sequence-context-lost', fallback);
      try {
        return backend.mount(host, context);
      } catch (error) {
        console.warn('Using Canvas 2D fallback', error);
        fallback();
      }
    },
    update(scene, interaction) {
      latest = { scene, interaction };
      backend.update(scene, interaction);
    },
    destroy() {
      host?.removeEventListener('sequence-context-lost', fallback);
      backend.destroy();
    },
  };
}

export type RendererFactory = () => SceneRenderer;

const factories = new Map<RendererKey, RendererFactory>();

export function registerRenderer(key: RendererKey, factory: RendererFactory) {
  factories.set(key, factory);
}

export function createRenderer(key: RendererKey): SceneRenderer {
  const factory = factories.get(key);
  if (!factory) {
    throw new Error(`Renderer "${key}" is not registered`);
  }
  return factory();
}

export function getRegisteredRendererKeys(): RendererKey[] {
  return [...factories.keys()];
}

export class NullAudioBus implements AudioBus {
  async load() {}

  play() {}

  setMix() {}

  stop() {}
}
