// Break-it round 1 fixes (docs/council/review-1-triage.md). Test names carry the fix IDs.
import { test, expect, Page } from '@playwright/test';

const dlg = (page: Page) => page.locator('dialog.lightbox');
const photos = (page: Page) => page.locator('.polaroid[data-kind="photo"]');
const vfig = (page: Page, n: number) => page.locator('.polaroid--video').nth(n);
const vid = (page: Page, n: number) => vfig(page, n).locator('video');
const vbtn = (page: Page, n: number) => vfig(page, n).locator('.video__play');
const videoOk = (browserName: string, name: string) => ['chromium', 'webkit'].includes(browserName) && name !== 'mobile-chrome';

async function openPhoto(page: Page, n: number) {
  const fig = photos(page).nth(n);
  await fig.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
  await fig.locator('.polaroid__open').click();
  await expect(dlg(page)).toBeVisible();
}

async function drag(page: Page, from: [number, number], to: [number, number], ms = 120) {
  await page.evaluate(async ({ from, to, ms }) => {
    const stage = document.querySelector('dialog.lightbox .lightbox__stage')!;
    const ev = (type: string, x: number, y: number) => stage.dispatchEvent(new PointerEvent(type, {
      pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
    }));
    ev('pointerdown', from[0], from[1]);
    for (let i = 1; i <= 8; i++) {
      await new Promise((r) => setTimeout(r, ms / 8));
      ev('pointermove', from[0] + ((to[0] - from[0]) * i) / 8, from[1] + ((to[1] - from[1]) * i) / 8);
    }
    ev('pointerup', to[0], to[1]);
  }, { from, to, ms });
}

// ---------------- P1 / P2 ----------------
test.describe('P1 P2 loading', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('P1: one stylesheet, hero preloaded as WebP, no AVIF, no async decode on the hero', async ({ page }) => {
    expect(await page.locator('link[rel="stylesheet"]').count()).toBe(1);
    const pre = page.locator('link[rel="preload"][as="image"]');
    await expect(pre).toHaveAttribute('type', 'image/webp');
    await expect(pre).toHaveAttribute('fetchpriority', 'high');
    expect(await pre.getAttribute('imagesrcset')).toContain('img_8819-960.webp');
    expect(await pre.getAttribute('imagesizes')).toBeTruthy();
    const hero = page.locator('.polaroid--hero');
    expect(await hero.locator('source[type="image/avif"]').count()).toBe(0);
    expect(await hero.locator('img').getAttribute('decoding')).toBeNull();
    await expect(hero.locator('img')).toHaveAttribute('fetchpriority', 'high');
  });

  test('P2: at 1440x900 @1x no lazy print pulls 960w or 1600w', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const big: string[] = [];
    page.on('request', (r) => { const m = r.url().match(/img\/([^/]+?)-(960|1600|1080|1599)\./); if (m && !m[1].startsWith('img_8819') && !m[1].includes('poster')) big.push(r.url()); });
    await page.goto('/');
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(600);
    await ctx.close();
    expect(big).toEqual([]);
  });
});

