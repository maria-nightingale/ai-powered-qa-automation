# Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**Prepared by:** QA  
**Scope:** Program edit form, pre-population, save behavior, field preservation, and program list update

---

## Positive Flows

### TC-001 — Edit form opens pre-populated with current program data

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
1. Navigate to the Programs page.
2. Locate **Web Development 2026** in the program list.
3. Click the edit icon on **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Admin opens program for editing with current data pre-filled
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists with description "Full-stack web development program"
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with Name "Web Development 2026"
  And I see the edit form pre-populated with Description "Full-stack web development program"
```

**Expected result:** Edit form (modal or page) opens with **Name** and **Description** fields showing the program's current values.

**Priority:** High

---

### TC-002 — Program name update is saved and reflected in the list

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists; edit form is open for that program.

**Steps:**
1. Change **Name** to `Web Development 2026 - Updated`.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Admin successfully edits a program name
  Given I am logged in as admin
  And I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"
```

**Expected result:** Form closes; list updates without page refresh; old name is replaced by **Web Development 2026 - Updated**.

**Priority:** High

---

### TC-003 — Unchanged fields are preserved when only Description is edited

**Preconditions:** User is logged in as admin; program **Data Science Fundamentals** exists with Name **Data Science Fundamentals** and Description **Introductory data science curriculum**.

**Steps:**
1. Open the edit form for **Data Science Fundamentals**.
2. Change **Description** to `Introductory data science curriculum — revised 2026`.
3. Leave **Name** unchanged.
4. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Editing Description preserves unchanged Name and other fields
  Given I am logged in as admin
  And I am editing a program named "Data Science Fundamentals" with description "Introductory data science curriculum"
  When I change the Description to "Introductory data science curriculum — revised 2026"
  And I leave the Name unchanged
  And I click Save
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
  And the program description is "Introductory data science curriculum — revised 2026"
```

**Expected result:** **Name** remains **Data Science Fundamentals**; only **Description** is updated; no other program attributes change.

**Priority:** High

---

### TC-004 — Both Name and Description can be updated in a single save

**Preconditions:** User is logged in as admin; program **Mobile App Development** exists with Description **iOS and Android development track**.

**Steps:**
1. Open the edit form for **Mobile App Development**.
2. Change **Name** to `Mobile App Development — Advanced`.
3. Change **Description** to `Native and cross-platform mobile development track`.
4. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Admin updates both Name and Description in one edit
  Given I am logged in as admin
  And I am editing "Mobile App Development" with description "iOS and Android development track"
  When I change the Name to "Mobile App Development — Advanced"
  And I change the Description to "Native and cross-platform mobile development track"
  And I click Save
  Then the modal closes
  And the program list shows "Mobile App Development — Advanced"
  And the program description is "Native and cross-platform mobile development track"
```

**Expected result:** Both fields persist; list reflects updated name and description.

**Priority:** Medium

---

### TC-005 — Canceling edit discards unsaved changes

**Preconditions:** User is logged in as admin; program **Cybersecurity Essentials** exists; edit form is open.

**Steps:**
1. Change **Name** to `Cybersecurity Essentials — Pro`.
2. Click **Cancel** or close the modal via the close (X) control.

**Gherkin:**
```gherkin
Scenario: Admin cancels edit without saving changes
  Given I am logged in as admin
  And I am editing "Cybersecurity Essentials"
  When I change the Name to "Cybersecurity Essentials — Pro"
  And I click Cancel
  Then the modal closes
  And the program list shows "Cybersecurity Essentials"
  And the program list does not show "Cybersecurity Essentials — Pro"
```

**Expected result:** No changes are persisted; original program data remains intact.

**Priority:** Medium

---

## Negative Flows

### TC-006 — Empty Name prevents save

**Preconditions:** User is logged in as admin; edit form is open for **UX Design Bootcamp**.

**Steps:**
1. Clear the **Name** field completely.
2. Observe the **Save** button state or attempt to save.

**Gherkin:**
```gherkin
Scenario: Save is blocked when Name is cleared
  Given I am logged in as admin
  And I am editing "UX Design Bootcamp"
  When I clear the Name field
  Then the Save button is disabled
  And no changes are saved
```

**Expected result:** **Save** is disabled or validation error is shown; original program data is unchanged.

**Priority:** High

---

### TC-007 — Whitespace-only Name is rejected

**Preconditions:** User is logged in as admin; edit form is open for **Cloud Computing 2026**.

**Steps:**
1. Replace **Name** with whitespace only (e.g., `   `).
2. Attempt to save.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Name is rejected on edit
  Given I am logged in as admin
  And I am editing "Cloud Computing 2026"
  When I change the Name to "   "
  Then the Save button is disabled
  And no changes are saved
