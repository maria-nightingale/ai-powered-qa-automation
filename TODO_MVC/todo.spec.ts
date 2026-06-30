import { test, expect } from '@playwright/test';
import { TodoPage } from './todo.page';

test.describe('TodoMVC — Positive flows', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('TC-001 — New todo item appears in the list after Enter', async () => {
    await todoPage.addTodo('Buy groceries');

    await expect(todoPage.todoItem('Buy groceries')).toBeVisible();
    await expect(todoPage.newTodoInput).toHaveValue('');
    await todoPage.expectItemsLeft(1);
  });

  test('TC-002 — Multiple todo items can be added sequentially', async () => {
    await todoPage.addTodo('Buy groceries');
    await todoPage.addTodo('Walk the dog');
    await todoPage.addTodo('Pay electricity bill');

    await todoPage.expectTodoCount(3);
    await todoPage.expectItemsLeft(3);

    for (const text of ['Buy groceries', 'Walk the dog', 'Pay electricity bill']) {
      await expect(todoPage.todoItem(text).locator('.toggle')).not.toBeChecked();
      await expect(todoPage.todoItem(text).locator('label')).toBeVisible();
    }
  });

  test('TC-003 — Todo item can be marked as completed', async () => {
    await todoPage.addTodo('Buy groceries');

    await todoPage.toggleTodo('Buy groceries');

    await expect(todoPage.todoItem('Buy groceries').locator('.toggle')).toBeChecked();
    await todoPage.expectTodoCompleted('Buy groceries');
    await todoPage.expectItemsLeft(0);
  });

  test('TC-004 — Completed todo item can be marked as active again', async () => {
    await todoPage.addTodo('Walk the dog');
    await todoPage.toggleTodo('Walk the dog');
    await todoPage.expectItemsLeft(0);

    await todoPage.toggleTodo('Walk the dog');

    await expect(todoPage.todoItem('Walk the dog').locator('.toggle')).not.toBeChecked();
    await todoPage.expectTodoActive('Walk the dog');
    await todoPage.expectItemsLeft(1);
  });

  test('TC-005 — Todo item can be deleted from the list', async () => {
    await todoPage.addTodo('Pay electricity bill');

    await todoPage.deleteTodo('Pay electricity bill');

    await expect(todoPage.todoItems('Pay electricity bill')).toHaveCount(0);
    await expect(todoPage.todoCount).toBeHidden();
  });

  test('TC-006 — Deleted item no longer appears under any filter', async () => {
    await todoPage.addTodo('Buy groceries');
    await todoPage.addTodo('Walk the dog');

    await todoPage.deleteTodo('Walk the dog');

    await todoPage.filterBy('All');
    await expect(todoPage.todoItems('Walk the dog')).toHaveCount(0);
    await expect(todoPage.todoItem('Buy groceries')).toBeVisible();

    await todoPage.filterBy('Active');
    await expect(todoPage.todoItems('Walk the dog')).toHaveCount(0);
    await expect(todoPage.todoItem('Buy groceries')).toBeVisible();

    await todoPage.filterBy('Completed');
    await expect(todoPage.todoItems('Walk the dog')).toHaveCount(0);
    await expect(todoPage.todoItems('Buy groceries')).toHaveCount(0);
  });
});

test.describe('TodoMVC — Negative flows', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('TC-007 — Empty todo is not added when Enter is pressed with no text', async () => {
    await todoPage.newTodoInput.click();
    await todoPage.newTodoInput.press('Enter');

    await todoPage.expectTodoCount(0);
    await expect(todoPage.todoCount).toBeHidden();
  });

  test('TC-008 — Whitespace-only input is not added as a todo item', async () => {
    await todoPage.addTodo('   ');

    await todoPage.expectTodoCount(0);
    await expect(todoPage.todoCount).toBeHidden();
  });

  test('TC-009 — Completing a non-existent item is not possible', async () => {
    await todoPage.expectTodoCount(0);
    await expect(todoPage.todoList.locator('.toggle')).toHaveCount(0);
  });

  test('TC-010 — Deleting when list is empty does not cause errors', async () => {
    await todoPage.expectTodoCount(0);
    await expect(todoPage.todoList.locator('.destroy')).toHaveCount(0);
    await expect(todoPage.filters).toBeHidden();
  });

  test('TC-011 — Completing an item does not create a duplicate entry', async () => {
    await todoPage.addTodo('Read documentation');
    await todoPage.toggleTodo('Read documentation');

    await expect(todoPage.todoItems('Read documentation')).toHaveCount(1);
    await todoPage.toggleTodo('Read documentation');
    await expect(todoPage.todoItems('Read documentation')).toHaveCount(1);
  });
});

