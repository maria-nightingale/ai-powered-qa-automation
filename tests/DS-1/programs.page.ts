import { expect, Locator, Page } from '@playwright/test';
import { env } from './env';

export class ProgramsPage {
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly newProgramButton: Locator;
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.programNameInput = this.dialog
      .getByLabel('Program Name')
      .or(this.dialog.getByPlaceholder('e.g. Computer Science BSc'));
    this.descriptionInput = this.dialog
      .getByLabel('Description')
      .or(this.dialog.getByPlaceholder('Brief description'));
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.newProgramButton = page.getByRole('button', { name: /new program/i });
  }

  async login(): Promise<void> {
    await this.page.goto(`${env.url}/login`);
    await this.page
      .getByLabel('Email')
      .or(this.page.getByPlaceholder('you@college.edu'))
      .fill(env.email);
    await this.page
      .getByLabel('Password')
      .or(this.page.getByPlaceholder('Your password'))
      .fill(env.password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await expect(this.page).not.toHaveURL(/\/login$/);
  }

  async openProgramsPage(): Promise<void> {
    await this.page.goto(`${env.url}/programs`);

    if (this.page.url().includes('/login')) {
      await this.login();
      await this.page.goto(`${env.url}/programs`);
    }

    await expect(this.page).toHaveURL(/\/programs/);
    await expect(this.newProgramButton).toBeVisible({ timeout: 15_000 });
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.programNameInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  async fillProgramForm(name: string, description = ''): Promise<void> {
    await this.programNameInput.fill(name);
    await this.descriptionInput.fill(description);
  }

  async createProgram(name: string, description = ''): Promise<void> {
    await this.openNewProgramForm();
    await this.fillProgramForm(name, description);
    await this.createButton.click();
    await expect(this.dialog).toBeHidden({ timeout: 15_000 });
  }

  programInList(name: string): Locator {
    return this.page.getByRole('main').getByText(name, { exact: true });
  }

  async expectProgramInList(name: string): Promise<void> {
    await expect(this.programInList(name).first()).toBeVisible();
  }

  async expectProgramNotInList(name: string): Promise<void> {
    await expect(this.programInList(name)).toHaveCount(0);
  }

  async countProgramsNamed(name: string): Promise<number> {
    return this.programInList(name).count();
  }

  async expectCreateDisabled(): Promise<void> {
    await expect(this.createButton).toBeDisabled();
  }

  async expectValidationMessage(pattern: RegExp): Promise<void> {
    await expect(this.dialog.getByText(pattern)).toBeVisible();
  }
}
