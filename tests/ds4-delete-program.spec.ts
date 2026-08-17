import { test, expect } from '../fixtures/cleanup.fixture';
import { env } from '../config/env';
import { ProgramsPage } from '../pages/ProgramsPage';
import { LoginPage } from '../pages/LoginPage';
import { uniqueName } from '../utils/test-input';

test.describe('DS-4: Delete program with confirmation', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Delete program with confirmation', async ({ trackProgram }) => {
      const programName = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(programName, 'Program scheduled for deletion'));
      await programsPage.openDeleteConfirmation(programName);
      await programsPage.confirmDeleteAndClose();

      await programsPage.expectProgramNotInList(programName);
    });

    test('TC-002 — Cancel program deletion', async ({ trackProgram }) => {
      const programName = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(programName, 'Program to keep after cancel'));
      await programsPage.openDeleteConfirmation(programName);
      await programsPage.cancelDelete();

      await programsPage.expectProgramInList(programName);
    });
  });

  test.describe('Negative flows', () => {
    test('TC-005 — Server error during delete does not remove the program', async ({ page, trackProgram }) => {
      const programName = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(programName, 'Program protected from failed delete'));
      await programsPage.openDeleteConfirmation(programName);

      await page.route('**/api/programs/**', (route) => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Program could not be deleted' }),
          });
          return;
        }
        route.continue();
      });

      await programsPage.deleteProgramDialog.clickConfirm();

      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(1);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-006 — Double-click on confirm does not cause errors', async ({ trackProgram }) => {
      const programName = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(programName, 'Double-click delete test'));
      await programsPage.openDeleteConfirmation(programName);

      const deleteResponse = programsPage.waitForProgramDelete();
      await programsPage.deleteProgramDialog.confirmButton.dblclick();
      await deleteResponse;

      await expect(programsPage.deleteProgramDialog.dialog).toBeHidden({ timeout: 15_000 });
      await programsPage.expectProgramNotInList(programName);
    });

    test('TC-007 — Confirmation dialog appears before any deletion occurs', async ({ trackProgram }) => {
      const programName = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(programName, 'Pre-confirm list check'));
      await programsPage.openDeleteConfirmation(programName);

      await expect(programsPage.deleteProgramDialog.dialog).toBeVisible();
      await programsPage.expectProgramInList(programName);
    });
  });
});

test.describe('DS-4 Non-admin access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-003 — Non-admin user cannot delete programs', async ({ page }) => {
    test.skip(
      !env.nonAdminEmail || !env.nonAdminPassword,
      'Skipped: no non-admin credentials in .env. Set DIDAXIS_INSTRUCTOR_EMAIL and DIDAXIS_INSTRUCTOR_PASSWORD to run this test.',
    );

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.signIn(env.nonAdminEmail, env.nonAdminPassword);
    await expect(page).not.toHaveURL(/\/login$/);

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);
  });
});

test.describe('DS-4 Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-004 — Unauthenticated user cannot access program deletion', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.signInButton).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);
  });
});
