# Test Plan: Create New Academic Program

**Feature:** Create new academic program  
**Prepared by:** QA  
**Scope:** Program creation form, validation, and program list update

---

## Positive Flows

### TC-001 — Program creation form displays required fields

**Preconditions:** User is logged in as admin and has access to the Programs module.

**Steps:**
1. Navigate to the Programs page.
2. Click "+ New Program".

**Gherkin:**
```gherkin
Scenario: Admin sees program creation form with required fields
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

**Expected result:** A program creation form (modal or page) opens and displays **Program Name** and **Description** fields, along with a **Create** action.

**Priority:** High

---

### TC-002 — New program is created and appears in the program list

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `Web Development 2026` in **Program Name**.
2. Enter `Full-stack web development program` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Admin successfully creates a new academic program
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Expected result:** The creation form closes, no error is shown, and **Web Development 2026** appears in the program list with description **Full-stack web development program** visible or accessible in the list/detail view.

**Priority:** High

---

### TC-003 — Program can be created with Program Name only

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `Data Science Fundamentals` in **Program Name**.
2. Leave **Description** empty.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Admin creates a program with only Program Name filled
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

**Expected result:** Program is created successfully; **Create** is enabled when **Program Name** is populated even if **Description** is empty.

**Priority:** Medium

---

### TC-004 — Canceling the form does not create a program

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `Mobile App Development` in **Program Name**.
2. Enter `iOS and Android development track` in **Description**.
3. Click **Cancel** or close the modal via the close (X) control.

**Gherkin:**
```gherkin
Scenario: Admin cancels program creation without saving
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Mobile App Development"
  And I fill in Description with "iOS and Android development track"
  And I click Cancel
  Then the modal closes
  And the program list does not show "Mobile App Development"
```

**Expected result:** Form closes with no new program added to the list.

**Priority:** Medium

---

## Negative Flows

### TC-005 — Create button is disabled when Program Name is empty

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Leave **Program Name** empty.
2. Optionally enter text in **Description**.
3. Observe the **Create** button state.

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

**Expected result:** **Create** remains disabled; no program is created; no success message is shown.

**Priority:** High

---

### TC-006 — Whitespace-only Program Name is treated as empty

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter only spaces in **Program Name** (e.g., `   `).
2. Enter `Optional description text` in **Description**.
3. Observe the **Create** button state.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Program Name is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "   "
  And I fill in Description with "Optional description text"
  Then the Create button is disabled
```

**Expected result:** **Create** stays disabled; trimmed empty name is not accepted.

**Priority:** High

---

### TC-007 — Non-admin user cannot access program creation

**Preconditions:** User is logged in with a non-admin role (e.g., instructor or student).

**Steps:**
1. Navigate to the Programs page.
2. Attempt to locate and click "+ New Program".

**Gherkin:**
```gherkin
Scenario: Non-admin cannot create a new program
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see "+ New Program"
  And I cannot open the program creation form
```

**Expected result:** "+ New Program" is hidden or disabled; direct URL access to the creation form is blocked or returns forbidden/unauthorized.

**Priority:** High

---

### TC-008 — Unauthenticated user cannot access program creation

**Preconditions:** User is not logged in.

**Steps:**
1. Open the Programs page URL directly.
2. Attempt to open the program creation form.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user is redirected from program creation
  Given I am not logged in
  When I navigate to the Programs page
  Then I am redirected to the login page
  And I cannot access the program creation form
```

**Expected result:** User is redirected to login; no program data or creation UI is exposed.

**Priority:** High

---

### TC-009 — Duplicate program name is rejected

**Preconditions:** User is logged in as admin; program **Web Development 2026** already exists in the list.

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Duplicate attempt description` in **Description**.
4. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Duplicate program name is not allowed
  Given I am logged in as admin
  And a program named "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the modal remains open
  And I see an error message indicating the program name already exists
  And the program list contains only one "Web Development 2026"
