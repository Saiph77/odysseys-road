import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { assetsManifest } from '../config/assets.manifest';
import { getTotalScreens, storyConfig } from '../config/story.config';
import { contentRegistry } from '../content/registry';
import { StorySession } from '../core/StorySession';
import { assertValidStory } from '../core/validateStory';
import { DevRoadPanel, ChapterNav } from '../components/DevRoadPanel';
import { RendererStage } from '../components/RendererStage';
import { DomRenderer } from '../renderers/DomRenderer';
import { SequencePlaceholder } from '../renderers/SequencePlaceholder';
import {
  NullAudioBus,
  registerRenderer,
  getRegisteredRendererKeys,
} from '../renderers/rendererRegistry';

registerRenderer('dom', () => new DomRenderer());
registerRenderer('sequence', () => new SequencePlaceholder());
assertValidStory(storyConfig, assetsManifest, { registeredRenderers: getRegisteredRendererKeys() });

const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';

function DebugView({ session }: { session: StorySession }) {
  const frame = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return (
    <DevRoadPanel
      config={storyConfig}
      frame={frame}
      onSeek={session.seek}
      manifest={assetsManifest}
    />
  );
}

export function App() {
  const session = useMemo(() => new StorySession(storyConfig), []);
  const [chapter, setChapter] = useState(session.getSnapshot().chapterId);
  const context = useMemo(
    () => ({
      assets: assetsManifest,
      content: contentRegistry,
      latch: session.runtime.latch,
      audio: new NullAudioBus(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }),
    [session],
  );
  useEffect(() => {
    let chapterId = session.getSnapshot().chapterId;
    const unsubscribe = session.subscribe(() => {
      const next = session.getSnapshot().chapterId;
      if (next !== chapterId) {
        chapterId = next;
        setChapter(next);
      }
    });
    session.start();
    return () => {
      unsubscribe();
      session.stop();
    };
  }, [session]);
  return (
    <>
      <div className="viewport">
        <RendererStage session={session} context={context} />
        <ChapterNav
          config={storyConfig}
          activeChapterId={chapter}
          onSeekChapter={session.seekChapter}
        />
      </div>
      <div className="stage" style={{ height: `calc(${getTotalScreens() * 100}vh + 100vh)` }} />
      {debugMode && <DebugView session={session} />}
    </>
  );
}
