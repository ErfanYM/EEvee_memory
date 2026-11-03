import { test, expect, Page } from '@playwright/test';

const dlg = (page: Page) => page.locator('dialog.lightbox');
const photos = (page: Page) => page.locator('.polaroid[data-kind="photo"]');

async function openPhoto(page: Page, n: number) {
  const fig = photos(page).nth(n);
  await fig.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900))); // let reveal settle
  await fig.locator('.polaroid__open').click();
  await expect(dlg(page)).toBeVisible();
}
const currentId = (page: Page) => dlg(page).getAttribute('data-id');

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('opens on click and shows matching image', async ({ page }) => {
  const id = await photos(page).nth(3).getAttribute('data-media-id');
  const alt = await photos(page).nth(3).locator('img').getAttribute('alt');
  await openPhoto(page, 3);
  expect(await currentId(page)).toBe(id);
  const img = dlg(page).locator('.lightbox__img');
  await expect(img).toHaveAttribute('src', new RegExp(`${id}-(960|1600|1080)\\.`));
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(new RegExp(`${id}-(1600|1080)\\.`));
  await expect(img).toHaveAttribute('alt', alt!);
  await expect(dlg(page)).toHaveAttribute('aria-label', alt!);
  await expect(dlg(page).locator('[aria-live="polite"]')).toHaveText('4 of 20');
  expect(await dlg(page).evaluate((d: HTMLDialogElement) => d.open)).toBe(true);
  await expect(dlg(page).locator('.lightbox__close')).toBeFocused();
});

test('origin print hidden while open', async ({ page }) => {
  await openPhoto(page, 2);
  await expect(photos(page).nth(2)).toHaveCSS('visibility', 'hidden');
});

test('ArrowRight x19 visits all 20 ids, stops at the end', async ({ page }) => {
  await openPhoto(page, 0);
  const seen = [await currentId(page)];
  for (let i = 0; i < 19; i++) { await page.keyboard.press('ArrowRight'); seen.push(await currentId(page)); }
  expect(new Set(seen).size).toBe(20);
  const dom = await photos(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-media-id')));
  expect(seen).toEqual(dom);
  await page.keyboard.press('ArrowRight');
  expect(await currentId(page)).toBe(dom[19]);
  await expect(dlg(page).locator('.lightbox__next')).toHaveAttribute('aria-disabled', 'true');
  await expect(dlg(page).locator('[aria-live="polite"]')).toHaveText('20 of 20');
  await page.keyboard.press('ArrowLeft');
  expect(await currentId(page)).toBe(dom[18]);
  await expect(dlg(page).locator('.lightbox__next')).not.toHaveAttribute('aria-disabled', 'true');
});

test('first photo: ArrowLeft stays, prev aria-disabled', async ({ page }) => {
  await openPhoto(page, 0);
  await page.keyboard.press('ArrowLeft');
  expect(await currentId(page)).toBe(await photos(page).nth(0).getAttribute('data-media-id'));
  await expect(dlg(page).locator('.lightbox__prev')).toHaveAttribute('aria-disabled', 'true');
});

test('Escape closes and focus returns to trigger', async ({ page }) => {
  await openPhoto(page, 4);
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
  await expect(photos(page).nth(4).locator('.polaroid__open')).toBeFocused();
  await expect(photos(page).nth(4)).toHaveCSS('visibility', 'visible');
});

test('focus returns to the CURRENT photo after navigating', async ({ page }) => {
  await openPhoto(page, 4);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
  await expect(photos(page).nth(6).locator('.polaroid__open')).toBeFocused();
});

test('close button closes; backdrop tap closes', async ({ page }) => {
  await openPhoto(page, 1);
  const size = await dlg(page).locator('.lightbox__close').boundingBox();
  expect(size!.width).toBeGreaterThanOrEqual(48);
  await dlg(page).locator('.lightbox__close').click();
  await expect(dlg(page)).toBeHidden();
  await openPhoto(page, 1);
  await page.mouse.click(4, 400); // far left edge: scrim, not image
  await expect(dlg(page)).toBeHidden();
});

test('focus trap: Tab stays inside dialog', async ({ page }) => {
  await openPhoto(page, 1);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog.lightbox'))).toBe(true);
  }
});

