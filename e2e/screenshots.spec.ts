import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'docs', 'screenshots');

test.describe('portfolio screenshots', () => {
  test('capture home, reservation and legal pages', async ({ page }) => {
    mkdirSync(outDir, { recursive: true });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cookie = page.getByRole('button', { name: /zarur|necessary|необходи/i });
    if (await cookie.isVisible().catch(() => false)) {
      await cookie.click();
    }
    await expect(page.locator('#main-content')).toBeVisible();
    await page.screenshot({
      path: path.join(outDir, 'home-desktop.png'),
      fullPage: false,
    });

    await page.locator('#reservation').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outDir, 'reservation.png'),
      fullPage: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.screenshot({
      path: path.join(outDir, 'home-mobile.png'),
      fullPage: false,
    });
  });
});
