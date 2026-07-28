import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '@playwright/test';
import { env } from '../config/env';
import { LoginPage } from '../pages/LoginPage';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as Didaxis admin', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.signIn(env.email, env.password);
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  await expect(page.getByRole('button', { name: /programs/i })).toBeVisible();
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
