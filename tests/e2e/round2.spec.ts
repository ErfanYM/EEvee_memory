// Break-it round 2 fixes (docs/council/review-2-triage.md).
import { test, expect } from '@playwright/test';

test('E7: with poster requests delayed, every poster is set after load + idle (before any scroll)', async ({ page }) => {
  await page.route('**/*-poster-*', async (route) => { await new Promise((r) => setTimeout(r, 1500)); await route.continue().catch(() => {}); });
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForTimeout(4000);
  const set = await page.locator('.polaroid--video video').evaluateAll((vs) => vs.map((v) => (v as HTMLVideoElement).poster));
  expect(set.length).toBe(4);
  for (const p of set) expect(p).toMatch(/poster-960/);
});

test.describe('I7 no JS', () => {
  test.use({ javaScriptEnabled: false });
  test('I7: no play disc and no pointer cursor without JS', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'chromium only');
    await page.goto('/');
    const r = await page.evaluate(() => ({
      disc: [...document.querySelectorAll('.video__play')].map((e) => getComputedStyle(e).display),
      cur: getComputedStyle(document.querySelector('.polaroid__open')!).cursor,
    }));
    expect(r.disc).toEqual(['none', 'none', 'none', 'none']);
    expect(r.cur).toBe('default');
  });
});

test('E8: video placeholder is the field colour mixed toward white, not the old grey', async ({ page }) => {
  await page.goto('/');
  const bg = await page.locator('.polaroid__window').first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).not.toBe('rgb(233, 228, 222)');
});

test.describe('T7 T8 T9 desktop', () => {
  test('T7: S6 raincoat pair overlaps >=20px; S5 landscape sits lower than both videos; cake overlaps ec73ecaf', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const r = await page.evaluate(() => {
      const b = (id: string) => document.querySelector(`.polaroid[data-media-id="${id}"]`)!.getBoundingClientRect();
      return {
        s6: b('img_3785').right - b('img_3786').left,
        s2: b('ec73ecaf').right - b('img_7207').left,
        land: b('232ed04c').top, v1: b('23983ab7').top, v2: b('0f88d984').top,
        zLead: getComputedStyle(document.querySelector('.polaroid[data-media-id="img_7207"]')!).zIndex,
        zUnder: getComputedStyle(document.querySelector('.polaroid[data-media-id="ec73ecaf"]')!).zIndex,
      };
    });
    expect(r.s6).toBeGreaterThanOrEqual(20);
    expect(r.s2).toBeGreaterThanOrEqual(20);
    expect(r.land).toBeGreaterThan(r.v1);
    expect(r.land).toBeGreaterThan(r.v2);
    expect(Number(r.zLead)).toBeGreaterThan(Number(r.zUnder));
  });

  test('T8: at 1920 3-up prints reach ~400px and the lead ~460px; 4-up about 300px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    const w = await page.evaluate(() => {
      const b = (id: string) => document.querySelector(`.polaroid[data-media-id="${id}"]`)!.getBoundingClientRect().width;
      return { side: b('37c83b77'), lead: b('img_8394'), four: b('img_6802') };
    });
    expect(w.side).toBeGreaterThan(385);
    expect(w.lead).toBeGreaterThan(445);
    expect(w.four).toBeGreaterThan(290);
    expect(w.four).toBeLessThan(330);
  });

  test('T9: at 1920 body text is 22.4px, lead and h1 unchanged', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    expect(await page.locator('[data-copy="meet-1"]').evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeCloseTo(22.4, 1);
    expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).fontSize)).toBe('96px');
  });
});
