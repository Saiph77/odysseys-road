import { expect, test } from '@playwright/test';

const chapters = [
  { id: 'origin', start: 0, screens: 7 },
  { id: 'ithaca', start: 7, screens: 10 },
  { id: 'trials', start: 17, screens: 9 },
  { id: 'homeward', start: 26, screens: 9 },
  { id: 'stinger', start: 35, screens: 5 },
];

test('fifteen hard-cut reference screenshots', async ({ page }) => {
  await page.goto('/?effects=off');
  for (const chapter of chapters)
    for (const fraction of [0.25, 0.5, 0.75]) {
      const progress = (chapter.start + fraction * chapter.screens) / 40;
      await page.evaluate(
        (progress) => scrollTo(0, progress * (document.documentElement.scrollHeight - innerHeight)),
        progress,
      );
      await expect
        .poll(() =>
          page
            .locator('.sequence-canvas')
            .evaluateAll(
              (canvases) =>
                canvases.length === 0 ||
                canvases.every(
                  (canvas) =>
                    canvas.getAttribute('data-exact') === 'true' ||
                    getComputedStyle(canvas).opacity === '0',
                ),
            ),
        )
        .toBe(true);
      await expect(page).toHaveScreenshot(`${chapter.id}-${fraction}.png`, {
        maxDiffPixelRatio: 0.001,
      });
    }
});

test('2D fallback scrubs every chapter and retains images while flinging', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?renderer=2d&debug=1');
  for (const chapter of chapters) {
    await page.getByRole('button', { name: `Jump to ${chapter.id}`, exact: true }).click();
    await page.evaluate(
      (progress) => scrollTo(0, progress * (document.documentElement.scrollHeight - innerHeight)),
      (chapter.start + chapter.screens * 0.5) / 40,
    );
    await expect(
      page.locator('canvas[data-renderer="2d"][data-ready="true"]').first(),
    ).toBeVisible();
  }
  for (const progress of [0.12, 0.8, 0.3, 0.98, 0.01])
    await page.evaluate(
      (progress) => scrollTo(0, progress * (document.documentElement.scrollHeight - innerHeight)),
      progress,
    );
  await expect(page.locator('canvas[data-renderer="2d"][data-ready="true"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});
