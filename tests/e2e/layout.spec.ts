import { test, expect } from '@playwright/test';

const sizes = [
  [320, 568], [375, 812], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [844, 390],
];

for (const [w, h] of sizes) {
  test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await page.waitForLoadState('load');
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      bad: [...document.querySelectorAll('.polaroid')].filter((p) => {
        const b = p.getBoundingClientRect();
        return b.left < -1 || b.right > window.innerWidth + 1;
      }).map((p) => (p as HTMLElement).dataset.mediaId),
    }));
    expect(r.sw).toBeLessThanOrEqual(r.iw);
    expect(r.bad).toEqual([]);
  });
}

test('hero is in the first screen at 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const b = await page.locator('[data-media-id="img_8819"]').boundingBox();
  expect(b!.y).toBeLessThan(300);
  expect(b!.y + b!.height).toBeLessThan(844);
});

test('CLS under Slow 3G after full scroll < 0.05', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP throttling is Chromium only');
  test.setTimeout(180_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 400, downloadThroughput: (500 * 1024) / 8, uploadThroughput: (500 * 1024) / 8,
  });
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).__cls)).toBeLessThan(0.05);
});
