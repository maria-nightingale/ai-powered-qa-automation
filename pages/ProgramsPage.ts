import { expect, Locator, Page } from '@playwright/test';
import { NewProgramModal } from './NewProgramModal';

export class ProgramsPage {
  readonly page: Page;
  readonly newProgramButton: Locator;
  readonly newProgramModal: NewProgramModal;

  constructor(page: Page) {
    this.page = page;
    this.newProgramModal = new NewProgramModal(page);
    this.newProgramButton = page.getByRole('button', { name: /new program/i });
  }

  get dialog(): Locator {
    return this.newProgramModal.dialog;
  }

  get programNameInput(): Locator {
    return this.newProgramModal.programNameInput;
  }

  get descriptionInput(): Locator {
    return this.newProgramModal.descriptionInput;
  }

  get saveButton(): Locator {
    return this.newProgramModal.saveButton;
  }

  get cancelButton(): Locator {
    return this.newProgramModal.cancelButton;
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  /** @deprecated Use goto() — auth is handled by storageState from auth.setup.ts */
  async openProgramsPage(): Promise<void> {
    await this.goto();
    await expect(this.newProgramButton).toBeVisible({ timeout: 15_000 });
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  async createProgram(name: string, description = ''): Promise<string> {
    await this.openNewProgramForm();
    await this.newProgramModal.fill(name, description);

    const uuid = await this.newProgramModal.submitCreate();
    if (!uuid) {
      throw new Error('Program created but UUID missing from POST response');
    }

    return uuid;
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

  programRow(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .getByRole('row', { name: new RegExp(escaped) })
      .or(this.page.locator('tr').filter({ has: this.page.getByText(name, { exact: true }) }));
  }

  editButtonForProgram(name: string): Locator {
    const row = this.programRow(name);
    return row
      .getByRole('button', { name: /edit/i })
      .or(row.locator('[aria-label*="Edit" i]'))
      .or(row.locator('button').filter({ has: this.page.locator('svg') }).last());
  }

  async openEditForm(programName: string): Promise<void> {
    await this.expectProgramInList(programName);
    await this.editButtonForProgram(programName).first().click();
    await expect(this.dialog).toBeVisible();
    await expect(this.programNameInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async expectEditFormPrefilled(name: string, description: string): Promise<void> {
    await expect(this.programNameInput).toHaveValue(name);
    await expect(this.descriptionInput).toHaveValue(description);
  }

  async fillEditForm(name?: string, description?: string): Promise<void> {
    if (name !== undefined) {
      await this.programNameInput.fill(name);
    }
    if (description !== undefined) {
      await this.descriptionInput.fill(description);
    }
  }

  async saveEdit(): Promise<void> {
    await this.saveButton.click();
  }

  async saveEditAndClose(): Promise<void> {
    await this.saveButton.click();
    await expect(this.dialog).toBeHidden({ timeout: 15_000 });
  }

  async expectSaveDisabled(): Promise<void> {
    await expect(this.saveButton).toBeDisabled();
  }

  async expectProgramDescription(name: string, description: string): Promise<void> {
    await this.openEditForm(name);
    await expect(this.descriptionInput).toHaveValue(description);
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }

  waitForProgramUpdate() {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/programs') &&
        ['PATCH', 'PUT'].includes(response.request().method()),
    );
  }

  waitForProgramCreate() {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/programs') && response.request().method() === 'POST',
    );
  }

  waitForSuccessfulProgramCreate() {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/programs') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );
  }
}
