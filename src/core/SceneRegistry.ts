import type { ChapterDefinition, SceneDefinition, SceneFrame } from './contracts';
import { clamp01 } from './validateStory';

const smoothstep = (edge0: number, edge1: number, value: number) => {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
};

function sceneOpacity(scene: SceneDefinition, road: number): number {
  const span = scene.road.end - scene.road.start;
  if (road < scene.road.start || road > scene.road.end || span <= 0) {
    return 0;
  }
  const localRoad = road - scene.road.start;
  const fadeIn = scene.blend.in > 0 ? smoothstep(0, scene.blend.in, localRoad) : 1;
  const fadeOut =
    scene.blend.out > 0 ? 1 - smoothstep(span - scene.blend.out, span, localRoad) : 1;
  return clamp01(fadeIn * fadeOut);
}

function sceneLocalProgress(scene: SceneDefinition, road: number): number {
  const span = scene.road.end - scene.road.start;
  if (span <= 0) return 0;
  return clamp01((road - scene.road.start) / span);
}

export function resolveActiveScenes(chapter: ChapterDefinition, road: number): SceneFrame[] {
  const frames: SceneFrame[] = [];

  for (const scene of chapter.scenes) {
    if (road === scene.road.end && road !== chapter.timeline.end) continue;
    const opacity = sceneOpacity(scene, road);
    if (opacity <= 0) continue;
    frames.push({
      sceneId: scene.id,
      renderer: scene.renderer,
      localProgress: sceneLocalProgress(scene, road),
      opacity,
      layer: scene.layer,
      asset: scene.asset,
      clip: scene.clip,
      behavior: scene.behavior,
    });
  }

  return frames.sort((first, second) => first.layer - second.layer);
}

export class SceneRegistry {
  resolve(chapter: ChapterDefinition, road: number): readonly SceneFrame[] {
    return resolveActiveScenes(chapter, road);
  }
}
