import { test, expect, Page } from '@playwright/test';

test.beforeEach(({ browserName }, info) => {
  test.skip(!['chromium', 'webkit'].includes(browserName) || info.project.name === 'mobile-chrome',
    'video tests run on chromium, webkit, mobile-safari');
});

const fig = (page: Page, n: number) => page.locator('.polaroid--video').nth(n);
const vid = (page: Page, n: number) => fig(page, n).locator('video');
const btn = (page: Page, n: number) => fig(page, n).locator('.video__play');

async function tap(page: Page, n: number) {
  await fig(page, n).scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900))); // let reveal settle
  await btn(page, n).click();
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('no autoplay/muted attributes, preload none, readyState 0 before interaction', async ({ page }) => {
  const info = await page.locator('video').evaluateAll((vs: HTMLVideoElement[]) => vs.map((v) => ({
    autoplay: v.hasAttribute('autoplay'), muted: v.hasAttribute('muted'), rs: v.readyState, pre: v.getAttribute('preload'),
  })));
  expect(info.length).toBe(4);
  for (const i of info) expect(i).toEqual({ autoplay: false, muted: false, rs: 0, pre: 'none' });
});

test('tap plays with sound', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  const s = await vid(page, 0).evaluate((v: HTMLVideoElement) => ({ muted: v.muted, volume: v.volume, controls: v.controls }));
  expect(s.muted).toBe(false);
  expect(s.volume).toBeGreaterThan(0);
  expect(s.controls).toBe(true);
  await expect(btn(page, 0)).toBeHidden();
});

test('only one plays', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await tap(page, 1);
  await expect.poll(() => vid(page, 1).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(btn(page, 0)).toBeVisible();
});

test('ended resets to poster state', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused && v.readyState > 1)).toBe(true);
  await vid(page, 0).evaluate((v: HTMLVideoElement) => { v.currentTime = v.duration - 0.1; });
  await expect(btn(page, 0)).toBeVisible({ timeout: 8000 });
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => v.controls)).toBe(false);
  await expect(fig(page, 0)).not.toHaveClass(/is-playing/);
});

test('keyboard Enter plays', async ({ page }) => {
  await fig(page, 0).scrollIntoViewIfNeeded();
  await btn(page, 0).focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await expect.poll(() => vid(page, 0).evaluate((v) => document.activeElement === v)).toBe(true);
});

test('failed video shows retry disc', async ({ page }) => {
  const src = await vid(page, 1).locator('source').getAttribute('src');
  await page.route(`**/${src!.split('/').pop()}`, (r) => r.fulfill({ status: 404, body: 'nope' }));
  await tap(page, 1);
  await expect(fig(page, 1)).toHaveClass(/is-error/);
  await expect(btn(page, 1)).toBeVisible();
});

test('straighten transition is 240ms', async ({ page }) => {
  await page.waitForTimeout(1000);
  await tap(page, 0);
  expect(await fig(page, 0).locator('.polaroid__tilt').evaluate((e) => getComputedStyle(e).transitionDuration)).toBe('0.24s');
});

test('playing print straightens', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => fig(page, 0).locator('.polaroid__tilt').evaluate((e) => getComputedStyle(e).transform)).toMatch(/^matrix\(1\.03, 0, 0, 1\.03/);
});

test('pauseAllVideos pauses playing video', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await page.evaluate(async () => { const m = await import('/assets/js/video.js'); m.pauseAllVideos(); });
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(btn(page, 0)).toBeVisible();
});

test('pauses when scrolled out of view', async ({ page }) => {
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => v.paused), { timeout: 5000 }).toBe(true);
});

test('webkit inline: no fullscreen, box stays inside figure', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'webkit only');
  await tap(page, 0);
  await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  const v = (await vid(page, 0).boundingBox())!, f = (await fig(page, 0).boundingBox())!;
  expect(v.x).toBeGreaterThanOrEqual(f.x - 1);
  expect(v.y).toBeGreaterThanOrEqual(f.y - 1);
  expect(v.x + v.width).toBeLessThanOrEqual(f.x + f.width + 1);
  expect(v.y + v.height).toBeLessThanOrEqual(f.y + f.height + 1);
});
