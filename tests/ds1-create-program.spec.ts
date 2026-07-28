import { test, expect } from '../fixtures/cleanup.fixture';
import { extractProgramId } from '../fixtures/program-api';
import { ProgramsPage } from '../pages/ProgramsPage';
import { env } from '../config/env';
import { repeatChar, uniqueName } from './support/test-data';

test.describe('DS-1 Create New Academic Program', () => {
  let programsPage: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.newProgramButton).toBeVisible({ timeout: 15_000 });
  });

  test.describe('Positive flows', () => {
    test('TC-001 — Program creation form displays required fields', async () => {
      await programsPage.openNewProgramForm();
      const modal = programsPage.newProgramModal;

      await expect(modal.programNameInput).toBeVisible();
      await expect(modal.descriptionInput).toBeVisible();
      await expect(modal.createButton).toBeVisible();
    });

    test('TC-002 — New program is created and appears in the program list', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026_MASHA_TEST');
      const description = 'Full-stack web development program';

      trackProgram(await programsPage.createProgram(programName, description));

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-003 — Program can be created with Program Name only', async ({ trackProgram }) => {
      const programName = uniqueName('Data Science Fundamentals');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName);
      const uuid = await programsPage.newProgramModal.submitCreate();
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 15_000 });
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-004 — Canceling the form does not create a program', async () => {
      const programName = uniqueName('Mobile App Development');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'iOS and Android development track');
      await programsPage.newProgramModal.clickCancel();

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programInList(programName)).toHaveCount(0);
    });
  });

  test.describe('Negative flows', () => {
    test('TC-005 — Create button is disabled when Program Name is empty', async () => {
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.descriptionInput.fill('Optional description text');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });

    test('TC-006 — Whitespace-only Program Name is treated as empty', async () => {
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill('   ', 'Optional description text');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });

    test('TC-009 — Duplicate program name is rejected', { annotation: { type: 'fixme' } }, async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026_MASHA_TEST');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(programName, 'Original program'));
      const countBefore = await programsPage.countProgramsNamed(programName);

      await programsPage.openNewProgramForm();
      await modal.fill(programName, 'Second program with the same name');

      const createResponse = programsPage.waitForProgramCreate();
      await modal.clickCreate();
      await createResponse;

      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(countBefore);
      await expect(modal.dialog).toBeVisible();
      await expect(modal.duplicateNameError).toBeVisible();
    });

    test('TC-010 — Program is not created when server returns an error', async ({ page }) => {
      const programName = uniqueName('Cloud Computing 2026');

      await page.route('**/api/programs', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Program could not be created' }),
          });
          return;
        }
        route.continue();
      });

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'AWS and Azure fundamentals');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programInList(programName)).toHaveCount(0);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-011 — Program Name at minimum valid length (1 character)', async ({ trackProgram }) => {
      const programName = uniqueName('A');

      trackProgram(await programsPage.createProgram(programName, 'Single-character name boundary test'));

      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-012 — Program Name at maximum allowed length', async ({ trackProgram }) => {
      const suffix = Date.now().toString();
      const programName = `${suffix}${repeatChar('A', 255 - suffix.length)}`;

      trackProgram(await programsPage.createProgram(programName, 'Max length boundary test'));

      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-013 — Program Name exceeding maximum length is rejected', async () => {
      const programName = repeatChar('B', 256);

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, 'Over max length test');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programInList(programName)).toHaveCount(0);
    });

    test('TC-014 — Special characters in Program Name are handled correctly', async ({ trackProgram }) => {
      const programName = uniqueName('C++ & C#: "Intro" (2026) — 100% Online');

      trackProgram(await programsPage.createProgram(programName, 'Special characters validation test'));
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-015 — Unicode and international characters in Program Name', async ({ trackProgram }) => {
      const programName = uniqueName('プログラム開発 2026 — Développement Web');

      trackProgram(
        await programsPage.createProgram(programName, 'Unicode and international character support test'),
      );
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-016 — Leading and trailing spaces are trimmed from Program Name', async ({ trackProgram }) => {
      const programName = uniqueName('Cybersecurity Essentials');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(`  ${programName}  `, 'Trim behavior test');
      const uuid = await programsPage.newProgramModal.submitCreate();
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 15_000 });
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-017 — Description at maximum allowed length', async ({ trackProgram }) => {
      const programName = uniqueName('UX Design Bootcamp');
      const description = repeatChar('D', 2000);

      trackProgram(await programsPage.createProgram(programName, description));
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });

    test('TC-018 — Description exceeding maximum length is rejected', async () => {
      const programName = uniqueName('DevOps Engineering');
      const description = repeatChar('E', 2001);

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fill(programName, description);
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.programInList(programName)).toHaveCount(0);
    });

    test('TC-019 — Double-click on Create does not create duplicate programs', { annotation: { type: 'fixme' } }, async ({ trackProgram }) => {
      const programName = uniqueName('Blockchain Fundamentals');
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fill(programName, 'Distributed ledger technology program');

      const createResponse = programsPage.waitForSuccessfulProgramCreate();
      await modal.createButton.dblclick();
      const response = await createResponse;
      const uuid = extractProgramId(await response.json());
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(modal.dialog).toBeHidden({ timeout: 15_000 });
      await expect
        .poll(async () => programsPage.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(1);
    });

    test('TC-020 — Program list updates without manual page refresh', async ({ page, trackProgram }) => {
      const programName = uniqueName('Game Development 2026');
      const urlBefore = page.url();

      trackProgram(await programsPage.createProgram(programName, 'Unity and Unreal Engine track'));

      expect(page.url()).toBe(urlBefore);
      await expect(programsPage.programInList(programName).first()).toBeVisible();
    });
  });
});

test.describe('DS-1 Non-admin access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-007 — Non-admin user cannot access program creation', async ({ page }) => {
    test.skip(
      !env.nonAdminEmail || !env.nonAdminPassword,
      'Skipped: no non-admin credentials in .env. Set DIDAXIS_INSTRUCTOR_EMAIL and DIDAXIS_INSTRUCTOR_PASSWORD to run this test.',
    );

    await page.goto(`${env.url}/login`);
    await page
      .getByLabel('Email')
      .or(page.getByPlaceholder('you@college.edu'))
      .fill(env.nonAdminEmail);
    await page
      .getByLabel('Password')
      .or(page.getByPlaceholder('Your password'))
      .fill(env.nonAdminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).not.toHaveURL(/\/login$/);

    const programsPage = new ProgramsPage(page);
    await page.goto(`${env.url}/programs`);
    await expect(programsPage.newProgramButton).toHaveCount(0);
  });
});

test.describe('DS-1 Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-008 — Unauthenticated user cannot access program creation', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await programsPage.goto();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(programsPage.newProgramButton).toHaveCount(0);
  });
});
