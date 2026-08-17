---
name: network-mocked-edge-cases
description: >
  Writes deterministic programs-flow edge-case Playwright tests with
  page.route network mocks. Use when covering API failure (500/503),
  timeout, empty list, malformed payload, or other HTTP status edge
  cases (401/403/404/5xx/3xx) for Didaxis programs — even if the user
  does not say "mock" or "route". MUST apply before writing or extending
  any programs-flow edge-case spec that depends on API error/empty/malformed
  outcomes.
---

# Network-mocked edge cases (programs flow)

Prefer `page.route` / `route.fulfill` for **deterministic** programs-flow
edge cases. Do not invent UI copy. Do not change happy-path specs that hit
the real API.

## When to apply

- Writing or extending edge-case specs for the **programs flow** (`/programs`,
  create/edit/delete program, program list display)
- Ticket AC mentions API errors, empty list, malformed responses, timeouts,
  or auth failures on `/api/programs`
- Replacing flaky live-API edge tests with controlled mocks (triage may route here)

## Mandatory pre-flight — observe before asserting

**Do not write assertions until this step is done.**

1. Open the real Programs UI with **Playwright MCP** or **agent-browser**
   (a11y tree + snapshot).
2. Force or observe each mocked case (route in a throwaway session, or trigger
   the real failure if reproducible) and **read the actual** error banner,
   empty-state message, or crash-guard behavior the app renders.
3. Record observed copy verbatim (or explicitly record **“renders nothing”**).
4. Assert **only** what you observed — via **existing POM locators**. If a POM
   locator is missing for observed copy, **stop and flag the parent** to add
   it under `pages/` — do not inline locators in the spec.

If the app renders nothing for a case, document that in the handoff and assert
survival only (page visible, no crash, dialog stays open, etc.) — **never guess**
toast or error strings.

## Never mock the endpoint under test

- If the test verifies the **real** API contract or happy-path save/list,
  do **not** mock that endpoint.
- Mock only when the test verifies the **UI reaction** to a controlled
  API outcome (error banner, empty state, no crash).

## Required baseline cases (programs `/api/programs`)

Fulfill with `page.route` matching method + URL. Scope narrowly; `route.continue()`
everything else.

| Case | Mock | Assert (after observing real UI) |
|------|------|----------------------------------|
| **(a) Save failure** | POST → **503** Service Unavailable (also cover **500**) | UI error state — observed copy via POM |
| **(b) Empty list** | GET → **200** `[]` (or `{ data: [] }` if that matches the app) | Empty-state message via POM |
| **(c) Bad payload** | GET or POST → **200** malformed body | App does not crash; main UI still visible |
| Timeout | GET/POST → `route.abort("timedout")` or delayed fulfill | Observed timeout/error UI (or note if none) |
| Auth | GET/POST → **401**, **403** | Observed auth/error UI (or note if none) |
| Missing | GET/POST → **404** | Observed not-found/error UI (or note if none) |
| Upstream | GET/POST → **500**, **501**, **502**, **503** | Observed error UI (or note if none) |
| Redirect-ish | GET/POST → **300** (and other **3xx** if relevant) | Observed handling (or note if none) |

Add any further statuses the plan calls for the same way — observe first, then assert.

## Test shape

- **POMs only** — every click, fill, nav, and assertion target goes through
  `ProgramsPage`, `NewProgramModal`, `DeleteProgramDialog`, etc. No inline
  locators in specs.
- **One tag per test** — exactly one of `@smoke`, `@sanity`, `@regression`,
  `@api`, `@e2e`, `@destructive` on the `test()` call (network-mock edge
  cases are typically `@regression`).
- Prefer `route.fulfill({ status, body })` over broad `route.abort("failed")`.
- Unroute or let the test end cleanly; never leave `**/*` aborts that blind the app.
- Web-first waits only; never `waitForTimeout`.

## Example — (a) save failure 503 (copy must come from live UI)

```typescript
test(
  "TC-NNN — Program save shows error when API returns 503",
  { tag: "@regression" },
  async ({ page }) => {
    await page.route("**/api/programs**", async (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ message: "Service unavailable" }),
        });
      }
      return route.continue();
    });

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fill(uniqueName("503 probe"), "edge case");
    await programsPage.newProgramModal.clickCreate();

    // Assert observed error copy via POM — do not invent strings.
    await expect(programsPage.newProgramModal.dialog).toBeVisible();
    await expect(programsPage.programsLoadError).toBeVisible(); // example; use observed locator
  },
);
```

## Example — (b) empty list (copy must come from live UI)

```typescript
test(
  "TC-NNN — Programs empty state when API returns no programs",
  { tag: "@regression" },
  async ({ page }) => {
    await page.route("**/api/programs**", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }
      return route.continue();
    });

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.emptyStateMessage).toBeVisible();
  },
);
```

## Example — (c) malformed payload (survival + no crash)

```typescript
test(
  "TC-NNN — Malformed programs API response does not crash the page",
  { tag: "@regression" },
  async ({ page }) => {
    await page.route("**/api/programs**", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{not-valid-json",
        });
      }
      return route.continue();
    });

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.programsListView).toBeVisible();
    await expect(programsPage.programsLoadError).toBeVisible(); // or note "renders nothing"
  },
);
```

## Handoff checklist

- [ ] Opened real Programs UI via Playwright MCP or agent-browser before asserting
- [ ] Recorded observed copy (or **“renders nothing”**) for each mocked status
- [ ] Baseline (a)/(b)/(c) covered when ticket/plan calls for programs API edges
- [ ] Additional statuses (401, 403, 404, 501, 502, 300, timeout, …) as plan requires
- [ ] All interactions and assertions via POMs; one tag per test
- [ ] Did not mock the endpoint the test is actually verifying
- [ ] Flagged missing POM locators to parent (do not inline in spec)

Report: statuses covered, UI strings observed (or “renders nothing”), and any
POM gaps for error/empty states.
