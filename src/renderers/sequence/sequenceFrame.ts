import type {
  AssetManifest,
  AssetManifestEntry,
  SceneFrame,
  TransitionFrameRef,
} from '../../core/contracts';
import { behaviorOf } from '../../core/behavior';
import { plannedFrameIndex } from '../../core/frameIndex';

export type TextureRequest = { asset: AssetManifestEntry; index: number };
export type SequenceDraw = {
  from: TextureRequest;
  to: TextureRequest;
  progress: number;
  mode: 'plain' | 'memory' | 'burn' | 'ring';
  zoom: number;
  scene: SceneFrame;
};

export function sequenceFrame(
  scene: SceneFrame,
  manifest: AssetManifest,
  effects: boolean,
  reduced: boolean,
): SequenceDraw | undefined {
  const behavior = behaviorOf(scene);
  const resolve = (reference: TransitionFrameRef): TextureRequest => {
    const asset = manifest.assets.find((entry) => entry.id === reference.asset)!;
    const clip = asset.clips[reference.clip];
    return { asset, index: reference.frame === 'first' ? clip.from : clip.to };
  };
  if (behavior.transition) {
    if (!effects) return undefined;
    return {
      from: resolve(behavior.transition.from),
      to: resolve(behavior.transition.to),
      progress: scene.localProgress,
      mode: reduced ? 'plain' : behavior.transition.kind,
      zoom: 1,
      scene,
    };
  }
  const asset = manifest.assets.find((entry) => entry.id === scene.asset);
  const index = plannedFrameIndex(scene, manifest);
  if (!asset || index === undefined) return undefined;
  const treatment = behavior.treatment;
  const zoom =
    effects && !reduced && treatment?.kind === 'zoom'
      ? (treatment.from ?? 1) + scene.localProgress * ((treatment.to ?? 1) - (treatment.from ?? 1))
      : 1;
  return {
    from: { asset, index },
    to: { asset, index },
    progress: scene.localProgress,
    mode: effects && !reduced && treatment?.kind === 'memory' ? 'memory' : 'plain',
    zoom,
    scene,
  };
}
