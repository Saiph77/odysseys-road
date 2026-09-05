import type {
  AssetManifest,
  ChapterDefinition,
  SceneDefinition,
  StoryConfig,
  ValidateStoryOptions,
  ValidationIssue,
} from './contracts';
import { REGISTERED_RENDERERS_PHASE0, SHADER_KINDS } from './contracts';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function issue(code: string, message: string, path?: string): ValidationIssue {
  return { code, message, path };
}

function sceneSpan(scene: SceneDefinition) {
  return scene.road.end - scene.road.start;
}

function validateSceneRoad(scene: SceneDefinition, chapter: ChapterDefinition, issues: ValidationIssue[]) {
  const { start, end } = scene.road;
  if (start < chapter.timeline.start || end > chapter.timeline.end) {
    issues.push(
      issue(
        'ROAD_OUT_OF_TIMELINE',
        `Scene "${scene.id}" road [${start}, ${end}] exceeds chapter timeline [${chapter.timeline.start}, ${chapter.timeline.end}]`,
        `chapters.${chapter.id}.scenes.${scene.id}`,
      ),
    );
  }
  if (end <= start) {
    issues.push(
      issue('ROAD_INVALID', `Scene "${scene.id}" has non-positive span`, `chapters.${chapter.id}.scenes.${scene.id}`),
    );
  }
  if (scene.blend.in < 0 || scene.blend.out < 0) {
    issues.push(issue('BLEND_NEGATIVE', `Scene "${scene.id}" has negative blend`, `chapters.${chapter.id}.scenes.${scene.id}`));
  }
  if (scene.blend.in + scene.blend.out > sceneSpan(scene)) {
    issues.push(
      issue('BLEND_TOO_LONG', `Scene "${scene.id}" blend exceeds span`, `chapters.${chapter.id}.scenes.${scene.id}`),
    );
  }
}

function validateRenderer(scene: SceneDefinition, options: ValidateStoryOptions, issues: ValidationIssue[]) {
  if (!options.registeredRenderers.includes(scene.renderer as (typeof options.registeredRenderers)[number])) {
    if (scene.renderer === 'sequence' || scene.renderer === 'dom') {
      issues.push(
        issue('RENDERER_UNREGISTERED', `Renderer "${scene.renderer}" is not registered`, `scenes.${scene.id}`),
      );
    }
  }
  if (scene.renderer === 'sequence' && !scene.asset && !scene.behavior?.transition) {
    issues.push(issue('ASSET_MISSING', `Sequence scene "${scene.id}" missing asset`, `scenes.${scene.id}`));
  }
}

function validateClip(
  scene: SceneDefinition,
  manifest: AssetManifest,
  issues: ValidationIssue[],
) {
  if (!scene.clip) return;
  if (!scene.asset) {
    issues.push(issue('CLIP_WITHOUT_ASSET', `Scene "${scene.id}" has clip but no asset`, `scenes.${scene.id}`));
    return;
  }
  const asset = manifest.assets.find((entry) => entry.id === scene.asset);
  if (!asset) {
    issues.push(issue('ASSET_UNKNOWN', `Scene "${scene.id}" references unknown asset "${scene.asset}"`, `scenes.${scene.id}`));
    return;
  }
  if (!(scene.clip in asset.clips)) {
    issues.push(
      issue('CLIP_UNKNOWN', `Clip "${scene.clip}" not found on asset "${scene.asset}"`, `scenes.${scene.id}`),
    );
  }
}

function validateTransition(scene: SceneDefinition, manifest: AssetManifest, issues: ValidationIssue[]) {
  const transition = scene.behavior?.transition;
  if (!transition) return;
  if (!SHADER_KINDS.includes(transition.kind)) {
    issues.push(issue('TRANSITION_KIND', `Unknown transition kind "${transition.kind}"`, `scenes.${scene.id}`));
  }
  for (const side of ['from', 'to'] as const) {
    const ref = transition[side];
    const asset = manifest.assets.find((entry) => entry.id === ref.asset);
    if (!asset) {
      issues.push(issue('TRANSITION_ASSET', `Transition ${side} asset "${ref.asset}" unknown`, `scenes.${scene.id}`));
      continue;
    }
    if (!(ref.clip in asset.clips)) {
      issues.push(
        issue('TRANSITION_CLIP', `Transition ${side} clip "${ref.clip}" unknown on "${ref.asset}"`, `scenes.${scene.id}`),
      );
    }
  }
}

