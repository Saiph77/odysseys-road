import { describe, expect, it } from 'vitest';
import { ChapterRuntime } from '../../src/core/ChapterRuntime';

describe('ChapterRuntime latch lifetime', () => {
  it('fires each event once between mount and destroy', () => {
    const runtime = new ChapterRuntime();
    runtime.mount();
    expect(runtime.latch('burn')).toBe(true);
    expect(runtime.latch('burn')).toBe(false);
    expect(runtime.latch('ring')).toBe(true);
    runtime.destroy();
    runtime.mount();
    expect(runtime.latch('burn')).toBe(true);
  });

  it('provides a bound latch without leaking across runtime instances', () => {
    const first = new ChapterRuntime();
    const second = new ChapterRuntime();
    const latch = first.latch;
    expect(latch('event')).toBe(true);
    expect(latch('event')).toBe(false);
    expect(second.latch('event')).toBe(true);
  });
});
