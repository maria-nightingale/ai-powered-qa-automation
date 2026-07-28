import { test, expect } from '../fixtures/cleanup.fixture';
import { extractProgramId } from '../fixtures/program-api';
import { env } from './DS-1/env';
import { ProgramsPage } from './DS-1/programs.page';
import { repeatChar, uniqueName } from './DS-1/test-data';

test.describe('DS-1 Create New Academic Program', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.openProgramsPage();
  });

  test.describe('Positive flows', () => {
    test('TC-001 — Program creation form displays required fields', async () => {
      await programs.openNewProgramForm();

      await expect(programs.programNameInput).toBeVisible();
      await expect(programs.descriptionInput).toBeVisible();
      await expect(programs.createButton).toBeVisible();
    });

    test('TC-002 — New program is created and appears in the program list', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026_MASHA_TEST');
      const description = 'Full-stack web development program';

      trackProgram(await programs.createProgram(programName, description));

      await expect(programs.dialog).toBeHidden();
      await programs.expectProgramInList(programName);
    });

    test('TC-003 — Program can be created with Program Name only', async ({ trackProgram }) => {
      const programName = uniqueName('Data Science Fundamentals');

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName);
      const uuid = await programs.submitCreateForm();
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(programs.dialog).toBeHidden({ timeout: 15_000 });
      await programs.expectProgramInList(programName);
    });

    test('TC-004 — Canceling the form does not create a program', async () => {
      const programName = uniqueName('Mobile App Development');

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, 'iOS and Android development track');
      await programs.cancelButton.click();

      await expect(programs.dialog).toBeHidden();
      await programs.expectProgramNotInList(programName);
    });
  });

  test.describe('Negative flows', () => {
    test('TC-005 — Create button is disabled when Program Name is empty', async () => {
      await programs.openNewProgramForm();
      await programs.descriptionInput.fill('Optional description text');

      await programs.expectCreateDisabled();
    });

    test('TC-006 — Whitespace-only Program Name is treated as empty', async () => {
      await programs.openNewProgramForm();
      await programs.fillProgramForm('   ', 'Optional description text');

      await programs.expectCreateDisabled();
    });

    test('TC-009 — Duplicate program name is rejected', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026_MASHA_TEST');

      trackProgram(await programs.createProgram(programName, 'Original program'));
      const countBefore = await programs.countProgramsNamed(programName);

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, 'Second program with the same name');

      const createResponse = programs.page.waitForResponse(
        (response) =>
          response.url().includes('/api/programs') && response.request().method() === 'POST',
      );
      await programs.createButton.click();
      await createResponse;

      await expect
        .poll(async () => programs.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(countBefore);
      await expect(programs.dialog).toBeVisible();
      await expect(
        programs.dialog.getByText(/already exists|already been used|must be unique|name is taken/i),
      ).toBeVisible();
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

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, 'AWS and Azure fundamentals');
      await programs.createButton.click();

      await expect(programs.dialog).toBeVisible();
      await programs.expectProgramNotInList(programName);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-011 — Program Name at minimum valid length (1 character)', async ({ trackProgram }) => {
      const programName = uniqueName('A');

      trackProgram(await programs.createProgram(programName, 'Single-character name boundary test'));

      await programs.expectProgramInList(programName);
    });

    test('TC-012 — Program Name at maximum allowed length', async ({ trackProgram }) => {
      const suffix = Date.now().toString();
      const programName = `${suffix}${repeatChar('A', 255 - suffix.length)}`;

      trackProgram(await programs.createProgram(programName, 'Max length boundary test'));

      await programs.expectProgramInList(programName);
    });

    test('TC-013 — Program Name exceeding maximum length is rejected', async () => {
      const programName = repeatChar('B', 256);

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, 'Over max length test');
      await programs.createButton.click();

      await expect(programs.dialog).toBeVisible();
      await programs.expectProgramNotInList(programName);
    });

    test('TC-014 — Special characters in Program Name are handled correctly', async ({ trackProgram }) => {
      const programName = uniqueName('C++ & C#: "Intro" (2026) — 100% Online');

      trackProgram(await programs.createProgram(programName, 'Special characters validation test'));
      await programs.expectProgramInList(programName);
    });

    test('TC-015 — Unicode and international characters in Program Name', async ({ trackProgram }) => {
      const programName = uniqueName('プログラム開発 2026 — Développement Web');

      trackProgram(
        await programs.createProgram(programName, 'Unicode and international character support test'),
      );
      await programs.expectProgramInList(programName);
    });

    test('TC-016 — Leading and trailing spaces are trimmed from Program Name', async ({ trackProgram }) => {
      const programName = uniqueName('Cybersecurity Essentials');

      await programs.openNewProgramForm();
      await programs.fillProgramForm(`  ${programName}  `, 'Trim behavior test');
      const uuid = await programs.submitCreateForm();
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(programs.dialog).toBeHidden({ timeout: 15_000 });
      await programs.expectProgramInList(programName);
    });

    test('TC-017 — Description at maximum allowed length', async ({ trackProgram }) => {
      const programName = uniqueName('UX Design Bootcamp');
      const description = repeatChar('D', 2000);

      trackProgram(await programs.createProgram(programName, description));
      await programs.expectProgramInList(programName);
    });

    test('TC-018 — Description exceeding maximum length is rejected', async () => {
      const programName = uniqueName('DevOps Engineering');
      const description = repeatChar('E', 2001);

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, description);
      await programs.createButton.click();

      await expect(programs.dialog).toBeVisible();
      await programs.expectProgramNotInList(programName);
    });

    test('TC-019 — Double-click on Create does not create duplicate programs', async ({ trackProgram }) => {
      const programName = uniqueName('Blockchain Fundamentals');

      await programs.openNewProgramForm();
      await programs.fillProgramForm(programName, 'Distributed ledger technology program');

      const createResponse = programs.page.waitForResponse(
        (response) =>
          response.url().includes('/api/programs') &&
          response.request().method() === 'POST' &&
          response.ok(),
      );
      await programs.createButton.dblclick();
      const response = await createResponse;
      const uuid = extractProgramId(await response.json());
      if (uuid) {
        trackProgram(uuid);
      }

      await expect(programs.dialog).toBeHidden({ timeout: 15_000 });
      await expect
        .poll(async () => programs.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(1);
    });

    test('TC-020 — Program list updates without manual page refresh', async ({ page, trackProgram }) => {
      const programName = uniqueName('Game Development 2026');
      const urlBefore = page.url();

      trackProgram(await programs.createProgram(programName, 'Unity and Unreal Engine track'));

      expect(page.url()).toBe(urlBefore);
      await programs.expectProgramInList(programName);
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

    await page.goto(`${env.url}/programs`);
    await expect(page.getByRole('button', { name: /new program/i })).toHaveCount(0);
  });
});

test.describe('DS-1 Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-008 — Unauthenticated user cannot access program creation', async ({ page }) => {
    await page.goto(`${env.url}/programs`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: /new program/i })).toHaveCount(0);
  });
});
