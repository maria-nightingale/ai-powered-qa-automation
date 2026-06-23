# Test Plan: Program List Filtering and Display

**Feature:** Program list filtering and display  
**Prepared by:** QA  
**Scope:** Program list rendering, name/description display, empty state, and list behavior with multiple programs

---

## Positive Flows

### TC-001 — Program list displays name and description for each program

**Preconditions:** User is logged in as admin; multiple programs exist, including **Web Development 2026** (Description: **Full-stack web development program**) and **Data Science Fundamentals** (Description: **Introductory data science curriculum**).

**Steps:**
1. Navigate to the Programs page.
2. Review the program list.

**Gherkin:**
```gherkin
Scenario: Programs page displays list with name and description
  Given I am logged in as admin
  And programs exist in the system including:
    | Name                      | Description                          |
    | Web Development 2026      | Full-stack web development program   |
    | Data Science Fundamentals | Introductory data science curriculum |
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
  And I see "Web Development 2026" with description "Full-stack web development program"
  And I see "Data Science Fundamentals" with description "Introductory data science curriculum"
```

**Expected result:** Each program row/card shows **Name** and **Description** clearly.

**Priority:** High

---

### TC-002 — Empty state is shown when no programs exist

**Preconditions:** User is logged in as admin; no programs exist in the system.

**Steps:**
1. Navigate to the Programs page.
2. Observe page content.

**Gherkin:**
```gherkin
Scenario: Empty state when no programs exist
  Given I am logged in as admin
  And no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

**Expected result:** Empty state message and CTA (e.g., **+ New Program** or "Create your first program") are visible; no program rows shown.

**Priority:** High

---

### TC-003 — Empty state CTA opens program creation form

**Preconditions:** User is logged in as admin; no programs exist.

**Steps:**
1. Navigate to the Programs page.
2. Click the prompt/CTA to create the first program.

**Gherkin:**
```gherkin
Scenario: Create first program prompt opens creation form
  Given I am logged in as admin
  And no programs exist
  When I navigate to the Programs page
  And I click the prompt to create the first program
  Then I see the program creation form with fields: Program Name, Description
```

**Expected result:** Creation form opens from empty-state CTA.

**Priority:** Medium

---

### TC-004 — List updates after creating a program without manual refresh

**Preconditions:** User starts with no programs; creates **UX Design Bootcamp**.

**Steps:**
1. Navigate to Programs page (empty state).
2. Create program **UX Design Bootcamp** with description **User experience design fundamentals**.
3. Observe list after form closes.

**Gherkin:**
```gherkin
Scenario: List shows new program after creation without page reload
  Given I am logged in as admin
  And no programs exist
  When I create a program "UX Design Bootcamp" with description "User experience design fundamentals"
  Then the empty state is no longer shown
  And the program list shows "UX Design Bootcamp" with description "User experience design fundamentals"
```

**Expected result:** Empty state replaced by list with new program; no manual refresh required.

**Priority:** Medium

---

### TC-005 — Program with empty description displays correctly in list

**Preconditions:** Program **Robotics 101** exists with no description.

**Steps:**
1. Navigate to the Programs page.
2. Locate **Robotics 101** in the list.

**Gherkin:**
```gherkin
Scenario: Program without description still appears in list
  Given I am logged in as admin
  And a program "Robotics 101" exists with no description
  When I navigate to the Programs page
  Then I see "Robotics 101" in the program list
  And the description is empty or shows an appropriate placeholder such as "—" or "No description"
```

**Expected result:** Name always shown; empty description handled gracefully.

**Priority:** Medium

---

## Negative Flows

### TC-006 — Unauthenticated user cannot view program list

**Preconditions:** User is not logged in; programs exist.

**Steps:**
1. Navigate directly to the Programs page URL.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user is redirected from Programs page
  Given I am not logged in
  And programs exist in the system
  When I navigate to the Programs page
  Then I am redirected to the login page
  And I do not see the program list
```

**Expected result:** Login required; no program data exposed.

**Priority:** High

---

### TC-007 — Non-admin role access to list (if restricted)

**Preconditions:** Non-admin user logged in; programs exist.

**Steps:**
1. Navigate to Programs page as non-admin.

**Gherkin:**
```gherkin
Scenario: Non-admin program list access per role policy
  Given I am logged in as a non-admin user
  And programs exist in the system
  When I navigate to the Programs page
  Then either I see the program list with name and description per read permissions
  Or I am denied access with an appropriate message
```

**Expected result:** Behavior matches defined role permissions.

**Priority:** Medium

---

### TC-008 — Failed load does not show misleading empty state

**Preconditions:** Programs exist; API to fetch programs fails.

**Steps:**
1. Navigate to Programs page during API failure.

**Gherkin:**
```gherkin
Scenario: API error shows error state not empty state
  Given I am logged in as admin
  And programs exist in the system
  And the programs list API returns an error
  When I navigate to the Programs page
  Then I do not see the empty state message for no programs
  And I see an error message indicating programs could not be loaded
```

