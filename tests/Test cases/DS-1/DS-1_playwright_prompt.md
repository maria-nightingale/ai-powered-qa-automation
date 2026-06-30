# Playwright Test Prompt — DS-1 Create New Program

Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: `getByLabel('Email')` (fallback: `getByPlaceholder('you@college.edu')`)
  - Password field: `getByLabel('Password')` (fallback: `getByPlaceholder('Your password')`)
  - Sign In button: `getByRole('button', { name: 'Sign In' })`

- Programs page: `/programs`
  - "New Program" button: `getByRole('button', { name: 'New Program' })`
  - Modal form:
    - Program Name: `getByLabel('Program Name')` (fallback: `getByPlaceholder('e.g. Computer Science BSc')`)
    - Description: `getByLabel('Description')` (fallback: `getByPlaceholder('Brief description')`)
    - Create button: `getByRole('button', { name: 'Create' })`

## Credentials

Use dotenv. Read email and password from `process.env`:

- `process.env.DIDAXIS_URL`
- `process.env.DIDAXIS_EMAIL`
- `process.env.DIDAXIS_PASSWORD`

Do NOT hardcode credentials in the test file.

## Test plan

See [DS-1_output.md](./DS-1_output.md) for the full test plan (TC-001 through TC-020).

## Requirements

- TypeScript
- Use Playwright locators (`getByRole`, `getByLabel`, `getByText`)
- Login as the first step in each test (or use `beforeEach`)
- Each test is independent
- Use unique test data with `Date.now()` suffix
- Save as `tests/ds1-create-program.spec.ts`

## Implementation notes

Supporting files live in `tests/DS-1/`:

| File | Purpose |
|---|---|
| `env.ts` | Loads Didaxis credentials from `.env` |
| `programs.page.ts` | Page object for login and program creation |
| `test-data.ts` | Unique name helpers |
| `auth.setup.ts` | Saves admin session to `playwright/.auth/admin.json` |

Run with:

```bash
npx playwright test tests/ds1-create-program.spec.ts --project=ds-1
```
