import { test, expect } from '@playwright/test';
import copy from '../fixtures/copy.json';

const DONATE = 'https://torontohumanesociety.donorsupport.co/page/InMemory?tributeHonoree=Eevee';
const DOMAIN = 'torontohumanesociety.donorsupport.co';
const LABEL = 'Make a donation in Eevee’s memory';
const SIGNOFF = ['With love,', 'The Li Family 💛'];
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('paragraphs match the fixture verbatim', async ({ page }) => {
  for (const [group, list] of Object.entries(copy)) {
    for (let i = 0; i < list.length; i++) {
      const el = page.locator(`[data-copy="${group}-${i}"]`);
      await expect(el).toHaveCount(1);
      expect(norm(await el.evaluate((n) => (n as HTMLElement).textContent ?? ''))).toBe(list[i]);
    }
  }
});

test('headings', async ({ page }) => {
  await expect(page.locator('h1')).toHaveCount(1);
  expect(norm(await page.locator('h1').innerText())).toBe('Meet Eevee');
  await expect(page.locator('h2')).toHaveCount(1);
  expect(norm(await page.locator('h2').innerText())).toBe('In Loving Memory of Eevee');
});

test('donate link', async ({ page }) => {
  const a = page.locator('a.donate');
  await expect(a).toHaveCount(1);
  await expect(a).toHaveAttribute('href', DONATE);
  await expect(a).toHaveAttribute('target', '_blank');
  expect(await a.getAttribute('rel')).toContain('noopener');
  const label = await a.evaluate((n) => {
    const c = n.cloneNode(true) as HTMLElement;
    c.querySelectorAll('.sr-only').forEach((s) => s.remove());
    return c.textContent ?? '';
  });
  expect(norm(label)).toBe(LABEL);
});

test('visible text audit: nothing beyond the family’s words', async ({ page }) => {
  const text = await page.evaluate(() => {
    const c = document.body.cloneNode(true) as HTMLElement;
    c.querySelectorAll('script,style,noscript,.sr-only').forEach((n) => n.remove());
    return c.textContent ?? '';
  });
  let rest = norm(text);
  const known = [...Object.values(copy).flat(), 'Meet Eevee', 'In Loving Memory of Eevee', LABEL, DOMAIN, ...SIGNOFF];
  for (const k of known) {
    expect(rest).toContain(k);
    rest = rest.replace(k, '');
  }
  expect(rest.trim()).toBe('');
});

test('document metadata', async ({ page }) => {
  await expect(page).toHaveTitle('In Loving Memory of Eevee');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-CA');
});

test('sign-off credit closes the page', async ({ page }) => {
  const f = page.locator('footer.signoff');
  await expect(f).toHaveCount(1);
  expect(norm(await f.locator('.signoff__line').innerText())).toBe(SIGNOFF[0]);
  expect(norm(await f.locator('.signoff__name').innerText())).toBe(SIGNOFF[1]);
  // it is the last visible content: below the closing paragraph, centred
  const c = await page.locator('[data-copy="closing-0"]').boundingBox();
  const b = await f.boundingBox();
  expect(b!.y).toBeGreaterThan(c!.y + c!.height);
  const vw = page.viewportSize()!.width;
  expect(Math.abs(b!.x + b!.width / 2 - vw / 2)).toBeLessThan(24);
  expect(await f.locator('.signoff__name').evaluate((n) => getComputedStyle(n).textAlign)).toBe('center');
});

test('donate link pre-fills the dedication with Eevee', async ({ page }) => {
  const href = await page.locator('a.donate').getAttribute('href');
  expect(new URL(href!).searchParams.get('tributeHonoree')).toBe('Eevee');
});
