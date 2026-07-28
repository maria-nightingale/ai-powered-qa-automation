import { Locator, Page } from '@playwright/test';
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

  async goto(): Promise<void> {
    await this.page.goto('/programs');
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

  async countProgramsNamed(name: string): Promise<number> {
    return this.programInList(name).count();
  }
}
