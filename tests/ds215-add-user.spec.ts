import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { uniqueName, uniqueEmail } from '../utils/test-input';

const HAPPY_PATH_PASSWORD = 'Password1!';

test.describe('DS-215: Add user in Settings', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await expect(settingsPage.addUserButton).toBeVisible({ timeout: 15_000 });
  });

  test.describe('Positive flows', () => {
    test(
      'TC-001 — Admin sees the Users section and Add User control on Settings',
      { tag: '@smoke' },
      async () => {
        await expect(settingsPage.usersHeading).toBeVisible();
        await expect(settingsPage.addUserButton).toBeVisible();
      },
    );

    test(
      'TC-002 — Add User form displays required fields',
      { tag: '@sanity' },
      async () => {
        await settingsPage.openAddUserForm();
        const modal = settingsPage.addUserModal;

        await expect.soft(modal.dialog).toBeVisible();
        await expect.soft(modal.nameInput).toBeVisible();
        await expect.soft(modal.emailInput).toBeVisible();
        await expect.soft(modal.passwordInput).toBeVisible();
        await expect.soft(modal.roleInput).toBeVisible();
        await expect.soft(modal.createButton).toBeVisible();
        await expect.soft(modal.roleInput).toHaveValue('EDITOR');
      },
    );

    test(
      'TC-003 — Admin creates a user with the default EDITOR role',
      { tag: '@smoke' },
      async ({ trackUser }) => {
        const name = uniqueName('QA Instructor Elena');
        const email = uniqueEmail();

        trackUser(await settingsPage.createUser(name, email, HAPPY_PATH_PASSWORD));

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userRow(email)).toBeVisible();
        await expect(settingsPage.userRow(email)).toContainText(name);
        await expect(settingsPage.userRow(email)).toContainText('EDITOR');
      },
    );

    test(
      'TC-004 — Admin creates a user with the VIEWER role',
      { tag: '@regression' },
      async ({ trackUser }) => {
        const name = uniqueName('QA Viewer Victor');
        const email = uniqueEmail();

        trackUser(await settingsPage.createUser(name, email, HAPPY_PATH_PASSWORD, 'VIEWER'));

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userRow(email)).toBeVisible();
        await expect(settingsPage.userRow(email)).toContainText('VIEWER');
      },
    );

    test(
      'TC-005 — Admin creates a user with the ADMIN role',
      { tag: '@regression' },
      async ({ trackUser }) => {
        const name = uniqueName('QA Admin Avery');
        const email = uniqueEmail();

        trackUser(await settingsPage.createUser(name, email, HAPPY_PATH_PASSWORD, 'ADMIN'));

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userRow(email)).toBeVisible();
        await expect(settingsPage.userRow(email)).toContainText('ADMIN');
      },
    );

    test(
      'TC-006 — Closing the Add User dialog without submitting does not create a user',
      { tag: '@regression' },
      async () => {
        const name = uniqueName('QA Cancelled User');
        const email = uniqueEmail();

        await settingsPage.openAddUserForm();
        await settingsPage.addUserModal.fill(name, email, HAPPY_PATH_PASSWORD);
        await settingsPage.addUserModal.close();

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userRow(email)).toHaveCount(0);
      },
    );
  });

  test.describe('Negative flows', () => {
    test(
      'TC-007 — Create User is disabled when required fields are empty',
      { tag: '@regression' },
      async () => {
        await settingsPage.openAddUserForm();

        await expect(settingsPage.addUserModal.createButton).toBeDisabled();
      },
    );

    test(
      'TC-008 — Invalid email does not create a user',
      { tag: '@regression' },
      async () => {
        const invalidEmail = 'not-an-email';

        await settingsPage.openAddUserForm();
        await settingsPage.addUserModal.fill(uniqueName('QA Invalid Email'), invalidEmail, HAPPY_PATH_PASSWORD);
        await settingsPage.addUserModal.clickCreate();

        await expect(settingsPage.addUserModal.dialog).toBeVisible();
        await expect(settingsPage.userRow(invalidEmail)).toHaveCount(0);
      },
    );

    test(
      'TC-009 — Duplicate email is rejected',
      { tag: '@regression' },
      async ({ trackUser }) => {
        const email = uniqueEmail('qa-ds215-dup');
        const existingName = uniqueName('QA Existing User');

        trackUser(await settingsPage.createUser(existingName, email, HAPPY_PATH_PASSWORD));

        await settingsPage.openAddUserForm();
        await settingsPage.addUserModal.fill(uniqueName('QA Duplicate Email'), email, HAPPY_PATH_PASSWORD);

        const createResponse = settingsPage.addUserModal.waitForUserCreate();
        await settingsPage.addUserModal.clickCreate();
        const response = await createResponse;
        expect(response.status()).toBe(409);

        await expect(settingsPage.addUserModal.dialog).toBeVisible();
        await expect(settingsPage.userRow(email)).toHaveCount(1);
      },
    );
  });

  test.describe('Edge cases', () => {
    test(
      'TC-011 — Password shorter than 8 characters keeps Create User disabled',
      { tag: '@regression' },
      async () => {
        await settingsPage.openAddUserForm();
        await settingsPage.addUserModal.fill(
          uniqueName('QA Short Password'),
          uniqueEmail(),
          '1234567',
        );

        await expect(settingsPage.addUserModal.createButton).toBeDisabled();
      },
    );

    test(
      'TC-012 — Password of exactly 8 characters enables Create User',
      { tag: '@regression' },
      async () => {
        await settingsPage.openAddUserForm();
        await settingsPage.addUserModal.fill(
          uniqueName('QA Min Password'),
          uniqueEmail(),
          '12345678',
        );

        await expect(settingsPage.addUserModal.createButton).toBeEnabled();
      },
    );

    test(
      'TC-013 — Special characters in the user name are stored as text',
      { tag: '@regression' },
      async ({ trackUser }) => {
        const name = uniqueName("María O'Connor-Smith (QA)");
        const email = uniqueEmail();

        trackUser(await settingsPage.createUser(name, email, HAPPY_PATH_PASSWORD));

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userNameInList(name)).toBeVisible();
        await expect(settingsPage.userRow(email)).toContainText(name);
      },
    );

    test(
      'TC-014 — Plus-addressed email is accepted',
      { tag: '@regression' },
      async ({ trackUser }) => {
        const name = uniqueName('QA Plus Address');
        const email = `qa-ds215-plus+${Date.now()}@college.edu`;

        trackUser(await settingsPage.createUser(name, email, HAPPY_PATH_PASSWORD));

        await expect(settingsPage.addUserModal.dialog).toBeHidden();
        await expect(settingsPage.userRow(email)).toBeVisible();
      },
    );

    test(
      'TC-015 — Keyboard opens the Add User dialog from the Add User button',
      { tag: '@regression' },
      async () => {
        await settingsPage.addUserButton.focus();
        await expect(settingsPage.addUserButton).toBeFocused();
        await settingsPage.page.keyboard.press('Enter');

        await expect(settingsPage.addUserModal.dialog).toBeVisible();
      },
    );

    test.fixme(
      'TC-016 — Add User dialog meets WCAG 2 A/AA',
      {
        tag: '@regression',
        annotation: {
          type: 'bug',
          description:
            'Add User dialog close button has no accessible name (axe button-name, WCAG 4.1.2). Product fix: aria-label on the Mantine Modal close control.',
        },
      },
      async () => {
        await settingsPage.openAddUserForm();

        const accessibilityScanResults = await new AxeBuilder({ page: settingsPage.page })
          .include(settingsPage.addUserModal.axeIncludeSelector())
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      },
    );
  });
});

test.describe('DS-215: Unauthenticated access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'TC-010 — Unauthenticated user is redirected from Settings',
    { tag: '@e2e' },
    async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      const loginPage = new LoginPage(page);

      await page.goto('/settings');

      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.signInButton).toBeVisible();
      await expect(settingsPage.addUserButton).toHaveCount(0);
    },
  );
});
