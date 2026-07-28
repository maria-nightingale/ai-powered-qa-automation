import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from './DS-1/test-data';

test.describe('DS-3 Program name validation and duplicate prevention', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Program name with special characters is accepted', async ({ trackProgram }) => {
      const programName = uniqueName('Informatique & IA - Niveau 2');

      trackProgram(await programsPage.createProgram(programName, 'French-language AI and informatics track'));

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });
  });

  test.describe('Negative flows', () => {
    test('TC-002 — Whitespace-only program name is rejected', async () => {
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill('   ', 'Optional description text');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });

    test('TC-003 — Duplicate program name is rejected', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(programName, 'Original program'));
      const countBefore = await programsPage.countProgramsNamed(programName);

      await programsPage.openNewProgramForm();
      await modal.fill(programName, 'Second program with the same name');

      const createResponse = programsPage.page.waitForResponse(
        (response) =>
          response.url().includes('/api/programs') && response.request().method() === 'POST',
      );
      await modal.clickCreate();
      await createResponse;

      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(countBefore);
      await expect(modal.dialog).toBeVisible();
      await expect(modal.duplicateNameError).toBeVisible();
    });

    test('TC-004 — Empty program name prevents submission', async () => {
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.descriptionInput.fill('Optional description text');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });
  });

  test.describe('Edge cases', () => {
    test('TC-005 — Case-variant duplicate program name is rejected', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const variantName = programName.replace(/Web Development/i, 'web development');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(programName, 'Original program'));
      const countBefore = await programsPage.countProgramsNamed(programName);

      await programsPage.openNewProgramForm();
      await modal.fill(variantName, 'Case-variant duplicate attempt');

      const createResponse = programsPage.page.waitForResponse(
        (response) =>
          response.url().includes('/api/programs') && response.request().method() === 'POST',
      );
      await modal.clickCreate();
      await createResponse;

      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(countBefore);
      await expect(modal.dialog).toBeVisible();
      await expect(modal.duplicateNameError).toBeVisible();
    });

    test('TC-006 — Duplicate name with trailing spaces is rejected after trim', async ({
      trackProgram,
    }) => {
      const programName = uniqueName('Web Development 2026');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(programName, 'Original program'));
      const countBefore = await programsPage.countProgramsNamed(programName);

      await programsPage.openNewProgramForm();
      await modal.fill(`${programName}   `, 'Trailing-space duplicate attempt');

      const createResponse = programsPage.page.waitForResponse(
        (response) =>
          response.url().includes('/api/programs') && response.request().method() === 'POST',
      );
      await modal.clickCreate();
      await createResponse;

      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(countBefore);
      await expect(modal.dialog).toBeVisible();
      await expect(modal.duplicateNameError).toBeVisible();
    });

    test('TC-007 — Program name with internal multiple spaces is accepted', async ({ trackProgram }) => {
      const programName = uniqueName('Data   Science   2026');

      trackProgram(await programsPage.createProgram(programName, 'Internal spacing preserved'));

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });
  });
});
