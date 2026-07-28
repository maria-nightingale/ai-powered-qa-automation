Feature: Program name validation and duplicate prevention
  DS-3 — As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

  # Happy paths

  @TC-001 @AC-AcceptSpecialCharacters
  Scenario: Program name with special characters is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "French-language AI and informatics track"
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  # Negative

  @TC-002 @AC-RejectWhitespaceOnly
  Scenario: Whitespace-only program name is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Optional description text"
    And I click Create
    Then the form is not submitted
    And no program is created

  @TC-003 @AC-RejectDuplicateName
  Scenario: Duplicate program name is rejected
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Second program with the same name"
    And I click Create
    Then I see an error indicating the program name already exists
    And the program list shows only one "Web Development 2026"

  @TC-004
  Scenario: Empty program name prevents submission
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Optional description text"
    Then the Create button is disabled

  # Edge cases

  @TC-005
  Scenario: Case-variant duplicate program name is rejected
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "web development 2026"
    And I click Create
    Then I see an error indicating the program name already exists
    And the program list shows only one "Web Development 2026"

  @TC-006
  Scenario: Duplicate name with trailing spaces is rejected after trim
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026   "
    And I click Create
    Then I see an error indicating the program name already exists
    And the program list shows only one "Web Development 2026"

  @TC-007
  Scenario: Program name with internal multiple spaces is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Data   Science   2026"
    And I click Create
    Then the modal closes
    And the program list shows "Data   Science   2026"

  # Ambiguities and gaps
  # - AC does not define maximum Program Name length; linked bugs reference both 100 and 255 characters.
  # - AC does not state whether duplicate checks are case-insensitive (TC-005 assumes they are).
  # - AC does not specify whether leading/trailing spaces are trimmed before duplicate comparison (TC-006 assumes yes).
  # - AC does not define the exact duplicate error message text or accessibility role (alert vs inline validation).
  # - AC covers create flow only; duplicate prevention on edit is out of scope for DS-3 (see DS-2).
