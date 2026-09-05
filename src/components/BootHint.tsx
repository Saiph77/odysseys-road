import { useEffect, useRef } from 'react';
import type { StorySession } from '../core/StorySession';

export function BootHint({ session }: { session: StorySession }) {
  const hint = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const update = () => {
      const frame = session.getSnapshot();
      hint.current!.hidden = frame.chapterId !== session.config.flow.entry || frame.road > 0;
    };
    update();
    return session.subscribe(update);
  }, [session]);
  return (
    <p ref={hint} className="boot-hint">
      向下滚动 <span aria-hidden="true">↓</span>
    </p>
  );
}
