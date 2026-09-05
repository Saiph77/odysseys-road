import { ChapterRuntime } from './ChapterRuntime';
import { ScrollProgressSource, scrollToProgress } from './ProgressSource';
import { StoryDirector, progressForChapterRoad } from './StoryDirector';
import type { DirectorFrame, StoryConfig } from './contracts';

export class StorySession {
  readonly runtime = new ChapterRuntime();
  private readonly source = new ScrollProgressSource();
  private readonly director: StoryDirector;
  private readonly listeners = new Set<() => void>();
  private frame: DirectorFrame;

  constructor(readonly config: StoryConfig) {
    this.director = new StoryDirector(config);
    this.frame = this.director.fromProgress(0);
  }

  getSnapshot = () => this.frame;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  start() {
    this.runtime.mount();
    this.source.start((progress) => {
      const next = this.director.fromProgress(progress);
      if (next.chapterId !== this.frame.chapterId) {
        this.runtime.destroy();
        this.runtime.mount();
      }
      this.frame = next;
      this.listeners.forEach((listener) => listener());
    });
  }

  stop() {
    this.source.stop();
    this.runtime.destroy();
  }

  seek = (progress: number) => scrollToProgress(progress);
  seekChapter = (chapterId: string) => this.seek(progressForChapterRoad(this.config, chapterId, 0));
}
