// Break-it round 3 fixes (docs/council/review-3-triage.md).
import { test, expect, Page } from '@playwright/test';

// A point inside the white bottom margin of a print, honouring its tilt.
async function bottomMargin(page: Page, sel: string) {
  const fig = page.locator(sel);
  await fig.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000))); // let reveal settle
  return fig.locator('.polaroid__tilt').evaluate((t: HTMLElement) => {
    const r = t.getBoundingClientRect();
    const a = ((parseFloat(getComputedStyle(t.parentElement!).getPropertyValue('--tilt')) || 0) * Math.PI) / 180;
    const d = t.offsetHeight / 2 - 16;
    return { x: r.left + r.width / 2 - Math.sin(a) * d, y: r.top + r.height / 2 + Math.cos(a) * d };
  });
}

test('I8: a keyboard-focused print rises above its overlapping neighbour', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const fig = page.locator('.polaroid[data-media-id="ec73ecaf"]');
  await fig.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));
  const probe = () => fig.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.right - 8, r.top + r.height * 0.5);
    return { own: !!hit && el.contains(hit), id: hit?.closest('.polaroid')?.getAttribute('data-media-id') };
  });
  expect((await probe()).id).toBe('img_7207'); // the cake print overlaps this edge
  await page.keyboard.press('Tab');
  await fig.locator('.polaroid__open').focus();
  await expect(fig.locator('.polaroid__open')).toBeFocused();
  expect((await probe()).own).toBe(true);
});

test('E9: clicking the white bottom margin of a photo print opens the lightbox', async ({ page }) => {
  await page.goto('/');
  const sel = '.polaroid[data-media-id="img_8394"]';
  const { x, y } = await bottomMargin(page, sel);
  await page.mouse.click(x, y);
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  expect(await page.locator('dialog.lightbox').getAttribute('data-id')).toBe('img_8394');
});

test.describe('E9 video', () => {
  test.beforeEach(({ browserName }, info) => {
    test.skip(!['chromium', 'webkit'].includes(browserName) || info.project.name === 'mobile-chrome', 'video tests run on chromium, webkit, mobile-safari');
  });

  test('E9: clicking the bottom margin of a video print plays it; the frame then ignores clicks', async ({ page }) => {
    await page.goto('/');
    const sel = '.polaroid--video >> nth=0';
    const v = page.locator(sel).locator('video');
    const p = await bottomMargin(page, sel);
    await page.mouse.click(p.x, p.y);
    await expect.poll(() => v.evaluate((e: HTMLVideoElement) => !e.paused && e.readyState > 1)).toBe(true);
    await v.evaluate((e: HTMLVideoElement) => { e.currentTime = 1; });
    await page.waitForTimeout(200);
    const p2 = await bottomMargin(page, sel);
    await page.mouse.click(p2.x, p2.y); // frame while playing: no restart, no pause
    await page.waitForTimeout(400);
    const s = await v.evaluate((e: HTMLVideoElement) => ({ paused: e.paused, t: e.currentTime, controls: e.controls }));
    expect(s.paused).toBe(false);
    expect(s.t).toBeGreaterThanOrEqual(0.9); // not rewound by a restart
    expect(s.controls).toBe(true);
    // native controls area: the bar sits at the bottom of the video; a click there must not restart playback
    const box = (await v.boundingBox())!;
    const before = await v.evaluate((e: HTMLVideoElement) => e.currentTime);
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height - 14);
    await page.waitForTimeout(300);
    expect(await v.evaluate((e: HTMLVideoElement) => e.currentTime)).toBeGreaterThanOrEqual(before);
  });
});
