import { useEffect, useRef } from 'react';
import type { DirectorFrame, InteractionFrame, RendererContext, SceneFrame } from '../core/contracts';
import { createRenderer } from '../renderers/rendererRegistry';

type MountEntry = {
  host: HTMLDivElement;
  renderer: ReturnType<typeof createRenderer>;
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
    return () => {
      for (const entry of mountsRef.current.values()) {
        entry.renderer.destroy();
        entry.host.remove();
      }
      mountsRef.current.clear();
    };
  }, []);

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
        void Promise.resolve(renderer.mount(host, context)).then(() => {
          renderer.update(scene, interaction);
        });
        entry = { host, renderer };
        mounts.set(key, entry);
      }

      entry.host.style.zIndex = String(scene.layer);
      entry.renderer.update(scene, interaction);
    }

    for (const [key, entry] of mounts) {
      if (!nextKeys.has(key)) {
        entry.renderer.destroy();
        entry.host.remove();
        mounts.delete(key);
      }
    }
  }, [context, frame, interaction]);

  return <div ref={rootRef} className="renderer-stage" aria-hidden="true" />;
}
