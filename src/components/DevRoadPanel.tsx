import { useMemo, useState } from 'react';
import type { DirectorFrame, StoryConfig } from '../core/contracts';
import { progressForChapterRoad } from '../core/StoryDirector';
import { scrollToProgress } from '../core/ProgressSource';

export function DevRoadPanel({
  config,
  frame,
  onSeek,
}: {
  config: StoryConfig;
  frame: DirectorFrame;
  onSeek: (progress: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const chapters = useMemo(() => config.flow.order ?? [], [config.flow.order]);

  const globalProgress = useMemo(() => {
    return progressForChapterRoad(config, frame.chapterId, frame.road);
  }, [config, frame.chapterId, frame.road]);

  return (
    <aside className="dev-road-panel" aria-label="Road debug panel">
      <h2>Road</h2>
      <dl>
        <div>
          <dt>chapter</dt>
          <dd>{frame.chapterId}</dd>
        </div>
        <div>
          <dt>road</dt>
          <dd>{frame.road.toFixed(2)}</dd>
        </div>
        <div>
          <dt>progress</dt>
          <dd>{(globalProgress * 100).toFixed(2)}%</dd>
        </div>
        <div>
          <dt>activeScenes</dt>
          <dd>{frame.activeScenes.map((scene) => scene.sceneId).join(', ') || '—'}</dd>
        </div>
      </dl>

      <label className="dev-road-panel__slider">
        Seek
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(globalProgress * 1000)}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onChange={(event) => {
            const next = Number(event.target.value) / 1000;
            onSeek(next);
            scrollToProgress(next);
          }}
        />
      </label>

      <nav className="dev-road-panel__chapters" aria-label="Chapter seek">
        {chapters.map((chapterId) => (
          <button
            key={chapterId}
            type="button"
            className={chapterId === frame.chapterId ? 'is-active' : undefined}
            onClick={() => {
              const progress = progressForChapterRoad(config, chapterId, 0);
              onSeek(progress);
              scrollToProgress(progress);
            }}
          >
            {chapterId}
          </button>
        ))}
      </nav>

      {dragging ? <p className="dev-road-panel__hint">Dragging seek…</p> : null}
    </aside>
  );
}

export function ChapterNav({
  config,
  activeChapterId,
  onSeekChapter,
}: {
  config: StoryConfig;
  activeChapterId: string;
  onSeekChapter: (chapterId: string) => void;
}) {
  const chapters = config.flow.order ?? [];
  return (
    <nav className="chapter-nav" aria-label="Chapters">
      {chapters.map((chapterId) => (
        <button
          key={chapterId}
          type="button"
          className={chapterId === activeChapterId ? 'is-active' : undefined}
          aria-label={`Jump to ${chapterId}`}
          aria-current={chapterId === activeChapterId ? 'step' : undefined}
          onClick={() => onSeekChapter(chapterId)}
        >
          {chapterId}
        </button>
      ))}
    </nav>
  );
}
