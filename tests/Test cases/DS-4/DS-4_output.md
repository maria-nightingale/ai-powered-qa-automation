# Test Plan: Delete Program with Confirmation

**Feature:** Delete program with confirmation  
**Prepared by:** QA  
**Scope:** Delete action, confirmation dialog, confirm/cancel behavior, and program list update

---

## Positive Flows

### TC-001 — Confirmed deletion removes program from the list

**Preconditions:** User is logged in as admin; program **Test Program** exists with description **Program used for QA testing**.

**Steps:**
1. Navigate to the Programs page.
2. Click the delete icon for **Test Program**.
3. Verify confirmation dialog appears.
4. Click **Confirm** (or equivalent confirm action).

**Gherkin:**
```gherkin
Scenario: Admin deletes a program after confirming in dialog
  Given I am logged in as admin
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
  And I do not see "Test Program" on the Programs page
```

**Expected result:** Dialog closes; **Test Program** no longer appears in the list; deletion persists after page refresh.

**Priority:** High

---

### TC-002 — Canceling deletion keeps the program in the list

**Preconditions:** User is logged in as admin; program **Mobile App Development** exists.

**Steps:**
1. Navigate to the Programs page.
2. Click the delete icon for **Mobile App Development**.
3. When confirmation dialog appears, click **Cancel**.

**Gherkin:**
```gherkin
Scenario: Admin cancels program deletion
  Given I am logged in as admin
  And a program "Mobile App Development" exists
  When I click the delete icon for "Mobile App Development"
  Then I see a confirmation dialog
  When I click Cancel
  Then the program still exists in the list
  And the program list shows "Mobile App Development"
```

**Expected result:** Dialog closes; program remains unchanged in the list.

**Priority:** High

---

### TC-003 — Confirmation dialog displays the program name being deleted

**Preconditions:** User is logged in as admin; program **Cybersecurity Essentials** exists.

**Steps:**
1. Click the delete icon for **Cybersecurity Essentials**.
2. Read the confirmation dialog content.

**Gherkin:**
```gherkin
Scenario: Confirmation dialog identifies the program to be deleted
  Given I am logged in as admin
  And a program "Cybersecurity Essentials" exists
  When I click the delete icon for "Cybersecurity Essentials"
  Then I see a confirmation dialog
  And the dialog mentions "Cybersecurity Essentials"
```

**Expected result:** User can verify which program will be deleted before confirming.

**Priority:** Medium

---

### TC-004 — List updates immediately after deletion without page refresh

**Preconditions:** User is logged in as admin; programs **Test Program A** and **Test Program B** exist.

**Steps:**
1. Delete **Test Program A** and confirm.
2. Observe the list without reloading the page.

**Gherkin:**
```gherkin
Scenario: Program list updates immediately after confirmed deletion
  Given I am logged in as admin
  And programs "Test Program A" and "Test Program B" exist
  When I delete "Test Program A" and confirm deletion
  Then "Test Program A" is removed from the program list without reloading the page
  And "Test Program B" remains in the program list
```

**Expected result:** List reflects deletion immediately; other programs unaffected.

**Priority:** Medium

---

## Negative Flows

### TC-005 — Non-admin user cannot delete programs

**Preconditions:** User is logged in as non-admin; program **Test Program** exists.

**Steps:**
1. Navigate to the Programs page.
2. Locate **Test Program**.
3. Attempt to find or use delete action.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot delete a program
  Given I am logged in as a non-admin user
  And a program "Test Program" exists
  When I navigate to the Programs page
  Then I do not see a delete icon for "Test Program"
  And I cannot delete "Test Program"
```

**Expected result:** Delete control hidden or disabled; API/direct delete blocked.

**Priority:** High

---

### TC-006 — Unauthenticated user cannot delete programs

**Preconditions:** User is not logged in; program **Test Program** exists.

**Steps:**
1. Attempt to access Programs page or delete endpoint.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot delete programs
  Given I am not logged in
  When I navigate to the Programs page
  Then I am redirected to the login page
  And I cannot delete any program
```

**Expected result:** Redirect to login; no delete capability exposed.

**Priority:** High

---

### TC-007 — Server error during deletion leaves program in the list

**Preconditions:** User is logged in as admin; program **Test Program** exists; delete API returns error.

**Steps:**
1. Click delete icon for **Test Program**.
2. Confirm deletion while server error is active.

**Gherkin:**
```gherkin
Scenario: Server error on delete preserves program in list
  Given I am logged in as admin
  And a program "Test Program" exists
  And the program delete API returns a server error
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then I see an error message indicating deletion failed
  And "Test Program" still exists in the program list
```

**Expected result:** Error shown; program not removed; user can retry.

**Priority:** Medium

