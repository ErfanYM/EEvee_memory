// Round 4: the whole-print tap target (E9) must stay inside the visible frame.
import { test, expect } from '@playwright/test';

for (const [w, h] of [[390, 844], [1440, 900]]) {
  test(`E9-fix: at ${w}px every print's visible frame resolves to itself or a print that visibly covers it`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(1500);
    const bad = await page.evaluate(() => {
      // quad of the visible (tilted) card
      const card = (fig: Element) => {
        const t = fig.querySelector('.polaroid__tilt') as HTMLElement;
        const r = t.getBoundingClientRect();
        const a = ((parseFloat(getComputedStyle(fig).getPropertyValue('--tilt')) || 0) * Math.PI) / 180;
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, hw: t.offsetWidth / 2, hh: t.offsetHeight / 2, a };
      };
      const local = (c: ReturnType<typeof card>, x: number, y: number) => {
        const dx = x - c.cx, dy = y - c.cy;
        return { u: dx * Math.cos(c.a) + dy * Math.sin(c.a), v: -dx * Math.sin(c.a) + dy * Math.cos(c.a) };
      };
      const inside = (c: ReturnType<typeof card>, x: number, y: number, m = 0) => { const p = local(c, x, y); return Math.abs(p.u) <= c.hw + m && Math.abs(p.v) <= c.hh + m; };
      const out: string[] = [];
      for (const fig of document.querySelectorAll('.polaroid')) {
        (fig as HTMLElement).scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        const c = card(fig);
        for (const fu of [-0.9, 0, 0.9]) for (const fv of [-0.9, 0, 0.9]) {
          const u = fu * (c.hw - 3), v = fv * (c.hh - 3);
          const x = c.cx + u * Math.cos(c.a) - v * Math.sin(c.a);
          const y = c.cy + u * Math.sin(c.a) + v * Math.cos(c.a);
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          const hit = document.elementFromPoint(x, y)?.closest('.polaroid');
          if (!hit || hit === fig) continue;
          // another print is on top here: acceptable only if the point really lies inside that print's visible card
          if (!inside(card(hit), x, y, 0.5)) out.push(`${(fig as HTMLElement).dataset.mediaId} point(${fu},${fv}) -> ${(hit as HTMLElement).dataset.mediaId} at ${Math.round(x)},${Math.round(y)} fig ${JSON.stringify(c)} hitcard ${JSON.stringify(card(hit))}`);
        }
      }
      return out;
    });
    expect(bad).toEqual([]);
  });
}

test('E9-fix: a tap just outside a print frame does not open it (390)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const fig = page.locator('.polaroid[data-media-id="37c83b77"]');
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  // 12px below the visible bottom edge at its centre, on the page background (or a neighbour), must never open this photo
  const pt = await fig.locator('.polaroid__tilt').evaluate((t: HTMLElement) => {
    const r = t.getBoundingClientRect();
    const a = ((parseFloat(getComputedStyle(t.parentElement!).getPropertyValue('--tilt')) || 0) * Math.PI) / 180;
    const d = t.offsetHeight / 2 + 8;
    return { x: r.left + r.width / 2 - Math.sin(a) * d, y: r.top + r.height / 2 + Math.cos(a) * d };
  });
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(400);
  const open = await page.locator('dialog.lightbox').evaluate((d: HTMLDialogElement) => (d.open ? d.dataset.id : null));
  expect(open).not.toBe('37c83b77');
});
