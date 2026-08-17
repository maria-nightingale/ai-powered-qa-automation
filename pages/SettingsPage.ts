import { Locator, Page } from '@playwright/test';
import { AddUserModal, UserRole } from './AddUserModal';

export class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usersHeading: Locator;
  readonly addUserButton: Locator;
  readonly addUserModal: AddUserModal;
  readonly usersTable: Locator;
  readonly settingsNavButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addUserModal = new AddUserModal(page);
    this.heading = page.getByRole('heading', { name: 'Settings', exact: true });
    this.usersHeading = page.getByRole('heading', { name: 'Users', exact: true });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.usersTable = page.getByRole('table').filter({
      has: page.getByRole('columnheader', { name: 'Email' }),
    });
    this.settingsNavButton = page.getByRole('button', { name: /settings/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await this.addUserButton.waitFor({ state: 'visible', timeout: 15_000 });
    await this.addUserButton.scrollIntoViewIfNeeded();
  }

  async openAddUserForm(): Promise<void> {
    await this.addUserButton.click();
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<string> {
    await this.openAddUserForm();
    await this.addUserModal.fill(name, email, password);
    if (role && role !== 'EDITOR') {
      await this.addUserModal.selectRole(role);
    }

    const uuid = await this.addUserModal.submitCreate();
    if (!uuid) {
      throw new Error('User created but UUID missing from POST response');
    }

    return uuid;
  }

  userRow(email: string): Locator {
    return this.usersTable.getByRole('row').filter({ hasText: email });
  }

  userNameInList(name: string): Locator {
    return this.usersTable.getByText(name, { exact: true });
  }
}
