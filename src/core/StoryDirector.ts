import type { ProgressSourceKind, StoryConfig } from './contracts';
import { SceneRegistry } from './SceneRegistry';
import { clamp01 } from './validateStory';

type ChapterSlice = Readonly<{
  chapterId: string;
  progressStart: number;
  progressEnd: number;
  timelineEnd: number;
}>;

function buildChapterSlices(config: StoryConfig): ChapterSlice[] {
  const order = config.flow.order ?? config.chapters.map((chapter) => chapter.id);
  const totalScreens = config.chapters.reduce((sum, chapter) => sum + chapter.scroll.screens, 0);
  let accumulated = 0;

  return order.map((chapterId) => {
    const chapter = config.chapters.find((item) => item.id === chapterId);
    if (!chapter) {
      throw new Error(`Unknown chapter in flow.order: ${chapterId}`);
    }
    const slice: ChapterSlice = {
      chapterId,
      progressStart: accumulated / totalScreens,
      progressEnd: (accumulated + chapter.scroll.screens) / totalScreens,
      timelineEnd: chapter.timeline.end,
    };
    accumulated += chapter.scroll.screens;
    return slice;
  });
}

export class StoryDirector {
  private readonly slices: ChapterSlice[];

  constructor(
    private readonly config: StoryConfig,
    private readonly registry = new SceneRegistry(),
  ) {
    this.slices = buildChapterSlices(config);
  }

  fromProgress(rawProgress: number, source: ProgressSourceKind = 'scroll') {
    const progress = clamp01(rawProgress);
    const slice =
      this.slices.find((item, index) =>
        index === this.slices.length - 1 ? true : progress < item.progressEnd,
      ) ?? this.slices[this.slices.length - 1];

    const span = slice.progressEnd - slice.progressStart;
    const localProgress = span > 0 ? clamp01((progress - slice.progressStart) / span) : 0;
    const road = localProgress * slice.timelineEnd;
    return this.fromRoad(slice.chapterId, road, source);
  }

  fromRoad(chapterId: string, road: number, source: ProgressSourceKind = 'scroll') {
    const chapter = this.config.chapters.find((item) => item.id === chapterId);
    if (!chapter) {
      throw new Error(`Unknown chapter: ${chapterId}`);
    }
    const clampedRoad = Math.min(chapter.timeline.end, Math.max(chapter.timeline.start, road));
    return {
      chapterId,
      road: clampedRoad,
      source,
      activeScenes: this.registry.resolve(chapter, clampedRoad),
    };
  }

  getChapterSlices() {
    return this.slices;
  }
}

export function progressForChapterRoad(
  config: StoryConfig,
  chapterId: string,
  road: number,
): number {
  const director = new StoryDirector(config);
  const slice = director.getChapterSlices().find((item) => item.chapterId === chapterId);
  if (!slice) return 0;
  const chapter = config.chapters.find((item) => item.id === chapterId);
  if (!chapter) return 0;
  const localProgress = chapter.timeline.end > 0 ? clamp01(road / chapter.timeline.end) : 0;
  return slice.progressStart + localProgress * (slice.progressEnd - slice.progressStart);
}
