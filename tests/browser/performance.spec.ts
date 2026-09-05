import { test, expect, chromium } from '@playwright/test';

test('records an origin ten-second scroll profile', async ({ page }, testInfo) => {
  await page.goto('/?effects=off');
  await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();
  const metrics = await page.evaluate(
    () =>
      new Promise<{ longTasks: number[]; heap: number | null }>((resolve) => {
        const longTasks: number[] = [];
        const observer = new PerformanceObserver((list) =>
          longTasks.push(...list.getEntries().map((entry) => entry.duration)),
        );
        observer.observe({ entryTypes: ['longtask'] });
        const start = performance.now();
        const scroll = (now: number) => {
          const fraction = Math.min(1, (now - start) / 10000);
          scrollTo(0, fraction * 7 * innerHeight);
          if (fraction < 1) requestAnimationFrame(scroll);
          else {
            observer.disconnect();
            const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } })
              .memory;
            resolve({ longTasks, heap: memory?.usedJSHeapSize ?? null });
          }
        };
        requestAnimationFrame(scroll);
      }),
  );
  await testInfo.attach('origin-performance.json', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  console.log('Origin profile', JSON.stringify(metrics));
  expect(metrics.heap ?? 0).toBeLessThan(300 * 1024 * 1024);
  expect(metrics.longTasks).toHaveLength(0);
});

test('true unavailable WebGL still permits complete navigation', async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto('http://127.0.0.1:4317/?debug=1');
    await expect(page.locator('canvas[data-renderer="2d"][data-ready="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Jump to stinger', exact: true }).click();
    await page.keyboard.press('End');
    await expect(page.locator('.dev-road-panel dd').nth(1)).toHaveText('500.00');
  } finally {
    await browser.close();
  }
});
