import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
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

async function gotoEmptyProgramsPage(page: Page, programsPage: ProgramsPage): Promise<void> {
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
  await expect(programsPage.emptyStateCreateButton).toBeVisible();
}

test.describe('Empty state create program call-to-action', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
  });

  test.describe('Happy paths', () => {
    test(
      'TC-001 — Create Program button in empty state opens the new program modal',
      { tag: '@regression' },
      async ({ page }) => {
        await gotoEmptyProgramsPage(page, programsPage);

        await programsPage.openNewProgramFormFromEmptyState();

        const modal = programsPage.newProgramModal;
        await expect(modal.dialog).toBeVisible();
        await expect.soft(modal.programNameInput).toBeVisible();
        await expect.soft(modal.descriptionInput).toBeVisible();
        await expect.soft(modal.createButton).toBeDisabled();
      },
    );
  });

  test.describe('Edge cases', () => {
    test(
      'TC-002 — Create Program empty-state CTA is keyboard activatable',
      { tag: '@regression' },
      async ({ page }) => {
        await gotoEmptyProgramsPage(page, programsPage);

        await programsPage.focusEmptyStateCreateButton();
        await expect(programsPage.emptyStateCreateButton).toBeFocused();
        await page.keyboard.press('Enter');

        await expect(programsPage.newProgramModal.dialog).toBeVisible();
      },
    );
  });
});
