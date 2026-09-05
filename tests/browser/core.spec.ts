import { expect, test } from '@playwright/test';

test('forty physical screens, chapter navigation and real scroll agree', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?debug=1');
  await expect(page.locator('.dev-road-panel')).toBeVisible();
  expect(await page.evaluate(() => (document.documentElement.scrollHeight - innerHeight) / innerHeight)).toBe(40);
  for (const chapter of ['origin', 'ithaca', 'trials', 'homeward', 'stinger']) {
    await page.getByRole('button', { name: `Jump to ${chapter}`, exact: true }).click();
    await expect(page.locator('.dev-road-panel dd').nth(0)).toHaveText(chapter);
    await expect(page.locator('.dev-road-panel dd').nth(1)).toHaveText('0.00');
  }
  await page.mouse.move(640, 360);
  await page.mouse.wheel(0, 720);
  await expect.poll(async () => Number(await page.locator('.dev-road-panel dd').nth(1).textContent())).toBeGreaterThan(90);
  await page.locator('body').click({position:{x:600,y:80}});
  await page.keyboard.press('End');
  await expect(page.locator('.dev-road-panel dd').nth(1)).toHaveText('500.00');
  await page.keyboard.press('Home');
  await expect(page.locator('.dev-road-panel dd').nth(0)).toHaveText('origin');
  await expect(page.locator('.dev-road-panel dd').nth(1)).toHaveText('0.00');
  expect(errors).toEqual([]);
});

test('all five DOM scenes remain outside the subtitle safety zone', async ({ page }) => {
  await page.goto('/?debug=1');
  for (const [progress, scene] of [[.15,'origin-captions'],[.188,'ithaca-card'],[.48,'trials-card'],[.905,'stinger-title'],[.995,'stinger-outro']] as const) {
    await page.evaluate(progress => window.scrollTo(0,progress*(document.documentElement.scrollHeight-innerHeight)),progress);
    const panel=page.locator(`[data-scene-id="${scene}"]`);
    await expect(panel).toBeVisible();
    expect(await panel.locator('p').evaluateAll(lines => lines.every(line=>line.getBoundingClientRect().bottom<=innerHeight*.88))).toBe(true);
    await expect(panel.locator('p').first()).toHaveCSS('opacity','1');
  }
});
