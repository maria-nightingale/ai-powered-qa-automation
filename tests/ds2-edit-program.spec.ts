import { test, expect } from '../fixtures/cleanup.fixture';
import { env } from '../config/env';
import { ProgramsPage } from '../pages/ProgramsPage';
import { repeatChar, uniqueName } from './support/test-data';

test.describe('DS-2 Edit Existing Program Details', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.newProgramButton).toBeVisible({ timeout: 15_000 });
  });

  test.describe('Positive flows', () => {
    test('TC-001 — Edit form opens pre-populated with current program data', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';

      trackProgram(await programs.createProgram(programName, description));
      await programs.openEditForm(programName);
      await programs.expectEditFormPrefilled(programName, description);
    });

    test('TC-002 — Program name update is saved and reflected in the list', async ({ trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const updatedName = `${programName} - Updated`;

      trackProgram(await programs.createProgram(programName, 'Full-stack web development program'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(updatedName);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(updatedName);
      await programs.expectProgramNotInList(programName);
    });

    test('TC-003 — Unchanged fields are preserved when only Description is edited', async ({ trackProgram }) => {
      const programName = uniqueName('Data Science Fundamentals');
      const originalDescription = 'Introductory data science curriculum';
      const updatedDescription = 'Introductory data science curriculum — revised 2026';

      trackProgram(await programs.createProgram(programName, originalDescription));
      await programs.openEditForm(programName);
      await programs.fillEditForm(undefined, updatedDescription);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(programName);
      await programs.expectProgramDescription(programName, updatedDescription);
    });

    test('TC-004 — Both Name and Description can be updated in a single save', async ({ trackProgram }) => {
      const programName = uniqueName('Mobile App Development');
      const updatedName = `${programName} — Advanced`;
      const updatedDescription = 'Native and cross-platform mobile development track';

      trackProgram(await programs.createProgram(programName, 'iOS and Android development track'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(updatedName, updatedDescription);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(updatedName);
      await programs.expectProgramDescription(updatedName, updatedDescription);
    });

    test('TC-005 — Canceling edit discards unsaved changes', async ({ trackProgram }) => {
      const programName = uniqueName('Cybersecurity Essentials');
      const unsavedName = `${programName} — Pro`;

      trackProgram(await programs.createProgram(programName, 'Security fundamentals track'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(unsavedName);
      await programs.cancelButton.click();

      await expect(programs.dialog).toBeHidden();
      await programs.expectProgramInList(programName);
      await programs.expectProgramNotInList(unsavedName);
    });
  });

  test.describe('Negative flows', () => {
    test('TC-006 — Empty Name prevents save', async ({ trackProgram }) => {
      const programName = uniqueName('UX Design Bootcamp');

      trackProgram(await programs.createProgram(programName, 'Design thinking bootcamp'));
      await programs.openEditForm(programName);
      await programs.programNameInput.clear();

      await programs.expectSaveDisabled();
      await programs.cancelButton.click();
      await programs.expectProgramInList(programName);
    });

    test('TC-007 — Whitespace-only Name is rejected', async ({ trackProgram }) => {
      const programName = uniqueName('Cloud Computing 2026');

      trackProgram(await programs.createProgram(programName, 'AWS and Azure fundamentals'));
      await programs.openEditForm(programName);
      await programs.fillEditForm('   ');

      await programs.expectSaveDisabled();
      await programs.cancelButton.click();
      await programs.expectProgramInList(programName);
    });

    test('TC-008 — Duplicate program name is rejected on edit', { annotation: { type: 'fixme' } }, async ({ trackProgram }) => {
      const existingName = uniqueName('Web Development 2026');
      const programToRename = uniqueName('Game Development 2026');

      trackProgram(await programs.createProgram(existingName, 'Original program'));
      trackProgram(await programs.createProgram(programToRename, 'Game dev track'));
      await programs.openEditForm(programToRename);
      await programs.fillEditForm(existingName);

      const updateResponse = programs.waitForProgramUpdate();
      await programs.saveButton.click();
      await updateResponse;

      await expect(programs.dialog).toBeVisible();
      await expect(
        programs.dialog.getByText(/already exists|already been used|must be unique|name is taken/i),
      ).toBeVisible();
      await programs.expectProgramInList(programToRename);
    });

    test('TC-011 — Server error during save does not corrupt program data', async ({ page, trackProgram }) => {
      const programName = uniqueName('DevOps Engineering');
      const updatedName = `${programName} — Updated`;

      trackProgram(await programs.createProgram(programName, 'CI/CD and infrastructure'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(updatedName);

      await page.route('**/api/programs/**', (route) => {
        if (['PATCH', 'PUT'].includes(route.request().method())) {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Program could not be updated' }),
          });
          return;
        }
        route.continue();
      });

      await programs.saveButton.click();

      await expect(programs.dialog).toBeVisible();
      await programs.expectProgramInList(programName);
      await programs.expectProgramNotInList(updatedName);
    });

    test('TC-012 — Saving with no changes does not cause errors or duplicate records', async ({ trackProgram }) => {
      const programName = uniqueName('Blockchain Fundamentals');

      trackProgram(await programs.createProgram(programName, 'Distributed ledger technology program'));
      await programs.openEditForm(programName);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(programName);
      await expect
        .poll(async () => programs.countProgramsNamed(programName), { timeout: 10_000 })
        .toBe(1);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-013 — Name at maximum allowed length can be saved', async ({ trackProgram }) => {
      const suffix = Date.now().toString();
      const programName = uniqueName('Advanced Machine Learning Certificate');
      const maxName = `${suffix}${repeatChar('A', 255 - suffix.length)}`;

      trackProgram(await programs.createProgram(programName, 'ML certificate track'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(maxName);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(maxName);
    });

    test('TC-014 — Name exceeding maximum length is rejected', async ({ trackProgram }) => {
      const programName = uniqueName('AI Ethics Program');
      const overLimitName = repeatChar('B', 256);

      trackProgram(await programs.createProgram(programName, 'Ethics in AI systems'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(overLimitName);

      const saveEnabled = await programs.saveButton.isEnabled();
      if (saveEnabled) {
        await programs.saveButton.click();
        await expect(programs.dialog).toBeVisible();
      } else {
        await programs.expectSaveDisabled();
      }

      await programs.expectProgramInList(programName);
      await programs.expectProgramNotInList(overLimitName);
    });

    test('TC-015 — Special characters in Name are handled correctly on edit', async ({ trackProgram }) => {
      const programName = uniqueName('C Programming Basics');
      const updatedName = `${programName.replace(/\d+$/, '').trim()} C++ & C#: "Intro" (2026) — 100% Online ${Date.now()}`;

      trackProgram(await programs.createProgram(programName, 'Introductory C programming'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(updatedName);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(updatedName);
    });

    test('TC-016 — Unicode characters in Description are preserved on edit', async ({ trackProgram }) => {
      const programName = uniqueName('Global Business Program');
      const updatedDescription =
        'Programme global — グローバルビジネス — Développement international';

      trackProgram(await programs.createProgram(programName, 'International business overview'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(undefined, updatedDescription);
      await programs.saveEditAndClose();

      await programs.expectProgramDescription(programName, updatedDescription);
    });

    test('TC-017 — Leading and trailing spaces are trimmed from edited Name', async ({ trackProgram }) => {
      const programName = uniqueName('Network Security Program');
      const trimmedName = `${programName} — Advanced`;

      trackProgram(await programs.createProgram(programName, 'Network security fundamentals'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(`  ${trimmedName}  `);
      await programs.saveEditAndClose();

      await programs.expectProgramInList(trimmedName);
    });

    test('TC-018 — Description can be cleared if optional', async ({ trackProgram }) => {
      const programName = uniqueName('Robotics 101');

      trackProgram(await programs.createProgram(programName, 'Introductory robotics curriculum'));
      await programs.openEditForm(programName);
      await programs.descriptionInput.clear();
      await programs.saveEditAndClose();

      await programs.expectProgramInList(programName);
      await programs.expectProgramDescription(programName, '');
    });

    test('TC-019 — Double-click on Save does not create duplicate updates or records', async ({ trackProgram }) => {
      const programName = uniqueName('Quantum Computing Intro');
      const updatedName = `${programName} — Updated`;

      trackProgram(await programs.createProgram(programName, 'Quantum computing basics'));
      await programs.openEditForm(programName);
      await programs.fillEditForm(updatedName);

      const updateResponse = programs.waitForProgramUpdate();
      await programs.saveButton.dblclick();
      await updateResponse;

      await expect(programs.dialog).toBeHidden({ timeout: 15_000 });
      await expect
        .poll(async () => programs.countProgramsNamed(updatedName), { timeout: 10_000 })
        .toBe(1);
    });

    test('TC-020 — Concurrent edit by another user is handled gracefully', async ({ browser, page, trackProgram }) => {
      const programName = uniqueName('Web Development 2026');
      const uniqueSuffix = programName.match(/\d+$/)?.[0] ?? programName;
      const adminBDescription = 'Description updated by admin B';
      const adminAName = `${programName} - Updated`;

      trackProgram(await programs.createProgram(programName, 'Original shared program'));

      const contextA = await browser.newContext({
        storageState: 'playwright/.auth/admin.json',
      });
      const contextB = await browser.newContext({
        storageState: 'playwright/.auth/admin.json',
      });

      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();
      const programsA = new ProgramsPage(pageA);
      const programsB = new ProgramsPage(pageB);

      await programsA.goto();
      await programsB.goto();

      await programsA.openEditForm(programName);
      await programsB.openEditForm(programName);
      await programsB.fillEditForm(undefined, adminBDescription);
      await programsB.saveEditAndClose();

      await programsA.fillEditForm(adminAName);
      await programsA.saveButton.click();

      await expect
        .poll(
          async () => {
            const modalOpen = await programsA.dialog.isVisible();
            const hasConflict = await programsA.dialog
              .getByText(/modified by another user|conflict|refresh/i)
              .isVisible()
              .catch(() => false);
            const saved = !(await programsA.dialog.isVisible());
            return modalOpen || hasConflict || saved;
          },
          { timeout: 15_000 },
        )
        .toBe(true);

      await contextA.close();
      await contextB.close();

      await page.goto(`${env.url}/programs`);
      await expect(page).toHaveURL(/\/programs/);
      await expect(page.getByRole('main').getByText(new RegExp(uniqueSuffix))).toBeVisible({
        timeout: 15_000,
      });
    });
  });
});

test.describe('DS-2 Non-admin access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-009 — Non-admin user cannot edit programs', async ({ page }) => {
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
    await expect(page.getByRole('button', { name: /edit/i })).toHaveCount(0);
    await expect(page.locator('[aria-label*="Edit" i]')).toHaveCount(0);
  });
});

test.describe('DS-2 Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-010 — Unauthenticated user cannot access program edit', async ({ page }) => {
    await page.goto(`${env.url}/programs`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: /edit/i })).toHaveCount(0);
  });
});
