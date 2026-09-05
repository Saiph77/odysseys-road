/**
 * Cross-layer DTOs and interfaces — single source of truth (ARCHITECTURE §5.1 + V2 §7.1).
 */

export type ProgressSourceKind = 'scroll' | 'autopilot' | 'debug';

export interface ProgressSource {
  readonly kind: ProgressSourceKind;
  start(publish: (rawProgress: number) => void): void;
  stop(): void;
}

export interface ScrollGate {
  lock(atProgress: number): void;
  unlock(): void;
  clamp(rawProgress: number): number;
}

export type RendererKey = 'sequence' | 'dom';

export type SceneRendererKey = RendererKey | 'mirrors' | 'video' | 'shader';

export type TransitionFrameRef = Readonly<{
  asset: string;
  clip: string;
  frame: 'first' | 'last';
}>;

export type SceneBehavior = Readonly<{
  treatment?: Readonly<{
    kind: 'memory' | 'zoom';
    ramp?: number;
    from?: number;
    to?: number;
  }>;
  transition?: Readonly<{
    kind: 'burn' | 'ring';
    from: TransitionFrameRef;
    to: TransitionFrameRef;
    intensity?: 1 | 2 | 3;
  }>;
  scrub?: Readonly<{ from: number; to: number }>;
}>;

export type SceneDefinition = Readonly<{
  id: string;
  road: Readonly<{ start: number; end: number }>;
  blend: Readonly<{ in: number; out: number }>;
  layer: number;
  renderer: SceneRendererKey;
  asset?: string;
  clip?: string;
  behavior?: SceneBehavior;
}>;

export type ChapterKind = 'linear' | 'hub' | 'track' | 'finale' | 'placeholder';

export type ChapterDefinition = Readonly<{
  id: string;
  kind: ChapterKind;
  timeline: Readonly<{ start: number; end: number }>;
  scroll: Readonly<{ screens: number }>;
  gate?: Readonly<{ atRoad: number }>;
  scenes: readonly SceneDefinition[];
}>;

export type LinearFlow = Readonly<{
  entry: string;
  order: readonly string[];
}>;

export type BranchFlow = Readonly<{
  entry: string;
  hub?: string;
  tracks?: Readonly<Record<string, readonly string[]>>;
  finale?: string;
}>;

export type StoryFlow = LinearFlow & Partial<BranchFlow>;

export type StoryRelease = Readonly<{
  id: string;
  targetDurationSeconds?: number;
  enabledTrackIds?: readonly string[];
  defaultTrackId?: string | null;
  disabledChoiceBehavior?: string;
  placeholderChapterId?: string;
}>;

export type StoryConfig = Readonly<{
  release: StoryRelease;
  flow: StoryFlow;
  chapters: readonly ChapterDefinition[];
}>;

export type SceneFrame = Readonly<{
  sceneId: string;
  renderer: SceneRendererKey;
  localProgress: number;
  opacity: number;
  layer: number;
  asset?: string;
  clip?: string;
  behavior?: SceneBehavior;
}>;

export type DirectorFrame = Readonly<{
  chapterId: string;
  road: number;
  source: ProgressSourceKind;
  activeScenes: readonly SceneFrame[];
}>;

export interface StoryDirector {
  fromProgress(rawProgress: number, source?: ProgressSourceKind): DirectorFrame;
  fromRoad(chapterId: string, road: number, source?: ProgressSourceKind): DirectorFrame;
}

export type InteractionFrame = Readonly<{
  x: number;
  y: number;
  z: number;
  yaw: number;
  focusX: number;
  confidence: number;
  detected: boolean;
  source: 'pointer' | 'keyboard' | 'head';
  timestamp: number;
}>;

export interface InteractionProvider {
  readonly source: InteractionFrame['source'];
  start(publish: (sample: InteractionFrame) => void, confirm: () => void): Promise<void> | void;
  stop(): void;
}

export type AssetClip = Readonly<{
  from: number;
  to: number;
  origin?: readonly [number, number];
}>;

export type AssetManifestEntry = Readonly<{
  id: string;
  path: string;
  frameCount: number;
  fps: number;
  width: number;
  height: number;
  poster?: string;
  clips: Readonly<Record<string, AssetClip>>;
}>;

export type AssetManifest = Readonly<{
  assets: readonly AssetManifestEntry[];
}>;

export type DomContentEntry = Readonly<{
  lines: readonly string[];
  align?: 'center' | 'start';
  variant?: 'chapter' | 'title' | 'outro';
}>;

export type ContentRegistry = Readonly<Record<string, DomContentEntry>>;

export interface AudioBus {
  load(stemId: string): Promise<void>;
  play(stemIds: readonly string[], opts?: { syncAt?: number; loop?: boolean }): void;
  setMix(params: Readonly<Record<string, number>>): void;
  stop(stemIds?: readonly string[]): void;
}

export type RendererContext = Readonly<{
  assets: AssetManifest;
  content: ContentRegistry;
  latch: (id: string) => boolean;
  audio: AudioBus;
  reducedMotion: boolean;
}>;

export interface SceneRenderer {
  mount(host: HTMLElement, context: RendererContext): void | Promise<void>;
  update(scene: SceneFrame, interaction: InteractionFrame): void;
  destroy(): void;
}

export type ValidationIssue = Readonly<{
  code: string;
  message: string;
  path?: string;
}>;

export type ValidateStoryOptions = Readonly<{
  registeredRenderers: readonly RendererKey[];
}>;

export const REGISTERED_RENDERERS_PHASE0: readonly RendererKey[] = ['dom'];

export const SHADER_KINDS = ['memory', 'burn', 'ring'] as const;
