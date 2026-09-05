import type { SceneFrame, SceneRenderer } from '../core/contracts';

export class SequencePlaceholder implements SceneRenderer {
  mount() {}
  update(_scene: SceneFrame) {
    void _scene;
  }
  destroy() {}
}