```

**Expected result:** Trimmed empty name is not accepted; program retains original name.

**Priority:** High

---

### TC-008 — Duplicate program name is rejected on edit

**Preconditions:** User is logged in as admin; programs **Web Development 2026** and **Game Development 2026** both exist; edit form is open for **Game Development 2026**.

**Steps:**
1. Change **Name** to `Web Development 2026`.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Renaming a program to an existing name is not allowed
  Given I am logged in as admin
  And programs "Web Development 2026" and "Game Development 2026" exist
  And I am editing "Game Development 2026"
  When I change the Name to "Web Development 2026"
  And I click Save
  Then the modal remains open
  And I see an error message indicating the program name already exists
  And the program list still shows "Game Development 2026"
```

**Expected result:** Save fails with clear validation error; no duplicate name is created.

**Priority:** High

---

### TC-009 — Non-admin user cannot edit programs

**Preconditions:** User is logged in with a non-admin role; program **Web Development 2026** exists.

**Steps:**
1. Navigate to the Programs page.
2. Locate **Web Development 2026**.
3. Attempt to access the edit action.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot edit program details
  Given I am logged in as a non-admin user
  And I am on the Programs page
  And a program "Web Development 2026" exists
  Then I do not see an edit icon on "Web Development 2026"
  And I cannot open the edit form for "Web Development 2026"
```

**Expected result:** Edit control is hidden or disabled; direct URL/API access is blocked.

**Priority:** High

---

### TC-010 — Unauthenticated user cannot access program edit

**Preconditions:** User is not logged in; program **Web Development 2026** exists.

**Steps:**
1. Navigate directly to the Programs page or edit URL.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot edit programs
  Given I am not logged in
  When I navigate to the Programs page
  Then I am redirected to the login page
  And I cannot open the edit form for any program
```

**Expected result:** User is redirected to login; no edit UI or program data is exposed.

**Priority:** High

---

### TC-011 — Server error during save does not corrupt program data

**Preconditions:** User is logged in as admin; edit form is open; save API returns a server error.

**Steps:**
1. Change **Name** to `DevOps Engineering — Updated`.
2. Click **Save** while the server error condition is active.

**Gherkin:**
```gherkin
Scenario: Server error on save preserves original program data
  Given I am logged in as admin
  And I am editing "DevOps Engineering"
  And the program update API returns a server error
  When I change the Name to "DevOps Engineering — Updated"
  And I click Save
  Then the modal remains open
  And I see an error message indicating the program could not be updated
  And the program list still shows "DevOps Engineering"
```

**Expected result:** Error is displayed; form retains entered values; list shows original data.

**Priority:** Medium

---

### TC-012 — Saving with no changes does not cause errors or duplicate records

**Preconditions:** User is logged in as admin; edit form is open for **Blockchain Fundamentals** with no modifications.

**Steps:**
1. Open edit form for **Blockchain Fundamentals**.
2. Do not change any fields.
3. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Saving without changes does not alter program data
  Given I am logged in as admin
  And I am editing "Blockchain Fundamentals"
  When I click Save without changing any fields
  Then the modal closes
  And the program list shows exactly one "Blockchain Fundamentals"
  And no error message is displayed
```

**Expected result:** No-op save succeeds gracefully or **Save** is disabled until a change is detected; no duplicate or corrupted record.

**Priority:** Low

---

## Edge Cases

### TC-013 — Name at maximum allowed length can be saved

**Preconditions:** User is logged in as admin; edit form is open; maximum **Name** length is 255 characters (verify against spec).

**Steps:**
1. Change **Name** to a 255-character valid name.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted on edit
  Given I am logged in as admin
  And I am editing "Advanced Machine Learning Certificate"
  When I change the Name to a 255-character valid name
  And I click Save
  Then the modal closes
  And the program list shows the 255-character program name
```

**Expected result:** Full name is stored and displayed correctly.

**Priority:** Medium

---

### TC-014 — Name exceeding maximum length is rejected

**Preconditions:** User is logged in as admin; edit form is open for **AI Ethics Program**.

**Steps:**
1. Change **Name** to a 256-character value.
2. Attempt to save.

**Gherkin:**
```gherkin
Scenario: Program Name exceeding maximum length is rejected on edit
  Given I am logged in as admin
  And I am editing "AI Ethics Program"
  When I change the Name to a 256-character name
  Then the Save button is disabled or I see a validation error for Name
  And no changes are saved
```

**Expected result:** Over-limit input is blocked; original name remains in the list.

**Priority:** Medium

---

### TC-015 — Special characters in Name are handled correctly on edit

**Preconditions:** User is logged in as admin; edit form is open for **C Programming Basics**.

**Steps:**
1. Change **Name** to `C++ & C#: "Intro" (2026) — 100% Online`.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Special characters in edited Name are stored and displayed correctly
  Given I am logged in as admin
  And I am editing "C Programming Basics"
  When I change the Name to "C++ & C#: \"Intro\" (2026) — 100% Online"
  And I click Save
  Then the modal closes
  And the program list shows "C++ & C#: \"Intro\" (2026) — 100% Online"
