import type { SceneBehavior, SceneFrame } from './contracts';

export function behaviorOf(scene: Pick<SceneFrame, 'behavior'>): SceneBehavior {
  return (scene.behavior ?? {}) as SceneBehavior;
}