test.describe('TodoMVC — Edge cases', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('TC-012 — Todo text with special characters is stored and displayed correctly', async () => {
    const text = 'C++ & Rust: "learn" (2026) — 100% fun';

    await todoPage.addTodo(text);
    await expect(todoPage.todoItem(text).locator('label')).toHaveText(text);

    await todoPage.toggleTodo(text);
    await todoPage.expectTodoCompleted(text);

    await todoPage.toggleTodo(text);
    await todoPage.expectTodoActive(text);

    await todoPage.deleteTodo(text);
    await expect(todoPage.todoItems(text)).toHaveCount(0);
  });

  test('TC-013 — Todo text with Unicode and emoji is handled correctly', async () => {
    const text = '買い物 🛒 café résumé';

    await todoPage.addTodo(text);
    await expect(todoPage.todoItem(text).locator('label')).toHaveText(text);

    await todoPage.toggleTodo(text);
    await todoPage.expectTodoCompleted(text);

    await todoPage.deleteTodo(text);
    await expect(todoPage.todoItems(text)).toHaveCount(0);
  });

  test('TC-014 — Very long todo text is accepted and displayed', async () => {
    const text =
      'Prepare quarterly report including budget analysis team feedback stakeholder review action items and follow-up meetings for all departments across engineering product design marketing sales operations finance legal compliance and executive leadership with detailed milestones deliverables risk assessments mitigation plans resource allocation timelines dependencies cross-functional coordination documentation standards quality gates acceptance criteria rollout strategy training materials support playbooks monitoring dashboards alerting runbooks post-launch retrospectives continuous improvement initiatives';

    await todoPage.addTodo(text);
    await expect(todoPage.todoItem(text).locator('label')).toHaveText(text);

    await todoPage.toggleTodo(text);
    await todoPage.expectTodoCompleted(text);

    await todoPage.deleteTodo(text);
    await expect(todoPage.todoItems(text)).toHaveCount(0);
  });

  test('TC-015 — Duplicate todo text creates separate list entries', async () => {
    await todoPage.addTodo('Buy milk');
    await todoPage.addTodo('Buy milk');

    await expect(todoPage.todoItems('Buy milk')).toHaveCount(2);

    await todoPage.toggleTodo('Buy milk', 0);
    await todoPage.expectTodoCompleted('Buy milk', 0);
    await todoPage.expectTodoActive('Buy milk', 1);

    await todoPage.deleteTodo('Buy milk', 1);
    await expect(todoPage.todoItems('Buy milk')).toHaveCount(1);
  });

  test('TC-016 — Rapid double Enter does not create duplicate items unintentionally', async () => {
    await todoPage.newTodoInput.fill('Send invoice');
    await todoPage.newTodoInput.press('Enter');
    await todoPage.newTodoInput.press('Enter');

    await expect(todoPage.todoItems('Send invoice')).toHaveCount(1);
    await todoPage.expectItemsLeft(1);
  });

  test('TC-017 — Leading and trailing spaces are trimmed from todo text', async () => {
    await todoPage.addTodo('  Schedule dentist appointment  ');

    await expect(todoPage.todoList.locator('li')).toHaveCount(1);
    await expect(todoPage.todoList.locator('li').first().locator('label')).toHaveText(
      'Schedule dentist appointment',
    );
  });

  test('TC-018 — Items-left counter reflects only active (incomplete) items', async () => {
    await todoPage.addTodo('Task A');
    await todoPage.addTodo('Task B');
    await todoPage.addTodo('Task C');
    await todoPage.expectItemsLeft(3);

    await todoPage.toggleTodo('Task B');
    await todoPage.expectItemsLeft(2);

    await todoPage.deleteTodo('Task A');
    await todoPage.expectItemsLeft(1);
  });

  test('TC-019 — Complete then delete removes item and updates counter', async () => {
    await todoPage.addTodo('Archive old emails');

    await todoPage.toggleTodo('Archive old emails');
    await todoPage.expectItemsLeft(0);

    await todoPage.filterBy('Completed');
    await expect(todoPage.todoItem('Archive old emails')).toBeVisible();

    await todoPage.deleteTodo('Archive old emails');
    await expect(todoPage.todoItems('Archive old emails')).toHaveCount(0);
    await expect(todoPage.todoCount).toBeHidden();
    await expect(todoPage.filters).toBeHidden();
  });

  test('TC-020 — Add, complete, and delete workflow in single session', async () => {
    await todoPage.addTodo('Write test plan');
    await todoPage.addTodo('Review test plan');

    await todoPage.toggleTodo('Write test plan');
    await todoPage.deleteTodo('Review test plan');

    await todoPage.filterBy('All');
    await expect(todoPage.todoItems('Review test plan')).toHaveCount(0);
    await todoPage.expectTodoCompleted('Write test plan', 0);
    await todoPage.expectItemsLeft(0);

    await todoPage.filterBy('Active');
    await expect(todoPage.todoList.locator('li')).toHaveCount(0);

    await todoPage.filterBy('Completed');
    await expect(todoPage.todoItem('Write test plan')).toBeVisible();
  });
});