```

**Expected result:** Name saves without encoding corruption or XSS issues.

**Priority:** Medium

---

### TC-016 — Unicode characters in Description are preserved on edit

**Preconditions:** User is logged in as admin; edit form is open for **Global Business Program**.

**Steps:**
1. Change **Description** to `Programme global — グローバルビジネス — Développement international`.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Unicode characters in edited Description are preserved
  Given I am logged in as admin
  And I am editing "Global Business Program"
  When I change the Description to "Programme global — グローバルビジネス — Développement international"
  And I click Save
  Then the modal closes
  And the program description is "Programme global — グローバルビジネス — Développement international"
```

**Expected result:** Unicode renders correctly in list and detail views.

**Priority:** Low

---

### TC-017 — Leading and trailing spaces are trimmed from edited Name

**Preconditions:** User is logged in as admin; edit form is open for **Network Security Program**.

**Steps:**
1. Change **Name** to `  Network Security Program — Advanced  `.
2. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces are trimmed from edited Name
  Given I am logged in as admin
  And I am editing "Network Security Program"
  When I change the Name to "  Network Security Program — Advanced  "
  And I click Save
  Then the modal closes
  And the program list shows "Network Security Program — Advanced"
```

**Expected result:** Stored name is trimmed; duplicate checks use trimmed value.

**Priority:** Medium

---

### TC-018 — Description can be cleared if optional

**Preconditions:** User is logged in as admin; program **Robotics 101** has a non-empty Description; Description is optional per product rules.

**Steps:**
1. Open edit form for **Robotics 101**.
2. Clear **Description** completely.
3. Click **Save**.

**Gherkin:**
```gherkin
Scenario: Description can be cleared on edit when field is optional
  Given I am logged in as admin
  And I am editing "Robotics 101" with a non-empty description
  When I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows "Robotics 101"
  And the program has no description
```

**Expected result:** Save succeeds with empty Description if business rules allow; **Name** unchanged.

**Priority:** Low

---

### TC-019 — Double-click on Save does not create duplicate updates or records

**Preconditions:** User is logged in as admin; edit form is open for **Quantum Computing Intro**.

**Steps:**
1. Change **Name** to `Quantum Computing Intro — Updated`.
2. Double-click **Save** rapidly.

**Gherkin:**
```gherkin
Scenario: Double submission on edit does not cause duplicate side effects
  Given I am logged in as admin
  And I am editing "Quantum Computing Intro"
  When I change the Name to "Quantum Computing Intro — Updated"
  And I double-click Save
  Then the modal closes
  And the program list shows exactly one "Quantum Computing Intro — Updated"
```

**Expected result:** Single update is applied; **Save** is disabled during submission.

**Priority:** Medium

---

### TC-020 — Concurrent edit by another user is handled gracefully

**Preconditions:** Two admin sessions; program **Web Development 2026** exists; Admin A has edit form open; Admin B saves a change to the same program before Admin A saves.

**Steps:**
1. Admin A opens edit form for **Web Development 2026**.
2. Admin B changes Description and saves.
3. Admin A changes Name and clicks **Save**.

**Gherkin:**
```gherkin
Scenario: Concurrent edit conflict is detected or last-write wins with clear behavior
  Given admin user A is editing "Web Development 2026"
  And admin user B updates "Web Development 2026" and saves successfully
  When admin user A changes the Name to "Web Development 2026 - Updated"
  And admin user A clicks Save
  Then either the save succeeds with merged or overwritten data per conflict policy
  Or I see a conflict error indicating the program was modified by another user
  And the program list reflects consistent final state
```

**Expected result:** No silent data loss; conflict policy (optimistic locking, last-write-wins, or error) is applied consistently.

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Open program for editing | TC-001 |
| Successfully edit a program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Field naming inconsistency:** Create flow uses **Program Name**; edit flow uses **Name**. Confirm whether these are the same field in the UI and API.
2. **Pre-populated fields scope:** AC says "program's current data" but only Name and Description are implied. Clarify whether other fields (status, dates, IDs) appear in the edit form.
3. **Login/role requirement:** Open-for-edit AC does not specify admin login; assumed from DS-1 context — confirm required roles (TC-009).
4. **Description edit-only scenario:** AC does not specify the program name or before/after Description values used in TC-003.
5. **Cancel / unsaved changes:** No AC for discarding edits or confirming navigation away with dirty form (TC-005).
6. **Validation rules:** No AC for empty Name, whitespace-only Name, or max-length on edit (TC-006, TC-007, TC-013, TC-014).
7. **Duplicate names on rename:** Uniqueness when renaming to an existing program name is unspecified (TC-008).
8. **Optional Description:** Can Description be cleared on edit? Not stated (TC-018).
9. **No-change save:** Behavior when Save is clicked without modifications is undefined (TC-012).
10. **Success feedback:** No AC for toast/notification after successful save.
11. **List update mechanism:** AC requires immediate list update but does not specify sort order change or pagination behavior.
12. **Error handling:** No AC for API/network failures during save (TC-011).
13. **Concurrent edits:** No AC for two users editing the same program simultaneously (TC-020).
14. **Modal vs page:** AC references modal closing; confirm edit is always modal-based.
