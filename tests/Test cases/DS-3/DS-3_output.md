# Test Plan: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention  
**Prepared by:** QA  
**Scope:** Program Name validation on create/edit, whitespace trimming, special characters, and duplicate name enforcement

---

## Positive Flows

### TC-001 — Program name with special characters is accepted

**Preconditions:** User is logged in as admin; program creation form is open; no program named **Informatique & IA - Niveau 2** exists.

**Steps:**
1. Enter `Informatique & IA - Niveau 2` in **Program Name**.
2. Enter `Programme de formation en informatique et intelligence artificielle` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Program name with special characters is accepted on create
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill in Description with "Programme de formation en informatique et intelligence artificielle"
  And I click Create
  Then the program is created successfully
  And the program list shows "Informatique & IA - Niveau 2"
```

**Expected result:** Program is created; name displays correctly with `&`, `-`, and accented characters intact.

**Priority:** High

---

### TC-002 — Valid program name with leading/trailing spaces is trimmed and accepted

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Enter `  Cloud Computing 2026  ` in **Program Name**.
2. Enter `Cloud infrastructure and services program` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces are trimmed from valid program name
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "  Cloud Computing 2026  " as the program name
  And I fill in Description with "Cloud infrastructure and services program"
  And I click Create
  Then the program is created successfully
  And the program list shows "Cloud Computing 2026"
```

**Expected result:** Name is trimmed before save; stored and displayed as **Cloud Computing 2026**.

**Priority:** Medium

---

### TC-003 — Unicode characters in program name are accepted

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Enter `プログラム開発 2026 — Développement Web` in **Program Name**.
2. Enter `International web development program` in **Description**.
3. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Unicode characters in program name are accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "プログラム開発 2026 — Développement Web" as the program name
  And I fill in Description with "International web development program"
  And I click Create
  Then the program is created successfully
  And the program list shows "プログラム開発 2026 — Développement Web"
```

**Expected result:** Unicode name is stored and rendered correctly without encoding issues.

**Priority:** Medium

---

## Negative Flows

### TC-004 — Whitespace-only program name is rejected and form is not submitted

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Enter `   ` (spaces only) in **Program Name**.
2. Enter `Some description text` in **Description**.
3. Click **Create** or observe button state.

**Gherkin:**
```gherkin
Scenario: Whitespace-only program name is rejected on create
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "   " as the program name
  And I fill in Description with "Some description text"
  And I click Create
  Then the form is not submitted
  And the name is trimmed and treated as empty
  And the Create button is disabled or I see a validation error for Program Name
```

**Expected result:** Form is not submitted; trimmed name treated as empty; no program created.

**Priority:** High

---

### TC-005 — Duplicate program name is rejected on create

**Preconditions:** User is logged in as admin; program **Web Development 2026** already exists.

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Duplicate attempt description` in **Description**.
4. Click **Create**.

**Gherkin:**
```gherkin
Scenario: Duplicate program name is rejected on create
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  And I am on the program creation form
  When I enter "Web Development 2026" as the program name
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains only one "Web Development 2026"
```

**Expected result:** Clear error message; form remains open; no duplicate record created.

**Priority:** High

---

### TC-006 — Empty program name is rejected

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Leave **Program Name** empty.
2. Enter `Test description` in **Description**.
3. Observe **Create** button or attempt submit.

**Gherkin:**
```gherkin
Scenario: Empty program name is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Test description"
  Then the Create button is disabled
  And the form is not submitted
```

**Expected result:** **Create** disabled; no program created.

**Priority:** High

---

### TC-007 — Duplicate name is rejected on edit (rename)

**Preconditions:** User is logged in as admin; programs **Web Development 2026** and **Game Development 2026** exist.

**Steps:**
1. Open edit form for **Game Development 2026**.
2. Change **Program Name** to `Web Development 2026`.
3. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Duplicate program name is rejected when renaming on edit
  Given I am logged in as admin
  And programs "Web Development 2026" and "Game Development 2026" exist
  And I am editing "Game Development 2026"
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
  And the program list still shows "Game Development 2026"
```

**Expected result:** Save fails with duplicate name error; original program unchanged.

**Priority:** High

---

### TC-008 — Duplicate check is case-sensitive or case-insensitive per spec

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists.

**Steps:**
1. Open program creation form.
2. Enter `web development 2026` in **Program Name**.
3. Fill **Description** and click **Create**.

**Gherkin:**
```gherkin
Scenario: Duplicate check applies per case-sensitivity rules
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  And I am on the program creation form
  When I enter "web development 2026" as the program name
  And I fill in Description with "Lowercase variant test"
  And I click Create
  Then either I see an error indicating the name already exists
  Or the program is created if names are case-insensitive duplicates per spec
