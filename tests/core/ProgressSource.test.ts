import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollProgressSource, scrollToProgress } from '../../src/core/ProgressSource';

describe('ScrollProgressSource', () => {
  let browser: EventTarget & {
    innerHeight: number;
    scrollY: number;
    requestAnimationFrame: ReturnType<typeof vi.fn>;
    cancelAnimationFrame: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
  };
  let scheduled: FrameRequestCallback | null;

  beforeEach(() => {
    scheduled = null;
    browser = Object.assign(new EventTarget(), {
      innerHeight: 720,
      scrollY: 0,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        scheduled = callback;
        return 1;
      }),
      cancelAnimationFrame: vi.fn(() => {
        scheduled = null;
      }),
      scrollTo: vi.fn(),
    });
    vi.stubGlobal('window', browser);
    vi.stubGlobal('document', { querySelector: () => ({ scrollHeight: 28800 }) });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('publishes the restored scroll position immediately', () => {
    browser.scrollY = (28800 - 720) / 2;
    const publish = vi.fn();
    const source = new ScrollProgressSource();
    source.start(publish);
    expect(publish).toHaveBeenCalledWith(0.5);
    source.stop();
  });

  it('coalesces wheel and resize notifications and uses the newest position', () => {
    const publish = vi.fn();
    const source = new ScrollProgressSource();
    source.start(publish);
    browser.dispatchEvent(new Event('scroll'));
    browser.scrollY = 28800 - 720;
    browser.dispatchEvent(new Event('scroll'));
    browser.dispatchEvent(new Event('resize'));
    expect(browser.requestAnimationFrame).toHaveBeenCalledTimes(1);
    scheduled!(0);
    expect(publish.mock.calls).toEqual([[0], [1]]);
    source.stop();
  });

  it('cancels pending work and removes listeners on stop and restart', () => {
    const publish = vi.fn();
    const source = new ScrollProgressSource();
    source.start(publish);
    browser.dispatchEvent(new Event('scroll'));
    source.stop();
    expect(browser.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(scheduled).toBeNull();
    browser.dispatchEvent(new Event('scroll'));
    expect(browser.requestAnimationFrame).toHaveBeenCalledTimes(1);
    source.start(publish);
    source.start(publish);
    browser.dispatchEvent(new Event('scroll'));
    expect(browser.requestAnimationFrame).toHaveBeenCalledTimes(2);
    source.stop();
  });

  it.each([
    [-1, 0],
    [0.5, 14040],
    [2, 28080],
  ])('seeks through the inverse mapping: %s', (progress, top) => {
    scrollToProgress(progress);
    expect(browser.scrollTo).toHaveBeenCalledWith({ top, behavior: 'auto' });
  });

  it('preserves exact seek intent across CSS pixel quantization, then resumes real scrolling', () => {
    vi.stubGlobal('document', { querySelector: () => ({ scrollHeight: 26182 }) });
    browser.innerHeight = 654;
    browser.scrollTo.mockImplementation(({ top }: { top: number }) => {
      browser.scrollY = top - 0.02;
    });
    const publish = vi.fn();
    const source = new ScrollProgressSource();
    source.start(publish);
    scrollToProgress(0.65);
    browser.dispatchEvent(new Event('scroll'));
    scheduled!(0);
    expect(publish).toHaveBeenLastCalledWith(0.65);
    browser.scrollY -= 10;
    browser.dispatchEvent(new Event('scroll'));
    scheduled!(0);
    expect(publish).toHaveBeenLastCalledWith(browser.scrollY / (26182 - 654));
    source.stop();
  });
});
