import type { AssetManifest, SceneFrame } from './contracts';
import { clamp01 } from './validateStory';

export function plannedFrameIndex(scene: SceneFrame, manifest: AssetManifest): number | undefined {
  if (scene.renderer !== 'sequence' || !scene.asset) return undefined;
  const asset = manifest.assets.find((entry) => entry.id === scene.asset);
  if (!asset) return undefined;
  const clip = scene.clip ? asset.clips[scene.clip] : { from: 1, to: asset.frameCount };
  if (!clip) return undefined;
  const scrub = scene.behavior?.scrub ?? { from: 0, to: 1 };
  const progress = scrub.from + clamp01(scene.localProgress) * (scrub.to - scrub.from);
  return Math.round(clip.from + clamp01(progress) * (clip.to - clip.from));
}
