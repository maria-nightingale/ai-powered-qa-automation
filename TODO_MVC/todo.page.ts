import { expect, Locator, Page } from '@playwright/test';

export const TODO_URL = 'https://demo.playwright.dev/todomvc/';

export class TodoPage {
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly todoCount: Locator;
  readonly filters: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoList = page.locator('.todo-list');
    this.todoCount = page.locator('.todo-count');
    this.filters = page.locator('.filters');
  }

  async goto(): Promise<void> {
    await this.page.goto(TODO_URL);
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  todoItems(text: string): Locator {
    return this.todoList.locator('li').filter({
      has: this.page.locator('label', { hasText: text }),
    });
  }

  todoItem(text: string): Locator {
    return this.todoItems(text).first();
  }

  async expectTodoCount(count: number): Promise<void> {
    await expect(this.todoList.locator('li')).toHaveCount(count);
  }

  async expectItemsLeft(count: number): Promise<void> {
    const label = count === 1 ? '1 item left' : `${count} items left`;
    await expect(this.todoCount).toContainText(label);
  }

  async toggleTodo(text: string, index = 0): Promise<void> {
    await this.todoItems(text).nth(index).locator('.toggle').click();
  }

  async deleteTodo(text: string, index = 0): Promise<void> {
    const item = this.todoItems(text).nth(index);
    await item.hover();
    await item.locator('.destroy').click();
  }

  async filterBy(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await this.filters.getByRole('link', { name }).click();
  }

  async expectTodoCompleted(text: string, index = 0): Promise<void> {
    await expect(this.todoItems(text).nth(index)).toHaveClass(/completed/);
  }

  async expectTodoActive(text: string, index = 0): Promise<void> {
    await expect(this.todoItems(text).nth(index)).not.toHaveClass(/completed/);
  }
}
