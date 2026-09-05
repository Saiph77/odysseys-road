import type {
  AssetManifest,
  ChapterDefinition,
  SceneDefinition,
  StoryConfig,
  ValidateStoryOptions,
  ValidationIssue,
} from './contracts';
import { REGISTERED_RENDERERS_PHASE0 } from './contracts';
import { behaviorOf } from './behavior';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function issue(code: string, message: string, path?: string): ValidationIssue {
  return { code, message, path };
}

function sceneSpan(scene: SceneDefinition) {
  return scene.road.end - scene.road.start;
}

function validateSceneRoad(
  scene: SceneDefinition,
  chapter: ChapterDefinition,
  issues: ValidationIssue[],
) {
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
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    issues.push(
      issue(
        'ROAD_INVALID',
        `Scene "${scene.id}" has non-positive span`,
        `chapters.${chapter.id}.scenes.${scene.id}`,
      ),
    );
  }
  if (
    !Number.isFinite(scene.blend.in) ||
    !Number.isFinite(scene.blend.out) ||
    scene.blend.in < 0 ||
    scene.blend.out < 0
  ) {
    issues.push(
      issue(
        'BLEND_NEGATIVE',
        `Scene "${scene.id}" has negative blend`,
        `chapters.${chapter.id}.scenes.${scene.id}`,
      ),
    );
  }
  if (scene.blend.in + scene.blend.out > sceneSpan(scene)) {
    issues.push(
      issue(
        'BLEND_TOO_LONG',
        `Scene "${scene.id}" blend exceeds span`,
        `chapters.${chapter.id}.scenes.${scene.id}`,
      ),
    );
  }
}

function validateRenderer(
  scene: SceneDefinition,
  options: ValidateStoryOptions,
  issues: ValidationIssue[],
) {
  if (
    !options.registeredRenderers.includes(
      scene.renderer as (typeof options.registeredRenderers)[number],
    )
  ) {
    issues.push(
      issue(
        'RENDERER_UNREGISTERED',
        `Renderer "${scene.renderer}" is not registered`,
        `scenes.${scene.id}`,
      ),
    );
  }
  if (scene.renderer === 'sequence' && !scene.asset && !behaviorOf(scene).transition) {
    issues.push(
      issue('ASSET_MISSING', `Sequence scene "${scene.id}" missing asset`, `scenes.${scene.id}`),
    );
  }
}

function validateClip(scene: SceneDefinition, manifest: AssetManifest, issues: ValidationIssue[]) {
  if (!scene.asset) {
    if (scene.clip)
      issues.push(
        issue(
          'CLIP_WITHOUT_ASSET',
          `Scene "${scene.id}" has clip but no asset`,
          `scenes.${scene.id}`,
        ),
      );
    return;
  }
  const asset = manifest.assets.find((entry) => entry.id === scene.asset);
  if (!asset) {
    issues.push(
      issue(
        'ASSET_UNKNOWN',
        `Scene "${scene.id}" references unknown asset "${scene.asset}"`,
        `scenes.${scene.id}`,
      ),
    );
    return;
  }
  if (scene.clip && !Object.hasOwn(asset.clips, scene.clip)) {
    issues.push(
      issue(
        'CLIP_UNKNOWN',
        `Clip "${scene.clip}" not found on asset "${scene.asset}"`,
        `scenes.${scene.id}`,
      ),
    );
  }
}

function validateTransition(
  scene: SceneDefinition,
  manifest: AssetManifest,
  issues: ValidationIssue[],
) {
  const treatment = behaviorOf(scene).treatment;
  if (treatment && !['memory', 'zoom'].includes(treatment.kind)) {
    issues.push(
      issue('TREATMENT_KIND', `Unknown treatment kind "${treatment.kind}"`, `scenes.${scene.id}`),
    );
  }
  const transition = behaviorOf(scene).transition;
  if (!transition) return;
  if (!['burn', 'ring'].includes(transition.kind)) {
    issues.push(
      issue(
        'TRANSITION_KIND',
        `Unknown transition kind "${transition.kind}"`,
        `scenes.${scene.id}`,
      ),
    );
  }
  for (const side of ['from', 'to'] as const) {
    const ref = transition[side];
    if (!ref || !['first', 'last'].includes(ref.frame)) {
      issues.push(
        issue('TRANSITION_REF', `Invalid transition ${side} frame reference`, `scenes.${scene.id}`),
      );
      if (!ref) continue;
    }
    const asset = manifest.assets.find((entry) => entry.id === ref.asset);
    if (!asset) {
      issues.push(
        issue(
          'TRANSITION_ASSET',
          `Transition ${side} asset "${ref.asset}" unknown`,
          `scenes.${scene.id}`,
        ),
      );
      continue;
    }
    if (!Object.hasOwn(asset.clips, ref.clip)) {
      issues.push(
        issue(
          'TRANSITION_CLIP',
          `Transition ${side} clip "${ref.clip}" unknown on "${ref.asset}"`,
          `scenes.${scene.id}`,
        ),
      );
    }
  }
}

