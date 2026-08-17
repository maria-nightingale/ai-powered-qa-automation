import { Locator, Page } from '@playwright/test';
import { extractUserId } from '../fixtures/user-api';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export class AddUserModal {
  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleInput: Locator;
  readonly createButton: Locator;
  readonly closeButton: Locator;
  readonly duplicateEmailError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Add User' });
    this.nameInput = this.dialog.getByRole('textbox', { name: 'Name' });
    this.emailInput = this.dialog.getByRole('textbox', { name: 'Email' });
    this.passwordInput = this.dialog.getByRole('textbox', { name: 'Password' });
    this.roleInput = this.dialog.getByRole('textbox', { name: 'Role' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create User' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.duplicateEmailError = this.page.getByText(/email already in use/i);
  }

  axeIncludeSelector(): string {
    return '[role="dialog"]';
  }

  async fill(name: string, email: string, password: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async selectRole(role: UserRole): Promise<void> {
    await this.roleInput.click();
    await this.page.getByRole('option', { name: role, exact: true }).click();
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  waitForUserCreate() {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/users') && response.request().method() === 'POST',
    );
  }

  waitForSuccessfulUserCreate() {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/users') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );
  }

  async submitCreate(): Promise<string | undefined> {
    const createResponse = this.waitForUserCreate();
    await this.createButton.click();
    const response = await createResponse;

    if (!response.ok()) {
      return undefined;
    }

    return extractUserId(await response.json());
  }
}
