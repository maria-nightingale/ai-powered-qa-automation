import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing DIDAXIS_EMAIL or DIDAXIS_PASSWORD environment variables');
  }

  await page.goto('https://test.didaxis.studio/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  await expect(page.getByRole('button', { name: /programs/i })).toBeVisible();
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