test('browser back closes lightbox and stays on page', async ({ page }) => {
  await photos(page).nth(8).scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
  const url = page.url();
  const y = await page.evaluate(() => scrollY);
  expect(y).toBeGreaterThan(300);
  await photos(page).nth(8).locator('.polaroid__open').click();
  await expect(dlg(page)).toBeVisible();
  await page.goBack();
  await expect(dlg(page)).toBeHidden();
  expect(page.url()).toBe(url);
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(24);
  await expect(photos(page).nth(8).locator('.polaroid__open')).toBeFocused();
});

test('browser back after navigating: focus and view follow the CURRENT photo', async ({ page }) => {
  await openPhoto(page, 8);
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await page.goBack();
  await expect(dlg(page)).toBeHidden();
  const cur = photos(page).nth(12);
  await expect(cur.locator('.polaroid__open')).toBeFocused();
  const r = await cur.boundingBox();
  const vh = page.viewportSize()!.height;
  expect(r!.y + r!.height).toBeGreaterThan(0);
  expect(r!.y).toBeLessThan(vh);
});

test('Escape consumes the history entry (one back leaves the page state clean)', async ({ page }) => {
  const len = await page.evaluate(() => history.length);
  await openPhoto(page, 2);
  expect(await page.evaluate(() => history.length)).toBe(len + 1);
  expect(await page.evaluate(() => history.state?.lb)).toBeTruthy();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => history.length)).toBe(len + 1);
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
  await expect.poll(() => page.evaluate(() => history.state?.lb ?? null)).toBeNull();
});

test('reload with lb state does not open', async ({ page }) => {
  await openPhoto(page, 2);
  await page.reload();
  await expect(dlg(page)).toBeHidden();
});

test('landscape 844x390: image fits viewport, no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await openPhoto(page, 0);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const r = document.querySelector('dialog.lightbox .lightbox__img')!.getBoundingClientRect();
    return { l: r.left, t: r.top, r: r.right, b: r.bottom, sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight,
      dsw: document.querySelector('dialog.lightbox')!.scrollWidth };
  });
  expect(m.l).toBeGreaterThanOrEqual(0);
  expect(m.t).toBeGreaterThanOrEqual(0);
  expect(m.r).toBeLessThanOrEqual(m.iw + 0.5);
  expect(m.b).toBeLessThanOrEqual(m.ih + 0.5);
  expect(m.sw).toBeLessThanOrEqual(m.iw);
  expect(m.dsw).toBeLessThanOrEqual(m.iw);
});

test('body scroll locked: wheel while open leaves scrollY unchanged', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'wheel is a desktop input');
  await photos(page).nth(5).scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
  await photos(page).nth(5).locator('.polaroid__open').click();
  await expect(dlg(page)).toBeVisible();
  const y = await page.evaluate(() => scrollY);
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
});

test('opening a lightbox pauses playing videos', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'mp4 playback not available');
  const v = page.locator('.polaroid--video video').first();
  const fig = page.locator('.polaroid--video').first();
  await fig.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
  await fig.locator('.video__play').click();
  await expect.poll(() => v.evaluate((x: HTMLVideoElement) => !x.paused)).toBe(true);
  await page.evaluate(() => (document.querySelector('.polaroid[data-kind="photo"] .polaroid__open') as HTMLElement).click());
  await expect(dlg(page)).toBeVisible();
  await expect.poll(() => v.evaluate((x: HTMLVideoElement) => x.paused)).toBe(true);
});

test('reduced motion: opens and closes without error', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPhoto(page, 3);
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
});

test('rapid double close does not pop past the page', async ({ page }) => {
  const url = page.url();
  const len = await page.evaluate(() => history.length);
  await openPhoto(page, 2);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
  await page.waitForTimeout(400);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => history.length)).toBe(len + 1);
  expect(await page.evaluate(() => history.state?.lb ?? null)).toBeNull();
  await expect(page.locator('.polaroid').first()).toBeAttached(); // still on the page
});

test('double click on X does not pop past the page', async ({ page }) => {
  const url = page.url();
  await openPhoto(page, 2);
  await page.evaluate(() => { const b = document.querySelector('.lightbox__close') as HTMLElement; b.click(); b.click(); });
  await expect(dlg(page)).toBeHidden();
  await page.waitForTimeout(400);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => history.state?.lb ?? null)).toBeNull();
});

