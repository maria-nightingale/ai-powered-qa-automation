import { test as setup, expect } from '@playwright/test';
import { env } from './env';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as Didaxis admin', async ({ page }) => {
  await page.goto(`${env.url}/login`);
  await page
    .getByLabel('Email')
    .or(page.getByPlaceholder('you@college.edu'))
    .fill(env.email);
  await page
    .getByLabel('Password')
    .or(page.getByPlaceholder('Your password'))
    .fill(env.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  await expect(page.getByRole('button', { name: /programs/i })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
