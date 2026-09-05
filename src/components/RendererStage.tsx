import { useEffect, useRef } from 'react';
import type { DirectorFrame, InteractionFrame, RendererContext, SceneFrame } from '../core/contracts';
import { createRenderer } from '../renderers/rendererRegistry';

type MountEntry = {
  host: HTMLDivElement;
  renderer: ReturnType<typeof createRenderer>;
  ready: boolean;
  active: boolean;
  scene: SceneFrame;
  interaction: InteractionFrame;
};

function sceneKey(scene: SceneFrame) {
  return `${scene.renderer}:${scene.sceneId}`;
}

export function RendererStage({
  frame,
  context,
  interaction,
}: {
  frame: DirectorFrame;
  context: RendererContext;
  interaction: InteractionFrame;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountsRef = useRef<Map<string, MountEntry>>(new Map());

  useEffect(() => {
    const mounts = mountsRef.current;
    return () => {
      for (const entry of mounts.values()) {
        entry.active = false;
        entry.renderer.destroy();
        entry.host.remove();
      }
      mounts.clear();
    };
  }, [context]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mounts = mountsRef.current;
    const nextKeys = new Set<string>();

    for (const scene of frame.activeScenes) {
      if (scene.renderer !== 'dom') continue;
      const key = sceneKey(scene);
      nextKeys.add(key);

      let entry = mounts.get(key);
      if (!entry) {
        const host = document.createElement('div');
        host.className = 'renderer-layer';
        host.style.zIndex = String(scene.layer);
        root.appendChild(host);
        const renderer = createRenderer('dom');
        entry = { host, renderer, ready: false, active: true, scene, interaction };
        mounts.set(key, entry);
        const mounted = entry;
        void Promise.resolve().then(() => {
          if (mounted.active) return renderer.mount(host, context);
        }).then(() => {
          if (!mounted.active) return;
          mounted.ready = true;
          renderer.update(mounted.scene, mounted.interaction);
        }).catch((error: unknown) => {
          if (!mounted.active) return;
          mounted.active = false;
          renderer.destroy();
          host.remove();
          if (mounts.get(key) === mounted) mounts.delete(key);
          console.error(`Renderer mount failed: ${key}`, error);
        });
      }

      entry.scene = scene;
      entry.interaction = interaction;
      entry.host.style.zIndex = String(scene.layer);
      if (entry.ready && entry.active) entry.renderer.update(scene, interaction);
    }

    for (const [key, entry] of mounts) {
      if (!nextKeys.has(key)) {
        entry.active = false;
        entry.renderer.destroy();
        entry.host.remove();
        mounts.delete(key);
      }
    }
  }, [context, frame, interaction]);

  return <div ref={rootRef} className="renderer-stage" aria-hidden="true" />;
}
