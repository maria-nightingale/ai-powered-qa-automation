import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { env } from '../config/env';
import { ProgramsPage } from '../pages/ProgramsPage';
import { LoginPage } from '../pages/LoginPage';
import { repeatChar, uniqueName } from '../utils/test-input';
import type { Page, Route } from '@playwright/test';

function mockProgramsListGet(page: Page, fulfill: (route: Route) => void): Promise<void> {
  return page.route('**/api/programs', (route) => {
    if (route.request().method() === 'GET') {
      fulfill(route);
      return;
    }
    route.continue();
  });
}

test.describe('DS-5: Program list filtering and display', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Display program list with key details', async ({ trackProgram }) => {
      const programName = uniqueName('Computer Science BSc');
      const description = 'Undergraduate CS degree track';

      await programsPage.goto();
      await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });

      trackProgram(await programsPage.createProgram(programName, description));

      await programsPage.expectProgramInList(programName);
      await expect(programsPage.programRow(programName)).toContainText(description);
    });

    test('TC-002 — Multiple programs each show name and description', async ({ trackProgram }) => {
      const firstName = uniqueName('Data Science MSc');
      const firstDescription = 'Graduate data science track';
      const secondName = uniqueName('Web Development Certificate');
      const secondDescription = 'Full-stack web skills';

      await programsPage.goto();
      await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });

      trackProgram(await programsPage.createProgram(firstName, firstDescription));
      trackProgram(await programsPage.createProgram(secondName, secondDescription));

      await programsPage.expectProgramInList(firstName);
      await programsPage.expectProgramInList(secondName);
      await expect(programsPage.programRow(firstName)).toContainText(firstDescription);
      await expect(programsPage.programRow(secondName)).toContainText(secondDescription);
    });

    test('TC-003 — Empty state when no programs exist', async ({ page }) => {
      await mockProgramsListGet(page, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
      });

      await programsPage.goto();
      await expect(page).toHaveURL(/\/programs/);

      await expect(programsPage.emptyStateMessage).toBeVisible({ timeout: 15_000 });
      await expect(programsPage.emptyStateCreatePrompt).toBeVisible();
      await expect(programsPage.programInList('Computer Science BSc')).toHaveCount(0);
    });
  });

  test.describe('Negative flows', () => {
    test('TC-006 — Programs API 500 shows an error, not an empty success state', async ({ page }) => {
      await mockProgramsListGet(page, (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' }),
        });
      });

      await programsPage.goto();
      await expect(page).toHaveURL(/\/programs/);
      await expect(programsPage.programsLoadError).toBeVisible({ timeout: 15_000 });
      await expect(programsPage.emptyStateSuccessMessage).toHaveCount(0);
    });

    test('TC-007 — Malformed programs API response shows an error, not a blank page', async ({ page }) => {
      await mockProgramsListGet(page, (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{not-valid-json',
        });
      });

      await programsPage.goto();
      await expect(page).toHaveURL(/\/programs/);
      await expect(programsPage.programsListView).toBeVisible();
      await expect(programsPage.programsLoadError).toBeVisible({ timeout: 15_000 });
    });
  });

  test.describe('Edge cases', () => {
    test.beforeEach(async ({ page }) => {
      await programsPage.goto();
      await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });
    });

    test('TC-008 — Program with empty description still appears in the list', async ({ trackProgram }) => {
      const programName = uniqueName('Philosophy BA');

      trackProgram(await programsPage.createProgram(programName, ''));

      await programsPage.expectProgramInList(programName);
    });

    test('TC-009 — Long program name and description remain visible in the list', async ({ trackProgram }) => {
      const suffix = Date.now().toString();
      const programName = `${suffix}${repeatChar('A', 255 - suffix.length)}`;
      const description = repeatChar('Long description segment. ', 40);

      trackProgram(await programsPage.createProgram(programName, description));

      await expect(programsPage.programInList(programName).first()).toBeVisible();
      const row = programsPage.programRow(programName);
      await expect(row).toBeVisible();
      await expect(row).toContainText(programName.slice(0, 40));
      await expect(row).toContainText(description.slice(0, 30));
    });

    test('TC-010 — Special characters in name and description render as text', async ({ trackProgram }) => {
      const programName = uniqueName('C++ & C# Foundations');
      const description = 'Covers <algorithms> & "data structures"';

      trackProgram(await programsPage.createProgram(programName, description));

      await programsPage.expectProgramInList(programName);
      await expect(programsPage.programRow(programName)).toContainText(description);
    });

    test('TC-011 — HTML in description is not executed as markup', async ({ page, trackProgram }) => {
      const programName = uniqueName('Security Basics');
      const description = '<img src=x onerror=alert(1)>XSS probe';
      let dialogOpened = false;

      page.on('dialog', () => {
        dialogOpened = true;
      });

      trackProgram(await programsPage.createProgram(programName, description));

      await programsPage.goto();
      await programsPage.expectProgramInList(programName);

      expect(dialogOpened).toBe(false);
      await expect(programsPage.programRow(programName).locator('img')).toHaveCount(0);
      await expect(programsPage.programRow(programName)).toContainText('XSS probe');
    });

    test('TC-012 — Programs page meets WCAG 2 A/AA for the program list', async ({ trackProgram }) => {
      const programName = uniqueName('Accessibility Audit Program');

      trackProgram(await programsPage.createProgram(programName, 'Program used for list accessibility scan'));

      await programsPage.expectProgramInList(programName);

      const accessibilityScanResults = await new AxeBuilder({ page: programsPage.page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});

test.describe('DS-5 Non-admin access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-004 — Non-admin user can view the program list but not manage programs', async ({ page }) => {
    test.skip(
      !env.nonAdminEmail || !env.nonAdminPassword,
      'Skipped: no non-admin credentials in .env. Set DIDAXIS_INSTRUCTOR_EMAIL and DIDAXIS_INSTRUCTOR_PASSWORD to run this test.',
    );

    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await loginPage.goto();
    await loginPage.signIn(env.nonAdminEmail, env.nonAdminPassword);
    await expect(page).not.toHaveURL(/\/login$/);

    await programsPage.goto();
    await expect(page).toHaveURL(/\/programs/);
    await expect(programsPage.newProgramButton).toHaveCount(0);
  });
});

test.describe('DS-5 Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-005 — Unauthenticated user is redirected from the Programs page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.signInButton).toBeVisible();
    await expect(programsPage.newProgramButton).toHaveCount(0);
  });
});
