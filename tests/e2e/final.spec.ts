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

// DESIGN-SYSTEM section 12: closing farewell print (owner request).
import copyFixture from '../fixtures/copy.json';

for (const w of [320, 390, 768, 1440, 1920]) {
  test(`farewell print sits left of closing text, side by side at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/');
    const print = page.locator('.farewell');
    const text = page.locator('[data-copy="closing-0"]');
    await text.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const a = (await print.boundingBox())!;
    const b = (await text.boundingBox())!;
    // use the untransformed layout box of the print so the -2deg tilt does not skew the check
    const pr = await print.evaluate((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right }; });
    expect(pr.r).toBeLessThanOrEqual(b.x + 0.5);
    expect(a.x).toBeLessThan(b.x);
    expect(Math.abs(a.y + a.height / 2 - (b.y + b.height / 2))).toBeLessThan(40);
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    expect(overlapX).toBeLessThanOrEqual(0.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test('farewell print is non-interactive and does not open the lightbox', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const print = page.locator('.farewell');
  await print.scrollIntoViewIfNeeded();
  await expect(print.locator('button, a, [tabindex], [data-media-id]')).toHaveCount(0);
  await expect(print).not.toHaveAttribute('data-media-id', /.*/);
  await print.locator('img').click({ force: true });
  await page.waitForTimeout(400);
  await expect(page.locator('dialog.lightbox')).not.toBeVisible();
  const img = print.locator('img');
  await expect(img).toHaveAttribute('alt', 'Eevee smiling up at the camera in the snowy woods');
  await expect(img).toHaveAttribute('loading', 'lazy');
  expect(await img.evaluate((e) => (e as HTMLElement).tabIndex)).toBe(-1);
});

test('closing-0 text is unchanged and left-aligned', async ({ page }) => {
  await page.goto('/');
  const el = page.locator('[data-copy="closing-0"]');
  expect((await el.textContent())!.replace(/\s+/g, ' ').trim()).toBe(copyFixture.closing[0]);
  expect(['left', 'start']).toContain(await el.evaluate((e) => getComputedStyle(e).textAlign));
});
