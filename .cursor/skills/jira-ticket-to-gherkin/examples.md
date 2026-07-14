# Example: DS-1 Create New Academic Program

Derived from [DS-1](https://legionqaschool.atlassian.net/browse/DS-1). Saved as `features/DS-1.feature`.

```gherkin
Feature: Create new academic program
  DS-1 — As an admin user, I want to create a new academic program so that I can set up programs in Didaxis Studio.

  # Happy paths

  @TC-001 @AC-NavigateToCreationForm
  Scenario: Admin sees program creation form with required fields
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  @TC-002 @AC-SuccessfullyCreateProgram
  Scenario: Admin successfully creates a new academic program
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Admin creates a program with only Program Name filled
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-004
  Scenario: Admin cancels program creation without saving
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Mobile App Development"
    And I fill in Description with "iOS and Android development track"
    And I click Cancel
    Then the modal closes
    And the program list does not show "Mobile App Development"

  # Negative

  @TC-005 @AC-EmptyNameValidation
  Scenario: Validation prevents empty program name
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  @TC-006
  Scenario: Whitespace-only Program Name is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Optional description text"
    Then the Create button is disabled

  @TC-007
  Scenario: Non-admin cannot create a new program
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see "+ New Program"
    And I cannot open the program creation form

  @TC-008
  Scenario: Unauthenticated user is redirected from program creation
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
    And I cannot open the program creation form

  @TC-009
  Scenario: Duplicate program name is not allowed
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Another program with the same name"
    And I click Create
    Then I see a validation error indicating the program name already exists
    And the program list shows only one "Web Development 2026"

  # Edge cases

  @TC-010
  Scenario: Single-character Program Name is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "A"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  @TC-011
  Scenario: Program Name at maximum allowed length is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 255-character valid name
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-012
  Scenario: Program Name exceeding maximum length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 256-character name
    Then the Create button is disabled or I see a max-length validation error
    And no program is created

  @TC-013
  Scenario: Program Name with special characters is stored and displayed correctly
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Web Dev (2026) — Full-Stack & Cloud"
    And I click Create
    Then the modal closes
    And the program list shows "Web Dev (2026) — Full-Stack & Cloud"

  @TC-014
  Scenario: Leading and trailing spaces are trimmed from Program Name
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "  Cloud Computing 2026  "
    And I click Create
    Then the modal closes
    And the program list shows "Cloud Computing 2026"

  @TC-015
  Scenario: Double submission does not create duplicate programs
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Cybersecurity Essentials"
    And I double-click Create
    Then the modal closes
    And the program list shows exactly one "Cybersecurity Essentials"

  # Ambiguities and gaps
  # - AC uses "Program Name" but edit flow (DS-2) uses "Name" — confirm same field label across create/edit.
  # - AC does not state whether Description is optional; TC-003 assumes it is optional.
  # - No AC for cancel/discard behavior (TC-004).
  # - No AC for duplicate name validation (TC-009).
  # - No AC for max-length limits on Program Name or Description (TC-011, TC-012).
  # - No AC for non-admin or unauthenticated access (TC-007, TC-008).
  # - No AC for success feedback (toast/notification) after Create.
  # - AC references modal closing; confirm create is always modal-based vs full page.
  # - No AC for list update mechanism (immediate vs refresh required).
```
