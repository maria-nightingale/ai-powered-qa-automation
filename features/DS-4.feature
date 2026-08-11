Feature: Delete program with confirmation
  DS-4 — As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths

  @TC-001 @AC-DeleteProgramWithConfirmation
  Scenario: Delete program with confirmation
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  @TC-002 @AC-CancelProgramDeletion
  Scenario: Cancel program deletion
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I click Cancel
    Then "Test Program" still exists in the list

  # Negative

  @TC-003
  Scenario: Non-admin user cannot delete programs
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see any delete controls for programs

  @TC-004
  Scenario: Unauthenticated user cannot access program deletion
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
    And I do not see any delete controls for programs

  @TC-005
  Scenario: Server error during delete does not remove the program
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    And the server returns an error
    Then the confirmation dialog closes or remains visible with an error
    And "Test Program" still exists in the list

  # Edge cases

  @TC-006
  Scenario: Double-click on confirm does not cause errors
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I double-click confirm deletion
    Then "Test Program" is removed from the program list
    And the program list shows exactly one fewer program with that name

  @TC-007
  Scenario: Confirmation dialog appears before any deletion occurs
    Given I am logged in as admin
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And "Test Program" still exists in the list

  # Ambiguities and gaps
  # - AC does not specify the exact confirmation dialog copy or button labels (Delete vs Confirm).
  # - AC does not define behavior when DELETE API returns 404/500 (TC-005 assumes program remains).
  # - AC does not cover non-admin or unauthenticated access (TC-003, TC-004).
  # - AC does not state whether the dialog shows the program name (TC-007 only checks list unchanged before confirm).
  # - AC does not define keyboard accessibility for the confirmation dialog.