```

**Expected result:** Behavior matches defined case-sensitivity rule; error or success is consistent with product spec.

**Priority:** Medium

---

## Edge Cases

### TC-009 — Tab and newline characters in name are trimmed or rejected

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Enter `\t\n   \t` (tabs, newlines, spaces) in **Program Name**.
2. Fill **Description** and attempt **Create**.

**Gherkin:**
```gherkin
Scenario: Name containing only whitespace characters is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "\t\n   \t" as the program name
  And I fill in Description with "Whitespace variant test"
  Then the form is not submitted
  And the Create button is disabled or I see a validation error
```

**Expected result:** Treated as empty after trim; form not submitted.

**Priority:** Medium

---

### TC-010 — Program name with quotes and HTML-like characters is handled safely

**Preconditions:** User is logged in as admin; program creation form is open.

**Steps:**
1. Enter `<script>alert('x')</script> & "Test"` in **Program Name**.
2. Fill **Description** and click **Create** (if allowed) or observe validation.

**Gherkin:**
```gherkin
Scenario: Special characters in name do not cause XSS or unsafe display
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "<script>alert('x')</script> & \"Test\"" as the program name
  And I fill in Description with "Security test"
  And I click Create
  Then either creation is rejected or the name is stored safely without script execution
```

**Expected result:** No script execution; name stored/displayed safely if creation allowed.

**Priority:** Medium

---

### TC-011 — Duplicate after trim: name differing only by outer spaces matches existing

**Preconditions:** Program **Web Development 2026** exists; user on creation form.

**Steps:**
1. Enter `  Web Development 2026  ` as name.
2. Attempt **Create**.

**Gherkin:**
```gherkin
Scenario: Trimmed duplicate name matches existing program
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I enter "  Web Development 2026  " as the program name
  And I click Create
  Then I see an error indicating the name already exists
```

**Expected result:** Trimmed name matches existing; duplicate error shown.

**Priority:** High

---

### TC-012 — Program name at maximum length with special characters

**Preconditions:** Max name length 255 characters (verify spec); creation form open.

**Steps:**
1. Enter 255-character name including `&`, `-`, quotes.
2. Fill **Description**; click **Create**.

**Gherkin:**
```gherkin
Scenario: Max-length name with special characters is accepted if unique
  Given I am logged in as admin
  And I am on the program creation form
  When I enter a 255-character name containing "&" and "-"
  And I fill other required fields
  And I click Create
  Then the program is created successfully or validation applies per max-length rule
```

**Expected result:** Within limits, creation succeeds; special chars preserved.

**Priority:** Low

---

### TC-013 — Duplicate rejection on edit preserves form data

**Preconditions:** **Web Development 2026** and **Data Science 101** exist; editing **Data Science 101**.

**Steps:**
1. Change name to `Web Development 2026`; click **Save**.
2. Observe form and error.

**Gherkin:**
```gherkin
Scenario: Duplicate error on edit keeps user input visible
  Given I am logged in as admin
  And programs "Web Development 2026" and "Data Science 101" exist
  And I am editing "Data Science 101"
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
  And the edit form remains open with my entered name still visible
```

**Expected result:** User can correct name without re-entering all fields.

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Reject program name with only whitespace | TC-004, TC-009 |
| Accept program name with special characters | TC-001 |
| Reject duplicate program name | TC-005, TC-011 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Create vs edit:** Duplicate AC applies to create only; edit rename behavior unspecified (TC-007, TC-008).
2. **Case sensitivity:** Duplicate rules for `Web Development 2026` vs `web development 2026` not defined (TC-008).
3. **Whitespace AC:** AC says click Create; product may disable button instead — align expected UX (TC-004).
4. **Trim on duplicate:** Whether `  Web Development 2026  ` duplicates existing name not stated (TC-011).
5. **Field name:** "Program name" vs **Program Name** — confirm UI label.
6. **Error message copy:** Exact error text for duplicate not specified.
7. **Edit flow:** Whitespace-only and special-character ACs scoped to creation form only; edit validation parity unclear.
8. **Max length + special chars:** Combined behavior not in ACs (TC-012).
9. **Security:** XSS/HTML in names not mentioned (TC-010).
