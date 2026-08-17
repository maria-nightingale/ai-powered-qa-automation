Feature: Add user in Settings
  DS-215 — As an admin, I want to add a user from Settings so that I can grant access to Didaxis Studio.

  # Happy paths

  @TC-001 @AC-NavigateToAddUser
  Scenario: Admin sees the Users section and Add User control on Settings
    Given I am logged in as admin
    When I navigate to the Settings page
    Then I see the heading "Users"
    And I see the "Add User" button

  @TC-002 @AC-AddUserFormFields
  Scenario: Add User form displays required fields
    Given I am logged in as admin
    And I am on the Settings page
    When I click "Add User"
    Then I see the "Add User" dialog
    And I see fields: Name, Email, Password, Role
    And I see the "Create User" button
    And the Role field defaults to "EDITOR"

  @TC-003 @AC-SuccessfullyAddUser
  Scenario: Admin creates a user with the default EDITOR role
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Instructor Elena"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "Password1!"
    And I click "Create User"
    Then the dialog closes
    And the users table shows that name, email, and role "EDITOR"

  @TC-004
  Scenario: Admin creates a user with the VIEWER role
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Viewer Victor"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "Password1!"
    And I select Role "VIEWER"
    And I click "Create User"
    Then the dialog closes
    And the users table shows that email with role "VIEWER"

  @TC-005
  Scenario: Admin creates a user with the ADMIN role
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Admin Avery"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "Password1!"
    And I select Role "ADMIN"
    And I click "Create User"
    Then the dialog closes
    And the users table shows that email with role "ADMIN"

  @TC-006
  Scenario: Closing the Add User dialog without submitting does not create a user
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Cancelled User"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "Password1!"
    And I close the dialog without clicking Create User
    Then the dialog is hidden
    And the users table does not show that email

  # Negative

  @TC-007 @AC-RequiredFields
  Scenario: Create User is disabled when required fields are empty
    Given I am logged in as admin
    And I am on the Add User form
    When I leave Name, Email, and Password empty
    Then the "Create User" button is disabled

  @TC-008
  Scenario: Invalid email does not create a user
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Invalid Email"
    And I fill in Email with "not-an-email"
    And I fill in Password with "Password1!"
    And I click "Create User"
    Then the Add User dialog remains open
    And the users table does not show "not-an-email"

  @TC-009
  Scenario: Duplicate email is rejected
    Given I am logged in as admin
    And a user already exists with email "qa-ds215-dup@college.edu"
    And I am on the Add User form
    When I fill in Name with "QA Duplicate Email"
    And I fill in Email with the same existing email
    And I fill in Password with "Password1!"
    And I click "Create User"
    Then the Add User dialog remains open
    And the users table still shows that email exactly once

  @TC-010
  Scenario: Unauthenticated user is redirected from Settings
    Given I am not logged in
    When I navigate to the Settings page
    Then I am redirected to the login page
    And I do not see the "Add User" button

  # Edge cases

  @TC-011
  Scenario: Password shorter than 8 characters keeps Create User disabled
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Short Password"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "1234567"
    Then the "Create User" button is disabled

  @TC-012
  Scenario: Password of exactly 8 characters enables Create User
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Min Password"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "12345678"
    Then the "Create User" button is enabled

  @TC-013
  Scenario: Special characters in the user name are stored as text
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "María O'Connor-Smith (QA)"
    And I fill in Email with a unique college.edu address
    And I fill in Password with "Password1!"
    And I click "Create User"
    Then the dialog closes
    And the users table shows "María O'Connor-Smith (QA)" as text

  @TC-014
  Scenario: Plus-addressed email is accepted
    Given I am logged in as admin
    And I am on the Add User form
    When I fill in Name with "QA Plus Address"
    And I fill in Email with a unique plus-addressed college.edu address
    And I fill in Password with "Password1!"
    And I click "Create User"
    Then the dialog closes
    And the users table shows that plus-addressed email

  @TC-015
  Scenario: Keyboard opens the Add User dialog from the Add User button
    Given I am logged in as admin
    And I am on the Settings page
    When I focus the "Add User" button
    And I press Enter
    Then the "Add User" dialog is visible

  @TC-016
  Scenario: Add User dialog meets WCAG 2 A/AA
    Given I am logged in as admin
    And I am on the Add User form
    When I scan the Add User dialog for WCAG 2 A and AA
    Then there are no axe violations
    # Known product bug: Mantine modal close button has no accessible name (axe button-name, WCAG 4.1.2).
    # Spec uses test.fixme until the app adds an aria-label. Do not .disableRules().

  # Ambiguities and gaps
  # - DS-215 has no description and no acceptance criteria; coverage is inferred from the title
  #   "User should be able to add user in Settings" and the live Settings UI at /settings.
  # - Add User fields observed: Name *, Email *, Password *, Role (default EDITOR; options ADMIN, EDITOR, VIEWER).
  #   Submit control is "Create User". There is no Cancel button; the dialog closes via the header control or Escape.
  # - POST /api/users returns 201 { data: { id, email, name, role, is_active }, message: "User created" }.
  # - Duplicate email: API returns 409 { message: "Email already in use" }; the dialog stays open but no alert/toast
  #   copy was visible. Assert dialog remains and the email appears once — do not invent UI error copy.
  # - Invalid email ("not-an-email"): Create User stays enabled; submit does not create a user (native type=email).
  #   No custom invalid-email message was observed.
  # - Password: Create User is disabled at 7 characters and enabled at 8. The Add User form has no "minimum 8"
  #   helper (that copy exists only under Change Password).
  # - Whitespace-only Name is currently accepted by the API (201). Not automated as expected rejection.
  # - There is no DELETE /api/users/{id}. Cleanup must PATCH /api/users/{id} with { "is_active": false }.
  # - Non-admin access is not covered: DIDAXIS_INSTRUCTOR_EMAIL is not set in this environment.
  # - Role select is a Mantine Select exposed as textbox "Role" with listbox options, not a combobox.
