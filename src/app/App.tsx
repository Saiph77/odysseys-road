import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { assetsManifest } from '../config/assets.manifest';
import { getTotalScreens, storyConfig } from '../config/story.config';
import { contentRegistry } from '../content/registry';
import { StorySession } from '../core/StorySession';
import { assertValidStory } from '../core/validateStory';
import { DevRoadPanel, ChapterNav } from '../components/DevRoadPanel';
import { RendererStage } from '../components/RendererStage';
import { BootHint } from '../components/BootHint';
import { DomRenderer } from '../renderers/DomRenderer';
import { FrameStore } from '../renderers/sequence/FrameStore';
import { renderingCapabilities } from '../capabilities/webgl';
import { sequenceFactory } from '../renderers/rendererRegistry';
import {
  NullAudioBus,
  registerRenderer,
  getRegisteredRendererKeys,
} from '../renderers/rendererRegistry';

registerRenderer('dom', () => new DomRenderer());
const capabilities = renderingCapabilities();
const frames = new FrameStore();
registerRenderer('sequence', () => sequenceFactory(frames, capabilities));
if (import.meta.hot) import.meta.hot.dispose(() => frames.destroy());
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
      reducedMotion: capabilities.reducedMotion,
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
        <img className="boot" src={assetsManifest.assets[0].poster} alt="" decoding="async" />
        <RendererStage session={session} context={context} />
        <BootHint session={session} />
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
