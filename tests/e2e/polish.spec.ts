import { test, expect } from '@playwright/test';

test('failsafe reveals every pending print after 2500ms without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('load');
  expect(await page.locator('.is-pending').count()).toBeGreaterThan(0);
  await page.waitForTimeout(2700);
  expect(await page.locator('.is-pending').count()).toBe(0);
});

test('photo focus ring is drawn on the level figure, not the tilted button', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.classList.contains('polaroid__open'))) break;
  }
  const r = await page.evaluate(() => {
    const b = document.activeElement as HTMLElement;
    const fig = b.closest('figure')!;
    const f = getComputedStyle(fig), bs = getComputedStyle(b);
    return { cls: b.className, figStyle: f.outlineStyle, figWidth: f.outlineWidth, figOffset: f.outlineOffset, btnStyle: bs.outlineStyle };
  });
  expect(r.cls).toContain('polaroid__open');
  expect(r.figStyle).toBe('solid');
  expect(r.figWidth).toBe('3px');
  expect(r.figOffset).toBe('3px');
  expect(r.btnStyle).toBe('none');
});

test('video play button ring is also on the figure', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('.video__play').first();
  await btn.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const r = await page.evaluate(() => {
    const b = document.activeElement as HTMLElement;
    return { play: b.classList.contains('video__play'), fig: getComputedStyle(b.closest('figure')!).outlineStyle, btn: getComputedStyle(b).outlineStyle };
  });
  expect(r.play).toBe(true);
  expect(r.fig).toBe('solid');
  expect(r.btn).toBe('none');
});

test('donation block: h2 balance width, button cap and shared left edge', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const m = await page.evaluate(() => {
    const h2 = document.querySelector('.field--donate h2') as HTMLElement;
    const d = document.querySelector('.donate') as HTMLElement;
    return { h2max: getComputedStyle(h2).maxWidth, h2w: h2.getBoundingClientRect().width, donW: d.getBoundingClientRect().width, rem: parseFloat(getComputedStyle(document.documentElement).fontSize) };
  });
  const ch14 = await page.evaluate(() => {
    const h2 = document.querySelector('.field--donate h2') as HTMLElement;
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:14ch;font:inherit;letter-spacing:inherit';
    h2.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  });
  expect(m.h2w).toBeLessThanOrEqual(ch14 + 1);   // 14ch cap applies, not the 36ch measure
  expect(m.donW).toBeLessThanOrEqual(22 * m.rem + 1);
  await page.locator('.donate').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.superpowers/shots/task8/donate-390.png' });
});

for (const w of [600, 768]) {
  test(`button and domain share a left edge at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    const e = await page.evaluate(() => ({
      b: document.querySelector('.donate')!.getBoundingClientRect().left,
      d: document.querySelector('.domain')!.getBoundingClientRect().left,
      bw: document.querySelector('.donate')!.getBoundingClientRect().width,
      cw: document.querySelector('.field--donate .wrap')!.getBoundingClientRect().width,
    }));
    expect(Math.abs(e.b - e.d)).toBeLessThanOrEqual(1);
    expect(e.bw).toBeLessThan(e.cw - 40); // not stretched to the column
  });
}

test('press-in is 100ms even after the reveal is done', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const fig = page.locator('.polaroid.is-pending:not(.polaroid--video)').first();
  const id = await fig.getAttribute('data-media-id');
  const target = page.locator(`[data-media-id="${id}"]`);
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await expect(target).toHaveClass(/is-done/);
  const box = (await target.locator('.polaroid__open').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const dur = await target.locator('.polaroid__tilt').evaluate((el) => getComputedStyle(el).transitionDuration);
  await page.mouse.up();
  expect(dur).toBe('0.1s');
});