---

### TC-008 — Dismissing dialog via overlay or Escape does not delete program

**Preconditions:** User is logged in as admin; program **Data Science Fundamentals** exists.

**Steps:**
1. Click delete icon for **Data Science Fundamentals**.
2. Dismiss dialog via Escape key or clicking outside (if supported).

**Gherkin:**
```gherkin
Scenario: Dismissing confirmation dialog cancels deletion
  Given I am logged in as admin
  And a program "Data Science Fundamentals" exists
  When I click the delete icon for "Data Science Fundamentals"
  And I dismiss the confirmation dialog without confirming
  Then the program still exists in the list
  And the program list shows "Data Science Fundamentals"
```

**Expected result:** Same as Cancel — no deletion occurs.

**Priority:** Medium

---

### TC-009 — Double-click confirm does not cause errors or duplicate delete requests

**Preconditions:** User is logged in as admin; program **Test Program** exists.

**Steps:**
1. Open delete confirmation for **Test Program**.
2. Double-click **Confirm** rapidly.

**Gherkin:**
```gherkin
Scenario: Double confirmation does not cause duplicate delete side effects
  Given I am logged in as admin
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I double-click Confirm on the confirmation dialog
  Then "Test Program" is removed from the program list exactly once
  And no error occurs from duplicate delete requests
```

**Expected result:** Single deletion; confirm button disabled during request.

**Priority:** Low

---

## Edge Cases

### TC-010 — Delete program with special characters in name

**Preconditions:** Program **Informatique & IA - Niveau 2** exists.

**Steps:**
1. Click delete icon for that program.
2. Confirm deletion.

**Gherkin:**
```gherkin
Scenario: Program with special characters in name can be deleted
  Given I am logged in as admin
  And a program "Informatique & IA - Niveau 2" exists
  When I click the delete icon for "Informatique & IA - Niveau 2"
  And I confirm deletion
  Then "Informatique & IA - Niveau 2" is removed from the program list
```

**Expected result:** Deletion works; dialog shows correct name.

**Priority:** Medium

---

### TC-011 — Delete last program in the list shows empty state

**Preconditions:** Only **Test Program** exists in the system.

**Steps:**
1. Delete **Test Program** and confirm.
2. Observe Programs page.

**Gherkin:**
```gherkin
Scenario: Deleting the last program shows empty state
  Given I am logged in as admin
  And only the program "Test Program" exists
  When I delete "Test Program" and confirm deletion
  Then "Test Program" is removed from the program list
  And I see a message indicating no programs have been created
```

**Expected result:** Empty state appears per DS-5 empty-state rules.

**Priority:** Medium

---

### TC-012 — Delete program with long name displays correctly in confirmation dialog

**Preconditions:** Program with 255-character name exists.

**Steps:**
1. Initiate delete for that program.
2. Review dialog layout and text.

**Gherkin:**
```gherkin
Scenario: Long program name displays correctly in delete confirmation
  Given I am logged in as admin
  And a program with a 255-character name exists
  When I click the delete icon for that program
  Then I see a confirmation dialog
  And the full program name is visible or accessible without breaking layout
```

**Expected result:** Dialog remains usable; name not truncated misleadingly without tooltip.

**Priority:** Low

---

### TC-013 — Program linked to courses or enrollments cannot be deleted (if applicable)

**Preconditions:** **Test Program** has active enrollments or linked courses (if business rule exists).

**Steps:**
1. Attempt to delete **Test Program**.
2. Confirm if allowed.

**Gherkin:**
```gherkin
Scenario: Program with dependencies cannot be deleted without warning
  Given I am logged in as admin
  And "Test Program" has active enrollments
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then either deletion is blocked with a dependency error
  Or I see a warning about linked data before final confirmation
```

**Expected result:** Data integrity preserved; clear message if delete blocked.

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Delete program with confirmation | TC-001, TC-003, TC-004 |
| Cancel program deletion | TC-002, TC-008 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Login/role:** No AC for admin-only delete; assumed from context (TC-005).
2. **Dialog copy:** Exact confirmation message and button labels not specified (TC-003).
3. **Soft vs hard delete:** Whether program is permanently removed or archived is undefined.
4. **Dependencies:** No AC for programs with courses, students, or enrollments (TC-013).
5. **Success feedback:** No toast/notification after successful delete.
6. **Undo:** No AC for undo or restore after deletion.
7. **Dismiss behavior:** Escape/outside-click not specified (TC-008).
8. **Error handling:** API failure behavior not in ACs (TC-007).
9. **Empty state transition:** Deleting last program should trigger empty state — cross-feature with DS-5 (TC-011).
10. **List refresh:** "Removed from list" — immediate vs after refresh not explicit (TC-004).
