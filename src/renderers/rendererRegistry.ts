import type { AudioBus, RendererKey, SceneRenderer } from '../core/contracts';

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
