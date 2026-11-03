import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const media = JSON.parse(fs.readFileSync(path.join(__dirname, '../../site/assets/media.json'), 'utf8'));

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('24 media items, each id once', async ({ page }) => {
  const ids = await page.locator('[data-media-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-media-id')));
  expect(ids).toHaveLength(24);
  expect(new Set(ids).size).toBe(24);
  expect([...ids].sort()).toEqual(media.map((m: any) => m.id).sort());
  for (const m of media) {
    await expect(page.locator(`[data-media-id="${m.id}"]`)).toHaveAttribute('data-kind', m.kind);
  }
});

test('image loading attributes and alt', async ({ page }) => {
  const imgs = await page.locator('main img').evaluateAll((els) =>
    els.map((e) => ({
      id: e.closest('[data-media-id]')?.getAttribute('data-media-id'),
      loading: e.getAttribute('loading'),
      alt: e.getAttribute('alt'),
      w: e.getAttribute('width'),
      h: e.getAttribute('height'),
    })));
  expect(imgs).toHaveLength(20);
  for (const i of imgs) {
    expect(i.alt && i.alt.trim().length).toBeGreaterThan(0);
    expect(i.w).toBeTruthy();
    expect(i.h).toBeTruthy();
    if (i.id === 'img_8819') expect(i.loading).not.toBe('lazy');
    else expect(i.loading).toBe('lazy');
  }
  expect(await page.locator('[data-media-id="img_8819"] img').getAttribute('fetchpriority')).toBe('high');
});

test('videos follow the DOM contract', async ({ page }) => {
  const vids = page.locator('figure.polaroid--video');
  await expect(vids).toHaveCount(4);
  for (const v of await vids.all()) {
    const video = v.locator('video');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('width', /\d+/);
    await expect(video).toHaveAttribute('height', /\d+/);
    await expect(video).toHaveAttribute('poster', /poster-960/);
    expect(await video.getAttribute('autoplay')).toBeNull();
    await expect(v.locator('button.video__play')).toHaveAttribute('aria-label', /^Play video: .+/);
  }
});

test('photo open buttons', async ({ page }) => {
  const btns = page.locator('figure[data-kind="photo"] button.polaroid__open');
  await expect(btns).toHaveCount(20);
  await expect(btns.first()).toHaveAttribute('aria-label', /^Open photo: .+/);
});
