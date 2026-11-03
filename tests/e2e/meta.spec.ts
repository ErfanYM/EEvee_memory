import { test, expect } from '@playwright/test';

const SITE = 'https://erfanym.github.io/EEvee_memory/';
const DESC = 'Eevee was the sweetest girl who brought us 12 years of happiness.';
const meta = (page, sel: string) => page.locator(`head ${sel}`).first().getAttribute('content');

test('title, language and link-preview meta', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('In Loving Memory of Eevee');
  expect(await page.locator('html').getAttribute('lang')).toBe('en-CA');
  expect(await meta(page, 'meta[name="description"]')).toBe(DESC);
  expect(await meta(page, 'meta[property="og:title"]')).toBe('In Loving Memory of Eevee');
  expect(await meta(page, 'meta[property="og:description"]')).toBe(DESC);
  expect(await meta(page, 'meta[property="og:type"]')).toBe('website');
  expect(await meta(page, 'meta[property="og:url"]')).toBe(SITE);
  expect(await meta(page, 'meta[property="og:image"]')).toBe(`${SITE}assets/og.jpg`);
  expect(await meta(page, 'meta[property="og:image:width"]')).toBe('1200');
  expect(await meta(page, 'meta[property="og:image:height"]')).toBe('630');
  expect(await meta(page, 'meta[property="og:image:alt"]')).toBe('Eevee smiling in the snowy woods');
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  expect(await meta(page, 'meta[name="twitter:title"]')).toBe('In Loving Memory of Eevee');
  expect(await meta(page, 'meta[name="twitter:description"]')).toBe(DESC);
  expect(await meta(page, 'meta[name="twitter:image"]')).toBe(`${SITE}assets/og.jpg`);
  expect(await meta(page, 'meta[name="theme-color"]')).toBe('#CFE0EA');
});

test('no invented claims in the description', async ({ page }) => {
  await page.goto('/');
  expect((await meta(page, 'meta[name="description"]'))!.toLowerCase()).not.toContain('golden');
});

test('favicons are linked, exist and have the right sizes', async ({ page, request }) => {
  await page.goto('/');
  const links = await page.locator('head link[rel~="icon"], head link[rel="apple-touch-icon"]').evaluateAll((els) =>
    els.map((e) => ({ rel: e.getAttribute('rel'), href: e.getAttribute('href'), sizes: e.getAttribute('sizes') })));
  const hrefs = links.map((l) => l.href);
  expect(hrefs).toContain('assets/favicon-32.png');
  expect(hrefs).toContain('assets/favicon-192.png');
  expect(links.find((l) => l.rel === 'apple-touch-icon')?.href).toBe('assets/apple-touch-icon.png');
  for (const l of links) {
    const res = await request.get('/' + l.href);
    expect(res.status(), l.href!).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  }
  const dims = await page.evaluate(async (hs) => Promise.all(hs.map((h) => new Promise((r) => {
    const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.src = h;
  }))), ['assets/favicon-32.png', 'assets/favicon-192.png', 'assets/apple-touch-icon.png']);
  expect(dims).toEqual([[32, 32], [192, 192], [180, 180]]);
});

test('og.jpg is 1200x630', async ({ page }) => {
  await page.goto('/');
  const d = await page.evaluate(() => new Promise((r) => {
    const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.src = 'assets/og.jpg';
  }));
  expect(d).toEqual([1200, 630]);
});

test('zero console errors on load', async ({ page, browserName }) => {
  const errs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('requestfailed', (r) => {
    if (/\.mp4(\?|$)/.test(r.url()) && /abort/i.test(r.failure()?.errorText ?? '')) return;
    errs.push(`requestfailed ${r.url()}`);
  });
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  // Playwright's Firefox build lacks H.264; ignore only genuine decode errors there (aborted .mp4 requests are ignored everywhere).
  const real = errs.filter((e) => !(browserName === 'firefox' && /(cannot|can't|failed to) (decode|play)|NS_ERROR_DOM_MEDIA|no decoders/i.test(e)));
  expect(real).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('prints do not animate transforms and tilts stay', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => [...document.querySelectorAll('.polaroid__tilt')].map((el) => {
      const cs = getComputedStyle(el);
      return { props: cs.transitionProperty, dur: cs.transitionDuration, transform: cs.transform };
    }));
    for (const p of r) {
      const animatesTransform = p.dur.split(',').some((d, i) => parseFloat(d) > 0
        && ['all', 'transform'].includes(p.props.split(',')[i % p.props.split(',').length].trim()));
      expect(animatesTransform).toBe(false);
    }
    const tilted = r.filter((p) => p.transform !== 'none' && p.transform !== 'matrix(1, 0, 0, 1, 0, 0)');
    expect(tilted.length).toBeGreaterThan(20);
  });
});