// ---- touch ----
async function drag(page: Page, from: [number, number], to: [number, number], ms = 120, id = 7) {
  await page.evaluate(async ({ from, to, ms, id }) => {
    const stage = document.querySelector('dialog.lightbox .lightbox__stage')!;
    const ev = (type: string, x: number, y: number) => stage.dispatchEvent(new PointerEvent(type, {
      pointerId: id, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
    }));
    ev('pointerdown', from[0], from[1]);
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, ms / steps));
      ev('pointermove', from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps);
    }
    ev('pointerup', to[0], to[1]);
  }, { from, to, ms, id });
}

test.describe('swipe', () => {
  test.skip(({ hasTouch }) => !hasTouch, 'touch only');

  test('drag left moves to the next id', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    const next = await photos(page).nth(4).getAttribute('data-media-id');
    const vw = page.viewportSize()!.width;
    await drag(page, [vw * 0.8, 400], [vw * 0.2, 400]);
    await expect.poll(() => currentId(page)).toBe(next);
  });

  test('drag right moves to the previous id', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    const prev = await photos(page).nth(2).getAttribute('data-media-id');
    const vw = page.viewportSize()!.width;
    await drag(page, [vw * 0.2, 400], [vw * 0.8, 400]);
    await expect.poll(() => currentId(page)).toBe(prev);
  });

  test('short slow drag springs back, no change', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    const id = await currentId(page);
    await drag(page, [200, 400], [170, 400], 600);
    await page.waitForTimeout(500);
    expect(await currentId(page)).toBe(id);
  });

  test('swipe at the first photo stops (no wrap)', async ({ page }) => {
    await openPhoto(page, 0);
    await page.waitForTimeout(450);
    const id = await currentId(page);
    const vw = page.viewportSize()!.width;
    await drag(page, [vw * 0.2, 400], [vw * 0.8, 400]);
    await page.waitForTimeout(500);
    expect(await currentId(page)).toBe(id);
  });

  test('swipe down dismisses', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    await drag(page, [200, 300], [200, 560], 200);
    await expect(dlg(page)).toBeHidden();
  });

  test('swipe down: FLIP lands on the print, state cleared', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    await drag(page, [200, 300], [200, 560], 200);
    await expect(dlg(page)).toBeHidden();
    await expect(photos(page).nth(3)).toHaveCSS('visibility', 'visible');
    expect(await page.locator('dialog.lightbox .lightbox__img').evaluate((i: HTMLElement) => i.style.transform)).toBe('');
  });

  test('swipe down close animation ends near the origin print rect', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      const i = document.querySelector('dialog.lightbox .lightbox__img')!;
      const orig = i.animate.bind(i);
      (window as any).__last = null;
      i.animate = (k: any, o: any) => { const a = orig(k, o); if (o && o.duration === 220 && o.fill === 'forwards') (window as any).__last = a; return a; };
    });
    await drag(page, [200, 300], [200, 560], 200);
    await expect.poll(() => page.evaluate(() => !!(window as any).__last)).toBe(true);
    const res = await page.evaluate(async () => {
      const a = (window as any).__last as Animation;
      a.pause(); a.currentTime = 220;
      const i = document.querySelector('dialog.lightbox .lightbox__img')!.getBoundingClientRect();
      const o = document.querySelectorAll('.polaroid[data-kind="photo"]')[3].querySelector('.polaroid__open img')!.getBoundingClientRect();
      return { dc: Math.hypot(i.left + i.width / 2 - (o.left + o.width / 2), i.top + i.height / 2 - (o.top + o.height / 2)) };
    });
    expect(res.dc).toBeLessThan(6);
  });

  test('closing mid-drag does not wedge later swipes', async ({ page }) => {
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      const st = document.querySelector('dialog.lightbox .lightbox__stage')!;
      const ev = (t: string, x: number) => st.dispatchEvent(new PointerEvent(t, { pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: x, clientY: 400, bubbles: true, button: 0, buttons: 1 }));
      ev('pointerdown', 300); ev('pointermove', 250); ev('pointermove', 200);
    });
    await page.keyboard.press('Escape');
    await expect(dlg(page)).toBeHidden();
    await openPhoto(page, 3);
    await page.waitForTimeout(450);
    const next = await photos(page).nth(4).getAttribute('data-media-id');
    const vw = page.viewportSize()!.width;
    await drag(page, [vw * 0.8, 400], [vw * 0.2, 400]);
    await expect.poll(() => currentId(page)).toBe(next);
  });
});
