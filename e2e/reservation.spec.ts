import { expect, test } from '@playwright/test';

const tomorrow = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

test.describe('AURORA site', () => {
  test('home, sitemap and robots are reachable', async ({ page, request }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AURORA/i);
    await expect(page.locator('#main-content')).toBeVisible();

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain('privacy');
    expect(sitemapText).toContain('terms');

    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap');
  });

  test('legal pages render', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/cookies');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('selects a table, submits a reservation, and shows a voucher', async ({
    page,
  }) => {
    await page.goto('/#reservation');

    const cookie = page.getByRole('button', { name: /zarur|necessary|необходи/i });
    if (await cookie.isVisible().catch(() => false)) {
      await cookie.click();
    }

    await expect(page.getByTestId('reservation-form')).toBeVisible();
    await page.getByLabel('Ism').fill('Playwright Mehmon');
    await page.getByLabel('Telefon').fill('998901234567');
    await page.getByLabel('Email').fill('e2e@aurora.test');
    await page.getByLabel('Mehmonlar soni').selectOption('2');
    const dateInput = page.locator('#reservation_date');
    await dateInput.fill(tomorrow());
    await dateInput.blur();
    await page.locator('label').filter({ hasText: '21:00' }).click();

    await expect(page.getByText(/avval sana va vaqt/i)).toHaveCount(0, {
      timeout: 10_000,
    });
    await expect(page.getByTestId('table-1')).toBeEnabled({ timeout: 20_000 });
    await page.getByTestId('table-1').click();

    await page.getByTestId('submit-reservation').click();

    const voucher = page.getByTestId('reservation-voucher');
    await expect(voucher).toBeVisible({ timeout: 20_000 });
    await expect(voucher).toContainText('Playwright Mehmon');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-voucher').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().toLowerCase()).toContain('pdf');
  });
});
