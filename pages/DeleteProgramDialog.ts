import { Locator, Page } from '@playwright/test';

export class DeleteProgramDialog {
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.confirmButton = this.dialog.getByRole('button', {
      name: /^delete$|^delete program$|confirm|yes/i,
    });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