function validateSequenceOverlap(chapter: ChapterDefinition, issues: ValidationIssue[]) {
  const sequences = chapter.scenes.filter((scene) => scene.renderer === 'sequence');
  for (let index = 0; index < sequences.length; index += 1) {
    const current = sequences[index];
    for (const previous of sequences.slice(0, index)) {
      const transitionLayer =
        current.layer === 20 && behaviorOf(current).transition && behaviorOf(previous).transition;
      if (current.layer !== previous.layer || transitionLayer) continue;
      if (current.road.start >= previous.road.end || previous.road.start >= current.road.end)
        continue;
      issues.push(
        issue(
          'SEQUENCE_OVERLAP',
          `Layer-${current.layer} sequence overlap "${previous.id}" and "${current.id}" in chapter "${chapter.id}"`,
          `chapters.${chapter.id}`,
        ),
      );
    }
  }
}

function validateChapterTimeline(chapter: ChapterDefinition, issues: ValidationIssue[]) {
  if (!Number.isFinite(chapter.scroll.screens) || chapter.scroll.screens <= 0) {
    issues.push(
      issue('SCREENS_INVALID', `Chapter "${chapter.id}" screens must be positive and finite`),
    );
  }
  if (!Number.isFinite(chapter.timeline.end) || chapter.timeline.end <= chapter.timeline.start) {
    issues.push(
      issue(
        'TIMELINE_INVALID',
        `Chapter "${chapter.id}" timeline must have a finite positive span`,
      ),
    );
  }
  if (chapter.timeline.start !== 0) {
    issues.push(
      issue(
        'TIMELINE_START',
        `Chapter "${chapter.id}" timeline must start at 0`,
        `chapters.${chapter.id}`,
      ),
    );
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
    issues.push(
      issue(
        'GATE_ON_LINEAR',
        `Non-hub chapter "${chapter.id}" must not define gate`,
        `chapters.${chapter.id}`,
      ),
    );
  }
  if (chapter.kind === 'hub') {
    if (!chapter.gate) {
      issues.push(issue('GATE_MISSING', `Hub "${chapter.id}" requires a gate`));
    } else if (
      !Number.isFinite(chapter.gate.atRoad) ||
      chapter.gate.atRoad < chapter.timeline.start ||
      chapter.gate.atRoad > chapter.timeline.end
    ) {
      issues.push(issue('GATE_RANGE', `Hub "${chapter.id}" gate is outside its timeline`));
    }
  }
  let coveredUntil = chapter.timeline.start;
  for (const scene of [...chapter.scenes].sort(
    (first, second) => first.road.start - second.road.start,
  )) {
    if (scene.road.start > coveredUntil) {
      issues.push(
        issue(
          'TIMELINE_GAP',
          `Chapter "${chapter.id}" has uncovered Road before ${scene.road.start}`,
        ),
      );
    }
    coveredUntil = Math.max(coveredUntil, scene.road.end);
  }
  if (coveredUntil < chapter.timeline.end) {
    issues.push(issue('TIMELINE_GAP', `Chapter "${chapter.id}" has an uncovered timeline end`));
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
    if (config.flow.order.length === 0 || config.flow.order[0] !== config.flow.entry) {
      issues.push(issue('FLOW_ORDER_ENTRY', 'flow.order must begin with flow.entry'));
    }
    if (new Set(config.flow.order).size !== config.flow.order.length) {
      issues.push(issue('FLOW_ORDER_DUPLICATE', 'flow.order contains duplicate chapters'));
    }
    for (const chapterId of config.flow.order) {
      if (!chapterIds.has(chapterId)) {
        issues.push(issue('FLOW_ORDER', `flow.order references unknown chapter "${chapterId}"`));
      }
    }
  }

  const tracks = config.flow.tracks ?? {};
  for (const trackId of config.release.enabledTrackIds ?? []) {
    if (!Object.hasOwn(tracks, trackId)) {
      issues.push(issue('TRACK_ENABLED_UNKNOWN', `Enabled track "${trackId}" does not exist`));
    } else if (tracks[trackId].length === 0) {
      issues.push(issue('TRACK_EMPTY', `Enabled track "${trackId}" has no chapters`));
    }
  }
  if (
    config.release.defaultTrackId != null &&
    !Object.hasOwn(tracks, config.release.defaultTrackId)
  ) {
    issues.push(issue('TRACK_DEFAULT_UNKNOWN', 'Default track does not exist'));
  }
  if (config.release.placeholderChapterId && !chapterIds.has(config.release.placeholderChapterId)) {
    issues.push(issue('PLACEHOLDER_UNKNOWN', 'Placeholder chapter does not exist'));
  }
  for (const chapterId of [...Object.values(tracks).flat(), config.flow.hub, config.flow.finale]) {
    if (chapterId !== undefined && !chapterIds.has(chapterId)) {
      issues.push(issue('FLOW_REFERENCE', `Branch flow references unknown chapter "${chapterId}"`));
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
