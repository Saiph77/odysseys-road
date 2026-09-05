import { useEffect, useMemo, useState } from 'react';
import { assetsManifest } from '../config/assets.manifest';
import { getTotalScreens, storyConfig } from '../config/story.config';
import { contentRegistry } from '../content/registry';
import { ChapterRuntime } from '../core/ChapterRuntime';
import {
  ScrollProgressSource,
  scrollToProgress,
} from '../core/ProgressSource';
import { StoryDirector } from '../core/StoryDirector';
import { assertValidStory } from '../core/validateStory';
import { DevRoadPanel, ChapterNav } from '../components/DevRoadPanel';
import { RendererStage } from '../components/RendererStage';
import { DomRenderer } from '../renderers/DomRenderer';
import { NullAudioBus, registerRenderer } from '../renderers/rendererRegistry';
import { progressForChapterRoad } from '../core/StoryDirector';

assertValidStory(storyConfig, assetsManifest, { registeredRenderers: ['dom', 'sequence'] });

registerRenderer('dom', () => new DomRenderer());

const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';

export function App() {
  const director = useMemo(() => new StoryDirector(storyConfig), []);
  const runtime = useMemo(() => new ChapterRuntime(), []);
  const scrollSource = useMemo(() => new ScrollProgressSource(), []);
  const [frame, setFrame] = useState(() => director.fromProgress(0));

  const rendererContext = useMemo(
    () => ({
      assets: assetsManifest,
      content: contentRegistry,
      latch: runtime.latch,
      audio: new NullAudioBus(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }),
    [runtime],
  );

  useEffect(() => {
    runtime.mount();
    scrollSource.start((progress) => {
      setFrame(director.fromProgress(progress, scrollSource.kind));
    });
    return () => {
      scrollSource.stop();
      runtime.destroy();
    };
  }, [director, runtime, scrollSource]);

  const totalScreens = getTotalScreens();

  const seekToProgress = (progress: number) => {
    scrollToProgress(progress);
  };

  const seekChapter = (chapterId: string) => {
    const progress = progressForChapterRoad(storyConfig, chapterId, 0);
    seekToProgress(progress);
  };

  return (
    <>
      <div className="viewport">
        <RendererStage
          frame={frame}
          context={rendererContext}
          interaction={DomRenderer.neutralInteraction()}
        />
        {!debugMode ? (
          <ChapterNav
            config={storyConfig}
            activeChapterId={frame.chapterId}
            onSeekChapter={seekChapter}
          />
        ) : null}
      </div>
      <div className="stage" style={{ height: `${totalScreens * 100}vh` }} />
      {debugMode ? (
        <DevRoadPanel config={storyConfig} frame={frame} onSeek={seekToProgress} />
      ) : null}
    </>
  );
}