function validateSequenceOverlap(chapter: ChapterDefinition, issues: ValidationIssue[]) {
  const sequences = chapter.scenes.filter(
    (scene) => scene.renderer === 'sequence' && scene.layer === 10,
  );
  const sorted = [...sequences].sort((a, b) => a.road.start - b.road.start);
  for (let index = 1; index < sorted.length; index += 1) {
    const prev = sorted[index - 1];
    const current = sorted[index];
    if (current.road.start < prev.road.end) {
      issues.push(
        issue(
          'SEQUENCE_OVERLAP',
          `Layer-10 sequence overlap "${prev.id}" and "${current.id}" in chapter "${chapter.id}"`,
          `chapters.${chapter.id}`,
        ),
      );
    }
    // Gaps are allowed when a DOM card or black hold covers the interval (e.g. trials-card).
  }
}

function validateChapterTimeline(chapter: ChapterDefinition, issues: ValidationIssue[]) {
  if (chapter.timeline.start !== 0) {
    issues.push(issue('TIMELINE_START', `Chapter "${chapter.id}" timeline must start at 0`, `chapters.${chapter.id}`));
  }
  const expectedEnd = chapter.scroll.screens * 100;
  if (chapter.timeline.end !== expectedEnd) {
    issues.push(
      issue(
        'TIMELINE_END',
        `Chapter "${chapter.id}" timeline.end ${chapter.timeline.end} != scroll.screens×100 (${expectedEnd})`,
        `chapters.${chapter.id}`,
      ),
    );
  }
  if (chapter.kind !== 'hub' && chapter.gate) {
    issues.push(issue('GATE_ON_LINEAR', `Non-hub chapter "${chapter.id}" must not define gate`, `chapters.${chapter.id}`));
  }
}

export function validateStory(
  config: StoryConfig,
  manifest: AssetManifest,
  options: ValidateStoryOptions = { registeredRenderers: REGISTERED_RENDERERS_PHASE0 },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const chapterIds = new Set<string>();
  const sceneIds = new Set<string>();

  for (const chapter of config.chapters) {
    if (chapterIds.has(chapter.id)) {
      issues.push(issue('DUPLICATE_CHAPTER', `Duplicate chapter id "${chapter.id}"`));
    }
    chapterIds.add(chapter.id);
    validateChapterTimeline(chapter, issues);
    validateSequenceOverlap(chapter, issues);

    for (const scene of chapter.scenes) {
      if (sceneIds.has(scene.id)) {
        issues.push(issue('DUPLICATE_SCENE', `Duplicate scene id "${scene.id}"`));
      }
      sceneIds.add(scene.id);
      validateSceneRoad(scene, chapter, issues);
      validateRenderer(scene, options, issues);
      validateClip(scene, manifest, issues);
      validateTransition(scene, manifest, issues);
    }
  }

  if (!chapterIds.has(config.flow.entry)) {
    issues.push(issue('FLOW_ENTRY', `flow.entry "${config.flow.entry}" not found`));
  }

  if (config.flow.order) {
    for (const chapterId of config.flow.order) {
      if (!chapterIds.has(chapterId)) {
        issues.push(issue('FLOW_ORDER', `flow.order references unknown chapter "${chapterId}"`));
      }
    }
  }

  return issues;
}

export function assertValidStory(
  config: StoryConfig,
  manifest: AssetManifest,
  options?: ValidateStoryOptions,
) {
  const issues = validateStory(config, manifest, options);
  if (issues.length > 0) {
    throw new Error(issues.map((item) => `[${item.code}] ${item.message}`).join('\n'));
  }
}

export { clamp01 };