```

**Expected result:** Creation fails with a clear validation error; no duplicate entry is added.

**Priority:** High

---

### TC-010 — Program is not created when server returns an error

**Preconditions:** User is logged in as admin; backend/API is unavailable or returns 500.

**Steps:**
1. Open the program creation form.
2. Enter valid values in **Program Name** and **Description**.
3. Click **Create** while the server error condition is active.

**Gherkin:**
```gherkin
Scenario: Server error prevents silent program creation failure
  Given I am logged in as admin
  And I am on the program creation form
  And the program creation API returns a server error
  When I fill in Program Name with "Cloud Computing 2026"
  And I fill in Description with "AWS and Azure fundamentals"
  And I click Create
  Then the modal remains open
  And I see an error message indicating the program could not be created
  And the program list does not show "Cloud Computing 2026"
```

**Expected result:** User sees an error; form data is preserved; no phantom entry appears in the list.

**Priority:** Medium

---

## Edge Cases

### TC-011 — Program Name at minimum valid length (1 character)

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `A` in **Program Name**.
2. Enter `Single-character name boundary test` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Single-character Program Name is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single-character name boundary test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

**Expected result:** Program is created if 1 character is within allowed minimum length.

**Priority:** Medium

---

### TC-012 — Program Name at maximum allowed length

**Preconditions:** User is logged in as admin; maximum **Program Name** length is defined (e.g., 255 characters — verify against spec).

**Steps:**
1. Enter a **Program Name** of exactly 255 characters (e.g., `Advanced Machine Learning and Artificial Intelligence Professional Certificate Program for Enterprise Data Teams 2026 Edition Extended Title Padding Characters End`).
2. Enter `Max length boundary test` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum allowed length is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a 255-character valid name
  And I fill in Description with "Max length boundary test"
  And I click Create
  Then the modal closes
  And the program list shows the 255-character program name
```

**Expected result:** Program is created; full name is stored and displayed correctly (truncated in list only if UI design specifies truncation with tooltip).

**Priority:** Medium

---

### TC-013 — Program Name exceeding maximum length is rejected

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter a **Program Name** of 256 characters.
2. Enter `Over max length test` in **Description**.
3. Attempt to click **Create** or observe inline validation.

**Gherkin:**
```gherkin
Scenario: Program Name exceeding maximum length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a 256-character name
  And I fill in Description with "Over max length test"
  Then the Create button is disabled or I see a validation error for Program Name
  And no program is created
```

**Expected result:** Over-limit input is blocked or rejected with a clear message; no partial/truncated save without user awareness.

**Priority:** Medium

---

### TC-014 — Special characters in Program Name are handled correctly

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `C++ & C#: "Intro" (2026) — 100% Online` in **Program Name**.
2. Enter `Special characters validation test` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Program Name with special characters is stored and displayed correctly
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "C++ & C#: \"Intro\" (2026) — 100% Online"
  And I fill in Description with "Special characters validation test"
  And I click Create
  Then the modal closes
  And the program list shows "C++ & C#: \"Intro\" (2026) — 100% Online"
```

**Expected result:** Name is saved without corruption, HTML/script injection, or encoding issues.

**Priority:** Medium

---

### TC-015 — Unicode and international characters in Program Name

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `プログラム開発 2026 — Développement Web` in **Program Name**.
2. Enter `Unicode and international character support test` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: International characters in Program Name are supported
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "プログラム開発 2026 — Développement Web"
  And I fill in Description with "Unicode and international character support test"
  And I click Create
  Then the modal closes
  And the program list shows "プログラム開発 2026 — Développement Web"
```

**Expected result:** Unicode characters render correctly in form, list, and any detail views.

**Priority:** Low

---

### TC-016 — Leading and trailing spaces are trimmed from Program Name

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `  Cybersecurity Essentials  ` (leading/trailing spaces) in **Program Name**.
2. Enter `Trim behavior test` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces are trimmed from Program Name
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "  Cybersecurity Essentials  "
  And I fill in Description with "Trim behavior test"
  And I click Create
  Then the modal closes
  And the program list shows "Cybersecurity Essentials"
