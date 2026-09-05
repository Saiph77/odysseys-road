import { useEffect, useRef } from 'react';
import type { RendererContext } from '../core/contracts';
import type { StorySession } from '../core/StorySession';
import { RendererHost } from '../core/RendererHost';

export function RendererStage({
  session,
  context,
}: {
  session: StorySession;
  context: RendererContext;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = new RendererHost(root.current!, context);
    const render = () => host.update(session.getSnapshot());
    const unsubscribe = session.subscribe(render);
    render();
    return () => {
      unsubscribe();
      host.destroy();
    };
  }, [session, context]);
  return <div ref={root} className="renderer-stage" />;
}
