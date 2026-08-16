Feature: Program list filtering and display
  DS-5 — As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

  # Happy paths

  @TC-001 @AC-DisplayProgramListWithKeyDetails
  Scenario: Display program list with key details
    Given I am logged in as admin
    And a program named "Computer Science BSc" with description "Undergraduate CS degree track" exists
    When I navigate to the Programs page
    Then I see "Computer Science BSc" in the program list
    And I see the description "Undergraduate CS degree track" for that program

  @TC-002 @AC-DisplayProgramListWithKeyDetails
  Scenario: Multiple programs each show name and description
    Given I am logged in as admin
    And a program named "Data Science MSc" with description "Graduate data science track" exists
    And a program named "Web Development Certificate" with description "Full-stack web skills" exists
    When I navigate to the Programs page
    Then I see both programs in the list with their respective descriptions

  @TC-003 @AC-EmptyStateWhenNoProgramsExist
  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  # Negative

  @TC-004
  Scenario: Non-admin user can view the program list but not manage programs
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I see the program list or empty state
    And I do not see "+ New Program"

  @TC-005
  Scenario: Unauthenticated user is redirected from the Programs page
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page

  @TC-006
  Scenario: Programs API 500 shows an error, not an empty success state
    Given I am logged in as admin
    When GET /api/programs returns HTTP 500
    And I navigate to the Programs page
    Then I see an error state indicating programs could not be loaded
    And I do not see the empty-state "no programs have been created" success message

  @TC-007
  Scenario: Malformed programs API response shows an error, not a blank page
    Given I am logged in as admin
    When GET /api/programs returns a malformed JSON body
    And I navigate to the Programs page
    Then I see an error state indicating programs could not be loaded
    And the page is not blank

  # Edge cases

  @TC-008
  Scenario: Program with empty description still appears in the list
    Given I am logged in as admin
    And a program named "Philosophy BA" with an empty description exists
    When I navigate to the Programs page
    Then I see "Philosophy BA" in the program list

  @TC-009
  Scenario: Long program name and description remain visible in the list
    Given I am logged in as admin
    And a program with a 255-character name and a long description exists
    When I navigate to the Programs page
    Then the program name is visible in the list
    And the description is visible or truncated in a readable way without breaking the layout

  @TC-010
  Scenario: Special characters in name and description render as text
    Given I am logged in as admin
    And a program named "C++ & C# Foundations" with description "Covers <algorithms> & \"data structures\"" exists
    When I navigate to the Programs page
    Then I see "C++ & C# Foundations" in the program list
    And the description is shown as plain text, not interpreted as HTML

  @TC-011
  Scenario: HTML in description is not executed as markup
    Given I am logged in as admin
    And a program named "Security Basics" with description "<img src=x onerror=alert(1)>XSS probe" exists
    When I navigate to the Programs page
    Then I see "Security Basics" in the program list
    And no script or image from the description is executed
    And the description text is escaped or sanitized

  @TC-012
  Scenario: Programs page meets WCAG 2 A/AA for the program list
    Given I am logged in as admin
    And at least one program exists
    When I navigate to the Programs page
    Then axe finds no violations for tags wcag2a and wcag2aa on the programs list view

  # Ambiguities and gaps
  # - Story title mentions "filtering" but Acceptance Criteria only cover list display and empty state.
  #   No filter/search UI, filter fields, or filter behavior is specified — no filtering scenarios authored.
  # - Empty-state exact copy and CTA label are not specified (TC-003 asserts presence of message + create prompt).
  # - AC does not define error UI for failed/malformed list loads (TC-006, TC-007 assume an error state, not empty success).
  # - AC does not cover non-admin or unauthenticated access (TC-004, TC-005).
  # - AC does not define truncation/overflow for long names (TC-009) or XSS handling (TC-011).
  # - Management action icons (edit/delete) are out of scope for DS-5 ACs (covered by DS-2/DS-4).