**Expected result:** Empty state only when count is truly zero; errors distinguished from empty.

**Priority:** High

---

## Edge Cases

### TC-009 — Long program names and descriptions display without breaking layout

**Preconditions:** Program with 255-character name and 2000-character description exists.

**Steps:**
1. Navigate to Programs page.
2. Inspect list row for truncation, tooltip, or wrap behavior.

**Gherkin:**
```gherkin
Scenario: Long name and description display correctly in list
  Given I am logged in as admin
  And a program with a 255-character name and 2000-character description exists
  When I navigate to the Programs page
  Then I see the program in the list
  And the name and description are displayed without breaking the page layout
  And full text is available via truncation with tooltip or expand if designed
```

**Expected result:** Layout intact; content accessible per UI design.

**Priority:** Medium

---

### TC-010 — Special characters and Unicode render correctly in list

**Preconditions:** Programs **Informatique & IA - Niveau 2** and **プログラム開発 2026** exist with matching descriptions.

**Steps:**
1. Navigate to Programs page.
2. Verify display of names and descriptions.

**Gherkin:**
```gherkin
Scenario: Special and Unicode characters display correctly in program list
  Given I am logged in as admin
  And programs "Informatique & IA - Niveau 2" and "プログラム開発 2026" exist
  When I navigate to the Programs page
  Then I see each program's name and description rendered correctly
  And characters such as "&", "—", and Japanese text display without corruption
```

**Expected result:** No encoding or HTML entity issues in list.

**Priority:** Medium

---

### TC-011 — Large number of programs: pagination or scroll behavior

**Preconditions:** 50+ programs exist (or threshold per spec).

**Steps:**
1. Navigate to Programs page.
2. Scroll or use pagination controls.

**Gherkin:**
```gherkin
Scenario: Large program list is navigable
  Given I am logged in as admin
  And 50 programs exist in the system
  When I navigate to the Programs page
  Then I see the program list with name and description for visible programs
  And I can access all programs via pagination or scrolling per design
```

**Expected result:** All programs reachable; performance acceptable.

**Priority:** Low

---

### TC-012 — List sort order is consistent

**Preconditions:** Multiple programs with different creation dates exist.

**Steps:**
1. Navigate to Programs page.
2. Note order of programs.

**Gherkin:**
```gherkin
Scenario: Program list order is consistent and predictable
  Given I am logged in as admin
  And multiple programs exist in the system
  When I navigate to the Programs page
  Then programs are displayed in a consistent order such as alphabetical by name or newest first
  And the order remains the same on page reload
```

**Expected result:** Documented sort order applied consistently.

**Priority:** Low

---

### TC-013 — Empty state hidden when single program exists

**Preconditions:** Exactly one program **Test Program** exists.

**Steps:**
1. Navigate to Programs page.

**Gherkin:**
```gherkin
Scenario: Empty state is not shown when programs exist
  Given I am logged in as admin
  And only the program "Test Program" exists
  When I navigate to the Programs page
  Then I do not see a message indicating no programs have been created
  And I see "Test Program" in the program list
```

**Expected result:** List view only; no empty-state messaging.

**Priority:** Medium

---

### TC-014 — Filtering programs by name (if filter UI exists)

**Preconditions:** Programs **Web Development 2026**, **Game Development 2026**, **Data Science 101** exist; filter/search available.

**Steps:**
1. Navigate to Programs page.
2. Enter `Web` in search/filter field.

**Gherkin:**
```gherkin
Scenario: Program list can be filtered by name when filter is available
  Given I am logged in as admin
  And programs "Web Development 2026", "Game Development 2026", and "Data Science 101" exist
  When I navigate to the Programs page
  And I filter programs by "Web"
  Then I see "Web Development 2026" in the filtered list
  And I do not see "Data Science 101" in the filtered list
```

**Expected result:** Filter narrows list correctly; feature applies only if filtering is in scope.

**Priority:** Low

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Display program list with key details | TC-001, TC-005, TC-009, TC-010 |
| Empty state when no programs exist | TC-002, TC-013 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **"Filtering" in feature title:** ACs cover display and empty state only; no filter/search AC despite feature name (TC-014).
2. **Login/role:** No AC for who can view the list (TC-006, TC-007).
3. **Empty description:** How programs without description appear is unspecified (TC-005).
4. **Sort order:** List ordering not defined (TC-012).
5. **Pagination:** Behavior with many programs not specified (TC-011).
6. **Empty state CTA:** Exact prompt text and action not defined (TC-002, TC-003).
7. **Loading and error states:** No AC for loading spinner or API failure vs empty (TC-008).
8. **List layout:** Table vs cards vs list not specified.
9. **Description truncation:** Long description display rules not stated (TC-009).
10. **Actions on list:** Edit/delete icons not part of this feature's ACs but may appear on same page.
11. **Real-time updates:** List refresh after create/edit/delete from other flows not specified (TC-004).