// ---------------- Taste: layout ----------------
test.describe('T layout', () => {
  test('T1: at 1440 every spread is a single row; 4-item spreads are four across', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const rows = await page.evaluate(() => [...document.querySelectorAll('.spread')].map((s) => {
      const tops = [...s.querySelectorAll('.polaroid')].map((p) => p.getBoundingClientRect().top);
      const lefts = [...s.querySelectorAll('.polaroid')].map((p) => Math.round(p.getBoundingClientRect().left));
      return { id: s.className, n: tops.length, spread: Math.max(...tops) - Math.min(...tops), distinctLefts: new Set(lefts).size };
    }));
    expect(rows.length).toBe(7);
    for (const r of rows) {
      expect(r.spread, r.id).toBeLessThan(80);
      expect(r.distinctLefts, r.id).toBe(r.n);
    }
    expect(rows.filter((r) => r.n === 4).length).toBe(2);
    expect(rows.find((r) => r.id.includes('s7'))!.n).toBe(3);
  });

  test('T1: S7 puts 20221006 (lead) in the middle at 1.2x or more', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const b = await page.evaluate(() => ['img_1551', '20221006', 'img_7522'].map((id) => {
      const r = document.querySelector(`.polaroid[data-media-id="${id}"]`)!.getBoundingClientRect();
      return { l: r.left, w: r.width };
    }));
    expect(b[0].l).toBeLessThan(b[1].l);
    expect(b[1].l).toBeLessThan(b[2].l);
    expect(b[1].w / b[0].w).toBeGreaterThan(1.15);
  });

  for (const w of [1024, 1920]) {
    test(`T1: no orphan rows at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/');
      const spreads = await page.evaluate(() => [...document.querySelectorAll('.spread')].map((s) => {
        const t = [...s.querySelectorAll('.polaroid')].map((p) => p.getBoundingClientRect().top);
        return Math.max(...t) - Math.min(...t);
      }));
      for (const d of spreads) expect(d).toBeLessThan(80);
    });
  }

  test('T2: wrap is 1320 at 1920; hero print is about 520 at 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    expect(await page.locator('.field--first .wrap').evaluate((e) => e.getBoundingClientRect().width)).toBe(1320);
    await page.setViewportSize({ width: 1440, height: 900 });
    const hw = await page.locator('.polaroid--hero').evaluate((e) => e.getBoundingClientRect().width);
    expect(hw).toBeGreaterThan(500);
    expect(hw).toBeLessThanOrEqual(521);
  });

  test('T3: meet-2 sits right of centre, meet-1 and meet-3 left; donation column centred', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const left = (k: string) => page.locator(`[data-copy="${k}"]`).evaluate((e) => e.getBoundingClientRect().left);
    expect(await left('meet-2')).toBeGreaterThan(720);
    expect(await left('meet-1')).toBeLessThan(400);
    expect(await left('meet-3')).toBeLessThan(400);
    const d = await page.evaluate(() => {
      const c = document.querySelector('[data-copy="memory-1"]')!.getBoundingClientRect();
      const a = document.querySelector('.donate')!.getBoundingClientRect();
      const dom = document.querySelector('.domain')!.getBoundingClientRect();
      return { mid: c.left + c.width / 2, a: a.left, c: c.left, dom: dom.left };
    });
    expect(Math.abs(d.mid - 720)).toBeLessThan(30);
    expect(Math.abs(d.a - d.c)).toBeLessThan(2);
    expect(Math.abs(d.dom - d.c)).toBeLessThan(2);
  });

  test('T4: at 768 every paragraph and the hero text share one left edge', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    const lefts = await page.evaluate(() => [...document.querySelectorAll('.copy:not(.field--closing .copy)')].map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
  });

  test('T5: the print carrying tape stacks above its neighbours', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const z = await page.locator('.polaroid[data-media-id="img_7207"]').evaluate((e) => getComputedStyle(e).zIndex);
    expect(Number(z)).toBeGreaterThan(2);
  });

  test('T6: phone chapter padding is 56px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    expect(await page.locator('.field--meadow').evaluate((e) => getComputedStyle(e).paddingTop)).toBe('56px');
  });
});

// ---------------- Impeccable ----------------
test.describe('I fixes', () => {
  test('I1: landscape phone lightbox photo is at least 340px tall', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    await openPhoto(page, 3);
    await page.waitForTimeout(500);
    const h = await dlg(page).locator('.lightbox__img').evaluate((e) => e.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(340);
  });

  test('I2: every video carries the same aria-label as its play button', async ({ page }) => {
    await page.goto('/');
    const rows = await page.locator('.polaroid--video').evaluateAll((els) => els.map((e) => ({
      v: e.querySelector('video')!.getAttribute('aria-label'), b: e.querySelector('.video__play')!.getAttribute('aria-label'),
    })));
    expect(rows.length).toBe(4);
    for (const r of rows) { expect(r.v).toMatch(/^Play video: .+/); expect(r.v).toBe(r.b); }
  });

  test('I3: play button hit area is at least 72x72', async ({ page }) => {
    await page.goto('/');
    await vfig(page, 0).scrollIntoViewIfNeeded();
    const b = await vbtn(page, 0).evaluate((e: HTMLElement) => ({ w: e.offsetWidth, h: e.offsetHeight }));
    expect(b.w).toBeGreaterThanOrEqual(72);
    expect(b.h).toBeGreaterThanOrEqual(72);
  });

  test('I4: focusin reveals a pending print instantly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const fig = photos(page).nth(15);
    await expect(fig).toHaveClass(/is-pending/);
    const r = await fig.evaluate((el) => {
      (el.querySelector('.polaroid__open') as HTMLElement).focus({ preventScroll: true });
      const tilt = el.querySelector('.polaroid__tilt')!;
      return { pending: el.classList.contains('is-pending'), opacity: getComputedStyle(tilt).opacity, t: getComputedStyle(tilt).transitionDuration };
    });
    expect(r.pending).toBe(false);
    expect(r.opacity).toBe('1');
    expect(r.t).toBe('0s');
  });

  test('I5: landscape phone hero print is no taller than 85vh', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    const b = (await page.locator('.polaroid--hero').boundingBox())!;
    expect(b.height).toBeLessThanOrEqual(390 * 0.85 + 2);
    expect(b.y + b.height * 0.6).toBeLessThan(390); // her face (upper part of the print) is on the first screen
  });

  test('I6: scrim alpha is .97', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--scrim'))).toContain('.97');
  });
});

// ---------------- Emil ----------------
test.describe('E lightbox', () => {
  test('E1: lightbox img is seeded and visible within 100ms even if 960w and 1600w hang', async ({ page }) => {
    await page.goto('/');
    const id = (await photos(page).nth(3).getAttribute('data-media-id'))!;
    const fig = photos(page).nth(3);
    await fig.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
    await expect.poll(() => fig.locator('.polaroid__open img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    // Hang every larger file; the file the print already shows (its currentSrc) is served normally, as a real cache would.
    const seed = await fig.locator('.polaroid__open img').evaluate((i: HTMLImageElement) => i.currentSrc);
    await page.route(new RegExp(`${id}-(480|960|1600|1080)\\.`), async (route) => {
      if (route.request().url() !== seed) await new Promise((r) => setTimeout(r, 4000));
      await route.continue().catch(() => {});
    });
    const r = await page.evaluate(async () => {
      const d = document.querySelector('dialog.lightbox') as HTMLDialogElement;
      const img = d.querySelector('.lightbox__img') as HTMLImageElement;
      const t0 = performance.now();
      (document.querySelectorAll('.polaroid[data-kind="photo"]')[3].querySelector('.polaroid__open') as HTMLElement).click();
      await new Promise((res) => setTimeout(res, 90));
      return { dt: performance.now() - t0, open: d.open, src: img.getAttribute('src'), vis: getComputedStyle(img).visibility, ok: img.complete && img.naturalWidth > 0, w: img.getBoundingClientRect().width };
    });
    expect(r.open).toBe(true);
    expect(r.src).toBeTruthy();
    expect(r.vis).not.toBe('hidden');
    expect(r.ok).toBe(true);
    expect(r.w).toBeGreaterThan(100);
    expect(r.dt).toBeLessThan(200);
  });

  test.describe('touch', () => {
    test.skip(({ hasTouch }) => !hasTouch, 'touch only');

    test('E3: swap holds inline opacity 0 when the new photo source lands', async ({ page }) => {
      await page.goto('/');
      await openPhoto(page, 3);
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        const img = document.querySelector('dialog.lightbox .lightbox__img') as HTMLImageElement;
        (window as any).__log = [];
        new MutationObserver((ms) => { for (const m of ms) if (m.attributeName === 'src') (window as any).__log.push(img.style.opacity); }).observe(img, { attributes: true });
      });
      const before = await dlg(page).getAttribute('data-id');
      const vw = page.viewportSize()!.width;
      await drag(page, [vw * 0.8, 400], [vw * 0.2, 400]);
      await expect.poll(() => dlg(page).getAttribute('data-id')).not.toBe(before);
      await page.waitForTimeout(500);
      const log = await page.evaluate(() => (window as any).__log as string[]);
      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toBe('0');
    });

    test('E4: slow 50px / 400ms drag does not commit', async ({ page }) => {
      await page.goto('/');
      await openPhoto(page, 3);
      await page.waitForTimeout(600);
      const id = await dlg(page).getAttribute('data-id');
      await drag(page, [250, 400], [200, 400], 400);
      await page.waitForTimeout(500);
      expect(await dlg(page).getAttribute('data-id')).toBe(id);
    });
  });

  test('E6: back then forward leaves no lb state with the dialog closed', async ({ page }) => {
    await page.goto('/');
    await openPhoto(page, 2);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => history.state?.lb ?? null)).not.toBeNull();
    await page.goBack();
    await expect(dlg(page)).toBeHidden();
    await page.goForward();
    await expect(dlg(page)).toBeHidden();
    await expect.poll(() => page.evaluate(() => history.state?.lb ?? null)).toBeNull();
  });
});

test.describe('E video', () => {
  test.beforeEach(({ browserName }, info) => { test.skip(!videoOk(browserName, info.project.name), 'video tests run on chromium, webkit, mobile-safari'); });

  test('E2: is-buffering is on immediately after the tap, off once playing', async ({ page }) => {
    await page.route('**/*.mp4', async (route) => { await new Promise((r) => setTimeout(r, 2500)); await route.continue().catch(() => {}); });
    await page.goto('/');
    await vfig(page, 0).scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
    const cls = await vbtn(page, 0).evaluate((b: HTMLElement) => { b.click(); return b.closest('.polaroid')!.className; });
    expect(cls).toContain('is-buffering');
    expect(cls).toContain('is-playing');
    // the disc stays visible (spinner) while buffering
    expect(await vbtn(page, 0).evaluate((b) => getComputedStyle(b).visibility)).toBe('visible');
    await expect(vfig(page, 0)).not.toHaveClass(/is-buffering/, { timeout: 12000 });
  });

  test('E5: the video is reloaded and rewound after ended (poster state)', async ({ page }) => {
    await page.goto('/');
    await vfig(page, 0).scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
    await vbtn(page, 0).click();
    await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => !v.paused && v.readyState > 1)).toBe(true);
    await vid(page, 0).evaluate((v: HTMLVideoElement) => { v.currentTime = v.duration - 0.1; });
    await expect(vbtn(page, 0)).toBeVisible({ timeout: 8000 });
    // load() rewinds to the start (frame 0 / poster) instead of leaving the last frame
    await expect.poll(() => vid(page, 0).evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(0);
    expect(await vid(page, 0).evaluate((v: HTMLVideoElement) => v.ended)).toBe(false);
  });
});

test.describe('R13 no-JS', () => {
  test.use({ javaScriptEnabled: false });
  test('R13: with JS off every photo loads and every video figure shows its poster', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'chromium only');
    await page.goto('/');
    const h = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
    const imgs = page.locator('.polaroid[data-kind="photo"] img');
    expect(await imgs.count()).toBe(20);
    for (let i = 0; i < 20; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => imgs.nth(i).evaluate((e: HTMLImageElement) => e.naturalWidth), { timeout: 8000 }).toBeGreaterThan(0);
    }
    const posters = page.locator('.polaroid--video .video__poster-fallback');
    expect(await posters.count()).toBe(4);
    for (let i = 0; i < 4; i++) {
      await posters.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => posters.nth(i).evaluate((e: HTMLImageElement) => e.naturalWidth), { timeout: 8000 }).toBeGreaterThan(0);
      expect(await posters.nth(i).isVisible()).toBe(true);
    }
    void h;
  });
});