```

**Expected result:** Stored/displayed name is trimmed; duplicate check uses trimmed value.

**Priority:** Medium

---

### TC-017 — Description at maximum allowed length

**Preconditions:** User is logged in as admin; maximum **Description** length is defined (e.g., 2000 characters — verify against spec).

**Steps:**
1. Enter `UX Design Bootcamp` in **Program Name**.
2. Enter a **Description** of exactly 2000 characters.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Description at maximum allowed length is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "UX Design Bootcamp"
  And I fill in Description with a 2000-character valid description
  And I click Create
  Then the modal closes
  And the program list shows "UX Design Bootcamp"
```

**Expected result:** Program is created with full description persisted.

**Priority:** Low

---

### TC-018 — Description exceeding maximum length is rejected

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `DevOps Engineering` in **Program Name**.
2. Enter a **Description** of 2001 characters.
3. Attempt to submit the form.

**Gherkin:**
```gherkin
Scenario: Description exceeding maximum length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "DevOps Engineering"
  And I fill in Description with a 2001-character description
  Then the Create button is disabled or I see a validation error for Description
  And no program is created
```

**Expected result:** Over-limit description is blocked with validation feedback.

**Priority:** Low

---

### TC-019 — Double-click on Create does not create duplicate programs

**Preconditions:** User is logged in as admin and the program creation form is open.

**Steps:**
1. Enter `Blockchain Fundamentals` in **Program Name**.
2. Enter `Distributed ledger technology program` in **Description**.
3. Double-click **Create** rapidly.

**Gherkin:**
```gherkin
Scenario: Double submission does not create duplicate programs
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Blockchain Fundamentals"
  And I fill in Description with "Distributed ledger technology program"
  And I double-click Create
  Then the modal closes
  And the program list shows exactly one "Blockchain Fundamentals"
```

**Expected result:** Only one program record is created; button is disabled during submission.

**Priority:** Medium

---

### TC-020 — Program list updates without manual page refresh

**Preconditions:** User is logged in as admin; program list is visible.

**Steps:**
1. Open the program creation form.
2. Create program **Game Development 2026** with description **Unity and Unreal Engine track**.
3. Observe the program list immediately after modal closes.

**Gherkin:**
```gherkin
Scenario: New program appears in list without page refresh
  Given I am logged in as admin
  And I am on the Programs page
  When I create a program named "Game Development 2026" with description "Unity and Unreal Engine track"
  Then the modal closes
  And the program list shows "Game Development 2026" without reloading the page
```

**Expected result:** List reflects the new entry immediately (client-side update or automatic refetch).

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Navigate to program creation form | TC-001 |
| Successfully create a program | TC-002 |
| Validation prevents empty program name | TC-005 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description field requirement:** ACs do not state whether **Description** is optional or required. TC-003 assumes optional; confirm with product.
2. **Maximum field lengths:** No limits specified for **Program Name** or **Description**. TC-012, TC-013, TC-017, and TC-018 use assumed limits (255 / 2000) — update once spec is confirmed.
3. **Duplicate program names:** ACs do not address uniqueness. TC-009 assumes names must be unique — confirm business rule.
4. **Whitespace handling:** AC only covers fully empty **Program Name**; trimming rules for leading/trailing spaces are unspecified (TC-006, TC-016).
5. **UI container type:** AC says "modal closes" but does not confirm whether creation is always modal vs. dedicated page — affects cancel/close behavior tests.
6. **Cancel / close behavior:** No AC for discarding in-progress input or confirming unsaved changes.
7. **Role-based access:** Only admin is mentioned in navigation AC; permissions for other roles are undefined (TC-007).
8. **Post-create feedback:** No AC for success toast/notification, sort order of new item in list, or default program status (draft/active).
9. **Error handling:** No AC for API/network failures or inline field-level error messages vs. disabled button only.
10. **List display details:** AC verifies name appears in list but not description visibility, search indexing, or pagination behavior when list is long.
11. **Special characters / XSS:** No security or encoding requirements stated (TC-014).
12. **Concurrent creation:** No AC for race conditions or duplicate submissions (TC-019).
