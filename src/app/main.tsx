import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { assetsManifest } from '../config/assets.manifest';
import { getTotalScreens, storyConfig } from '../config/story.config';
import { contentRegistry } from '../content/registry';
import { ChapterRuntime } from '../core/ChapterRuntime';
import {
  DebugProgressSource,
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
import '../styles/app.css';

assertValidStory(storyConfig, assetsManifest, { registeredRenderers: ['dom', 'sequence'] });

registerRenderer('dom', () => new DomRenderer());

const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';

function App() {
  const director = useMemo(() => new StoryDirector(storyConfig), []);
  const runtime = useMemo(() => new ChapterRuntime(), []);
  const scrollSource = useMemo(() => new ScrollProgressSource(), []);
  const debugSource = useMemo(() => new DebugProgressSource(), []);
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
    const source = debugMode ? debugSource : scrollSource;
    source.start((progress) => {
      setFrame(director.fromProgress(progress, source.kind));
    });
    requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
    return () => {
      source.stop();
      runtime.destroy();
    };
  }, [debugSource, director, runtime, scrollSource]);

  const totalScreens = getTotalScreens();

  const seekToProgress = (progress: number) => {
    if (debugMode) {
      debugSource.setProgress(progress);
      return;
    }
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
