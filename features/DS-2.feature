Feature: Edit existing program details
  DS-2 — As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

  # Happy paths

  @TC-001 @AC-OpenProgramForEditing
  Scenario: Edit form opens pre-populated with current program data
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with description "Full-stack web development program"
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with Name "Web Development 2026"
    And I see Description "Full-stack web development program"

  @TC-002 @AC-SuccessfullyEditProgramName
  Scenario: Program name update is saved and reflected in the list
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  @TC-003 @AC-EditPreservesUnchangedFields
  Scenario: Unchanged fields are preserved when only Description is edited
    Given I am logged in as admin
    And I am editing "Data Science Fundamentals" with description "Introductory data science curriculum"
    When I change the Description to "Introductory data science curriculum — revised 2026"
    And I click Save
    Then the modal closes
    And the program list shows "Data Science Fundamentals"
    And the program description is "Introductory data science curriculum — revised 2026"

  @TC-004
  Scenario: Both Name and Description can be updated in a single save
    Given I am logged in as admin
    And I am editing "Mobile App Development" with description "iOS and Android development track"
    When I change the Name to "Mobile App Development — Advanced"
    And I change the Description to "Native and cross-platform mobile development track"
    And I click Save
    Then the modal closes
    And the program list shows "Mobile App Development — Advanced"
    And the program description is "Native and cross-platform mobile development track"

  @TC-005
  Scenario: Canceling edit discards unsaved changes
    Given I am logged in as admin
    And I am editing "Cybersecurity Essentials"
    When I change the Name to "Cybersecurity Essentials — Pro"
    And I click Cancel
    Then the modal closes
    And the program list shows "Cybersecurity Essentials"
    And the program list does not show "Cybersecurity Essentials — Pro"

  # Negative

  @TC-006
  Scenario: Empty Name prevents save
    Given I am logged in as admin
    And I am editing "UX Design Bootcamp"
    When I clear the Name field
    Then the Save button is disabled
    And the original program "UX Design Bootcamp" remains unchanged

  @TC-007
  Scenario: Whitespace-only Name is rejected
    Given I am logged in as admin
    And I am editing "Cloud Computing 2026"
    When I change the Name to "   "
    Then the Save button is disabled
    And the original program "Cloud Computing 2026" remains unchanged

  @TC-008
  Scenario: Duplicate program name is rejected on edit
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am editing "Game Development 2026"
    When I change the Name to "Web Development 2026"
    And I click Save
    Then I see an error indicating the program name already exists
    And the program list shows "Game Development 2026"

  @TC-009
  Scenario: Non-admin user cannot edit programs
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see any edit controls for programs

  @TC-010
  Scenario: Unauthenticated user cannot access program edit
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
    And I do not see any edit controls for programs

  @TC-011
  Scenario: Server error during save does not corrupt program data
    Given I am logged in as admin
    And I am editing "DevOps Engineering"
    When I change the Name to "DevOps Engineering — Updated"
    And the server returns an error on Save
    Then the modal remains open
    And the program list shows "DevOps Engineering"
    And the program list does not show "DevOps Engineering — Updated"

  @TC-012
  Scenario: Saving with no changes does not cause errors or duplicate records
    Given I am logged in as admin
    And I am editing "Blockchain Fundamentals"
    When I click Save without making changes
    Then the modal closes
    And the program list shows exactly one "Blockchain Fundamentals"

  # Edge cases

  @TC-013
  Scenario: Name at maximum allowed length can be saved
    Given I am logged in as admin
    And I am editing "Advanced Machine Learning Certificate"
    When I change the Name to a 255-character valid name
    And I click Save
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-014
  Scenario: Name exceeding maximum length is rejected
    Given I am logged in as admin
    And I am editing "AI Ethics Program"
    When I change the Name to a 256-character name
    Then the save is blocked or rejected
    And the program list shows "AI Ethics Program"

  @TC-015
  Scenario: Special characters in Name are handled correctly on edit
    Given I am logged in as admin
    And I am editing "C Programming Basics"
    When I change the Name to "C++ & C#: \"Intro\" (2026) — 100% Online"
    And I click Save
    Then the modal closes
    And the program list shows "C++ & C#: \"Intro\" (2026) — 100% Online"

  @TC-016
  Scenario: Unicode characters in Description are preserved on edit
    Given I am logged in as admin
    And I am editing "Global Business Program"
    When I change the Description to "Programme global — グローバルビジネス — Développement international"
    And I click Save
    Then the modal closes
    And the program description is "Programme global — グローバルビジネス — Développement international"

  @TC-017
  Scenario: Leading and trailing spaces are trimmed from edited Name
    Given I am logged in as admin
    And I am editing "Network Security Program"
    When I change the Name to "  Network Security Program — Advanced  "
    And I click Save
    Then the modal closes
    And the program list shows "Network Security Program — Advanced"

  @TC-018
  Scenario: Description can be cleared if optional
    Given I am logged in as admin
    And I am editing "Robotics 101" with a non-empty description
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program list shows "Robotics 101"
    And the program description is empty

  @TC-019
  Scenario: Double-click on Save does not create duplicate updates or records
    Given I am logged in as admin
    And I am editing "Quantum Computing Intro"
    When I change the Name to "Quantum Computing Intro — Updated"
    And I double-click Save
    Then the modal closes
    And the program list shows exactly one "Quantum Computing Intro — Updated"

  @TC-020
  Scenario: Concurrent edit by another user is handled gracefully
    Given I am logged in as admin A
    And I am logged in as admin B in a separate session
    And a program "Web Development 2026" exists
    When admin B saves a description change first
    And admin A attempts to save a name change
    Then the system shows a conflict or keeps the edit modal open
    And program data is not corrupted

  # Ambiguities and gaps
  # - Jira AC covers open-for-edit, rename, and preserve-unchanged-fields only; TC-004 through TC-020 extend beyond stated AC.
  # - AC uses "Name" on edit but DS-1 uses "Program Name" on create — confirm same field semantics.
  # - No AC for empty/whitespace name validation on edit (TC-006, TC-007).
  # - No AC for duplicate name on edit (TC-008); duplicate prevention on create is DS-3.
  # - No AC for cancel/discard (TC-005), server errors (TC-011), or concurrent edits (TC-020).
  # - No AC for non-admin or unauthenticated access (TC-009, TC-010).
  # - No AC for max-length limits on Name or Description (TC-013, TC-014).
  # - AC says list updates "immediately"; no AC for success feedback (toast/notification).
