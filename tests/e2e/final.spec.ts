// Final-review fixes (I1, M2).
import { test, expect } from '@playwright/test';

test('I1: the tall 20221006 photo fills the lightbox stage in its true 1600:3552 shape (390x844)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const fig = page.locator('.polaroid[data-media-id="20221006"]');
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await fig.locator('.polaroid__open').click();
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const img = document.querySelector('.lightbox__img') as HTMLElement;
    const st = document.querySelector('.lightbox__stage') as HTMLElement;
    const cs = getComputedStyle(st);
    const b = img.getBoundingClientRect();
    return { ratio: b.width / b.height, h: b.height, avail: st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) };
  });
  expect(Math.abs(r.ratio / (1600 / 3552) - 1)).toBeLessThan(0.02);
  expect(r.h).toBeGreaterThanOrEqual(r.avail * 0.9);
});

test('I1: opening 20221006 animates with a uniform scale (no stretch in flight)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const fig = page.locator('.polaroid[data-media-id="20221006"]');
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await fig.locator('.polaroid__open').click();
  const kf = await page.evaluate(() => {
    const img = document.querySelector('.lightbox__img') as HTMLElement;
    const a = img.getAnimations().find((x) => (x as CSSAnimation & { effect: KeyframeEffect }).effect?.getKeyframes().some((k) => 'transform' in k));
    const k = (a as Animation & { effect: KeyframeEffect }).effect.getKeyframes()[0].transform as string;
    return k;
  });
  const m = kf.match(/scale\(([-\d.e]+)(?:,\s*([-\d.e]+))?\)/)!;
  const sx = parseFloat(m[1]);
  const sy = m[2] === undefined ? sx : parseFloat(m[2]);
  expect(Math.abs(sx / sy - 1)).toBeLessThan(0.001);
});
