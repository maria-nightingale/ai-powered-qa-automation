import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../utils/test-input';
import type { Page, Route } from '@playwright/test';

function mockProgramsApi(
  page: Page,
  handler: (route: Route) => Promise<void> | void,
): Promise<void> {
  return page.route('**/api/programs**', async (route) => {
    await handler(route);
  });
}

test.describe('Programs API network edges', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
  });

  test(
    'TC-001 — Create program stays open when save API returns 503',
    { tag: '@regression' },
    async ({ page }) => {
      const programName = uniqueName('503 Save Failure Probe');

      await mockProgramsApi(page, (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Service unavailable' }),
          });
        }
        return route.continue();
      });

      await programsPage.goto();
      await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Observed 503 save edge case');
      await programsPage.newProgramModal.clickCreate();

      // Observed on live UI (Playwright MCP / browser): no alert or inline error copy —
      // modal stays open and the program is not listed.
      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programInList(programName)).toHaveCount(0);
    },
  );

  test(
    'TC-002 — Programs list shows empty state when API returns no programs',
    { tag: '@regression' },
    async ({ page }) => {
      await mockProgramsApi(page, (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] }),
          });
        }
        return route.continue();
      });

      await programsPage.goto();
      await expect(page).toHaveURL(/\/programs/);

      // Observed copy: "No programs yet. Create your first program to get started."
      await expect(programsPage.emptyStateMessage).toBeVisible({ timeout: 15_000 });
      await expect(programsPage.emptyStateCreatePrompt).toBeVisible();
    },
  );

  test(
    'TC-003 — Malformed programs API response does not navigate away from Programs',
    { tag: '@regression' },
    async ({ page }) => {
      await mockProgramsApi(page, (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{not-valid-json',
          });
        }
        return route.continue();
      });

      await programsPage.goto();

      // Observed: no error banner and main content may be blank — assert survival only.
      await expect(page).toHaveURL(/\/programs/);
      await expect(page).toHaveTitle(/Didaxis Studio/i);
    },
  );
});
