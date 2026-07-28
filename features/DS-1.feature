Feature: Create new academic program
  DS-1 — As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

  # Happy paths

  @TC-001 @AC-NavigateToCreationForm
  Scenario: Program creation form displays required fields
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description
    And I see the Create button

  @TC-002 @AC-SuccessfullyCreateProgram
  Scenario: New program is created and appears in the program list
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Program can be created with Program Name only
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-004
  Scenario: Canceling the form does not create a program
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Mobile App Development"
    And I fill in Description with "iOS and Android development track"
    And I click Cancel
    Then the modal closes
    And the program list does not show "Mobile App Development"

  # Negative

  @TC-005 @AC-EmptyNameValidation
  Scenario: Create button is disabled when Program Name is empty
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Optional description text"
    Then the Create button is disabled

  @TC-006
  Scenario: Whitespace-only Program Name is treated as empty
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Optional description text"
    Then the Create button is disabled

  @TC-007
  Scenario: Non-admin user cannot access program creation
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see "+ New Program"
    And I cannot open the program creation form

  @TC-008
  Scenario: Unauthenticated user cannot access program creation
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
    And I cannot open the program creation form

  @TC-009
  Scenario: Duplicate program name is rejected
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Second program with the same name"
    And I click Create
    Then I see an error indicating the program name already exists
    And the program list shows only one "Web Development 2026"

  @TC-010
  Scenario: Program is not created when server returns an error
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Cloud Computing 2026"
    And I fill in Description with "AWS and Azure fundamentals"
    And the server returns an error on Create
    Then the modal remains open
    And no program is created

  # Edge cases

  @TC-011
  Scenario: Program Name at minimum valid length (1 character) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "A"
    And I fill in Description with "Single-character name boundary test"
    And I click Create
    Then the modal closes
    And the program list shows "A"

  @TC-012
  Scenario: Program Name at maximum allowed length is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 255-character valid name
    And I fill in Description with "Max length boundary test"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-013
  Scenario: Program Name exceeding maximum length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 256-character name
    And I fill in Description with "Over max length test"
    And I click Create
    Then the modal remains open
    And no program is created

  @TC-014
  Scenario: Special characters in Program Name are handled correctly
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "C++ & C#: \"Intro\" (2026) — 100% Online"
    And I fill in Description with "Special characters validation test"
    And I click Create
    Then the modal closes
    And the program list shows "C++ & C#: \"Intro\" (2026) — 100% Online"

  @TC-015
  Scenario: Unicode and international characters in Program Name are accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "プログラム開発 2026 — Développement Web"
    And I fill in Description with "Unicode and international character support test"
    And I click Create
    Then the modal closes
    And the program list shows "プログラム開発 2026 — Développement Web"

  @TC-016
  Scenario: Leading and trailing spaces are trimmed from Program Name
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "  Cybersecurity Essentials  "
    And I fill in Description with "Trim behavior test"
    And I click Create
    Then the modal closes
    And the program list shows "Cybersecurity Essentials"

  @TC-017
  Scenario: Description at maximum allowed length is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "UX Design Bootcamp"
    And I fill in Description with a 2000-character description
    And I click Create
    Then the modal closes
    And the program list shows "UX Design Bootcamp"

  @TC-018
  Scenario: Description exceeding maximum length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "DevOps Engineering"
    And I fill in Description with a 2001-character description
    And I click Create
    Then the modal remains open
    And no program is created

  @TC-019
  Scenario: Double-click on Create does not create duplicate programs
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Blockchain Fundamentals"
    And I fill in Description with "Distributed ledger technology program"
    And I double-click Create
    Then the modal closes
    And the program list shows exactly one "Blockchain Fundamentals"

  @TC-020
  Scenario: Program list updates without manual page refresh
    Given I am logged in as admin
    And I am on the Programs page
    When I create a program named "Game Development 2026" with description "Unity and Unreal Engine track"
    Then the program list shows "Game Development 2026"
    And the page URL does not change

  # Ambiguities and gaps
  # - Jira AC covers only form display, successful create, and empty-name validation; TC-003 through TC-020 extend beyond stated AC.
  # - AC does not state whether Description is optional; TC-003 assumes it is optional.
  # - No AC for cancel/discard behavior (TC-004), duplicate name (TC-009), or server errors (TC-010).
  # - No AC for max-length limits on Program Name or Description (TC-012, TC-013, TC-017, TC-018).
  # - No AC for non-admin or unauthenticated access (TC-007, TC-008).
  # - No AC for success feedback (toast/notification) after Create.
  # - AC references modal closing; confirm create is always modal-based vs full page.
  # - Whitespace-only name validation overlaps DS-3; DS-1 TC-006 and DS-3 TC-002 cover the same behavior on create.
