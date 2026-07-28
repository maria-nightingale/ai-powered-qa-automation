import { Locator, Page } from '@playwright/test';
import { extractProgramId } from '../fixtures/program-api';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly duplicateNameError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.programNameInput = this.dialog
      .getByLabel('Program Name')
      .or(this.dialog.getByLabel(/^Name$/i));
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.duplicateNameError = this.dialog.getByText(
      /already exists|already been used|must be unique|name is taken/i,
    );
  }

  async fill(name: string, description = ''): Promise<void> {
    await this.programNameInput.fill(name);
    await this.descriptionInput.fill(description);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async submitCreate(): Promise<string | undefined> {
    const createResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/programs') && response.request().method() === 'POST',
    );
    await this.createButton.click();
    const response = await createResponse;

    if (!response.ok()) {
      return undefined;
    }

    return extractProgramId(await response.json());
  }
}
