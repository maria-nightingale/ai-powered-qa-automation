# Test Plan: TodoMVC (Playwright Demo)

**Application:** [TodoMVC — Playwright Demo](https://demo.playwright.dev/todomvc/)  
**Prepared by:** QA  
**Scope:** Add, complete, and delete todo items; related list behavior and validation

---

## Positive Flows

### TC-001 — New todo item appears in the list after Enter

**Preconditions:** User is on the TodoMVC page; the todo list is empty or visible.

**Steps:**
1. Click the **What needs to be done?** input field.
2. Type `Buy groceries`.
3. Press **Enter**.

**Expected result:** `Buy groceries` appears as a new item in the todo list; the input field is cleared and ready for another entry; the items-left counter updates (e.g., **1 item left**).

**Priority:** High

---

### TC-002 — Multiple todo items can be added sequentially

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Add `Buy groceries` and press **Enter**.
2. Add `Walk the dog` and press **Enter**.
3. Add `Pay electricity bill` and press **Enter**.

**Expected result:** All three items appear in the list in the order entered; the counter shows **3 items left**; each item has an unchecked checkbox and a visible label.

**Priority:** High

---

### TC-003 — Todo item can be marked as completed

**Preconditions:** Todo item `Buy groceries` exists in the list and is not completed.

**Steps:**
1. Click the checkbox next to `Buy groceries`.

**Expected result:** The checkbox is checked; the item label shows completed styling (e.g., strikethrough); the items-left counter decreases by one (e.g., from **1 item left** to **0 items left** if it was the only active item).

**Priority:** High

---

### TC-004 — Completed todo item can be marked as active again

**Preconditions:** Todo item `Walk the dog` exists and is marked completed.

**Steps:**
1. Click the checkbox next to `Walk the dog` again.

**Expected result:** The checkbox is unchecked; completed styling is removed; the items-left counter increases by one.

**Priority:** Medium

---

### TC-005 — Todo item can be deleted from the list

**Preconditions:** Todo item `Pay electricity bill` exists in the list.

**Steps:**
1. Hover over `Pay electricity bill` to reveal the destroy (×) control.
2. Click the destroy (×) button for that item.

**Expected result:** `Pay electricity bill` is removed from the list; the items-left counter updates accordingly; no error is shown.

**Priority:** High

---

### TC-006 — Deleted item no longer appears under any filter

**Preconditions:** Items `Buy groceries` and `Walk the dog` exist; `Walk the dog` is deleted.

**Steps:**
1. Delete `Walk the dog`.
2. Click **All**, then **Active**, then **Completed** filters.

**Expected result:** `Walk the dog` does not appear under **All**, **Active**, or **Completed**; `Buy groceries` remains visible where applicable.

**Priority:** Medium

---

## Negative Flows

### TC-007 — Empty todo is not added when Enter is pressed with no text

**Preconditions:** User is on the TodoMVC page; todo list may be empty or contain existing items.

**Steps:**
1. Click the **What needs to be done?** input field.
2. Press **Enter** without typing any text.

**Expected result:** No new item is added to the list; the list state is unchanged; no blank or empty row appears.

**Priority:** High

---

### TC-008 — Whitespace-only input is not added as a todo item

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Click the **What needs to be done?** input field.
2. Type `   ` (spaces only).
3. Press **Enter**.

**Expected result:** No new item is added; list and counter remain unchanged.

**Priority:** High

---

### TC-009 — Completing a non-existent item is not possible

**Preconditions:** Todo list is empty.

**Steps:**
1. Verify no todo items are displayed.
2. Attempt to interact with a checkbox in the todo list.

**Expected result:** No checkboxes are available; no item can be marked complete.

**Priority:** Low

---

### TC-010 — Deleting when list is empty does not cause errors

**Preconditions:** Todo list is empty; footer and filters may be hidden.

**Steps:**
1. Confirm the todo list shows no items.
2. Confirm no destroy (×) controls are visible.

**Expected result:** No delete actions are available; page remains stable with no errors.

**Priority:** Low

---

### TC-011 — Pressing Enter on an already-completed item row does not create a duplicate

**Preconditions:** Item `Read documentation` exists and is marked completed.

**Steps:**
1. Focus the completed item row (if editable) or the main input.
2. Ensure no accidental duplicate entry occurs via keyboard.

**Expected result:** Only one `Read documentation` entry exists; completing an item does not spawn a duplicate.

**Priority:** Medium

---

## Edge Cases

### TC-012 — Todo text with special characters is stored and displayed correctly

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Add `C++ & Rust: "learn" (2026) — 100% fun` and press **Enter**.
2. Mark the item complete, then mark it active again.
3. Delete the item.

**Expected result:** Text displays correctly at add, complete, and delete stages; no HTML/script injection or encoding corruption.

**Priority:** Medium

---

### TC-013 — Todo text with Unicode and emoji is handled correctly

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Add `買い物 🛒 café résumé` and press **Enter**.
2. Complete the item.
3. Delete the item.

**Expected result:** Unicode and emoji render correctly; complete and delete behave as for ASCII text.

**Priority:** Medium

---

### TC-014 — Very long todo text is accepted and displayed

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Enter a todo string of approximately 500 characters (e.g., `Prepare quarterly report including budget analysis team feedback stakeholder review action items and follow-up meetings for all departments`).
2. Press **Enter**.
3. Complete and delete the item.

**Expected result:** Long text is added without breaking layout; item can be completed and deleted; text wraps or truncates per UI design without data loss on interaction.

**Priority:** Medium

---

### TC-015 — Duplicate todo text creates separate list entries

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Add `Buy milk` and press **Enter**.
2. Add `Buy milk` again and press **Enter**.

**Expected result:** Two separate `Buy milk` entries appear in the list; each has its own checkbox and destroy control; completing or deleting one does not affect the other unless explicitly acted upon.

**Priority:** Medium

---

### TC-016 — Rapid double Enter does not create duplicate items unintentionally

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Type `Send invoice`.
2. Press **Enter** twice in quick succession.

**Expected result:** Only one `Send invoice` item is added (unless product explicitly allows duplicate submission); counter reflects a single new item.

**Priority:** Medium

---

### TC-017 — Leading and trailing spaces in todo text are preserved or trimmed consistently

**Preconditions:** User is on the TodoMVC page.

**Steps:**
1. Add `  Schedule dentist appointment  ` and press **Enter**.
2. Observe displayed label text.

**Expected result:** Behavior is consistent: either trimmed text `Schedule dentist appointment` is shown, or full spaced text is preserved — documented and applied uniformly on complete/delete.

**Priority:** Low

---

### TC-018 — Items-left counter reflects only active (incomplete) items

**Preconditions:** Three items exist: `Task A`, `Task B`, `Task C`.

**Steps:**
1. Verify counter shows **3 items left**.
2. Complete `Task B`.
3. Verify counter shows **2 items left**.
4. Delete `Task A`.
5. Verify counter shows **1 item left**.

**Expected result:** Counter always matches the number of incomplete items; singular/plural label is correct (**1 item left** vs **2 items left**).

**Priority:** Medium

---

### TC-019 — Complete then delete removes item and updates counter

**Preconditions:** Item `Archive old emails` exists and is active.

**Steps:**
1. Complete `Archive old emails`.
2. Delete `Archive old emails`.

**Expected result:** Item is removed from the list; counter does not count the deleted item; **Completed** filter no longer shows it.

**Priority:** Medium

---

### TC-020 — Add, complete, and delete workflow in single session

**Preconditions:** User starts with an empty list on TodoMVC.

**Steps:**
1. Add `Write test plan`.
2. Add `Review test plan`.
3. Complete `Write test plan`.
4. Delete `Review test plan`.
5. Verify list and counter.

**Expected result:** List shows only `Write test plan` (completed); counter shows **0 items left**; **Active** filter shows no items; **Completed** filter shows `Write test plan`.

**Priority:** High

---

## Acceptance Criteria Coverage Matrix

| Acceptance Criteria | Covered by |
|---|---|
| User can add a todo item to the list | TC-001, TC-002 |
| User can complete an item | TC-003, TC-004 |
| User can delete item from the list | TC-005, TC-006 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Input validation:** ACs do not specify behavior for empty or whitespace-only input (TC-007, TC-008).
2. **Duplicate titles:** Whether identical todo text is allowed is not defined (TC-015).
3. **Trim behavior:** Leading/trailing spaces on add are unspecified (TC-017).
4. **Max length:** No limit stated for todo text length (TC-014).
5. **Special characters / Unicode:** Encoding and display rules not mentioned (TC-012, TC-013).
6. **Counter rules:** Items-left counter behavior is implied but not in ACs (TC-018).
7. **Filters:** All / Active / Completed filters exist on the app but are out of AC scope (TC-006, TC-020).
8. **Edit todo:** Double-click inline edit is available in TodoMVC but not covered by ACs.
9. **Toggle all:** Mark all complete control is not in ACs.
10. **Clear completed:** Bulk remove completed items is not in ACs.
11. **Persistence:** Whether todos survive page refresh is not specified.
12. **Keyboard-only usage:** Tab order and accessibility for add/complete/delete are not defined.
13. **Destroy control visibility:** Delete requires hover to reveal × — not documented in ACs (TC-005).
14. **Singular/plural counter copy:** Exact wording for 0/1/n items left not specified (TC-018).
