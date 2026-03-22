# Sustainable Habit Tracker Testing Plan

## Auth Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Home Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Log Habit Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Analytics Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## Family Page - Test Plan

### Unit Testing

Testing logic and the limits I set on the family page using mock data

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAM-UT-01 | Goal Validation (Negative) | `updateGoal()` | Attempt to submit a CO2 goal of `-5`. | Error message "Please enter a positive goal" is set. There is also a frontend restriction with HTML which says "Value must be greater than or equal to 1." | Vitest ran the test `updateGoal(-5)` and confirmed it correctly returned the negative number error string. And the frontend restriction didn't let us write a negative number screenshot attached | Pass |
| FAM-UT-02 | Goal Validation (Too High) | `updateGoal()` | Attempt to submit a CO2 goal of `1000000`. | Error message "Please set a realistic goal" is set. |Vitest ran `validateGoal(1000000)` and confirmed it correctly returned the realistic goal error string |Pass |
| FAM-UT-03 | Share Text Generation | `shareProgress()` | Trigger share function for a user with `50` kg saved at rank `#2`. | Generates string: "I have saved 50 kg of CO2... rank #2..." |Vitest ran generateShareText and verified the resulting string included the set 50 and 2 variables passed in |Pass |

### Integration Testing

Testing UI Interaction and component changes on the Family Page

| Test ID | Feature Being Tested | Component | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAM-IT-01 | "Create Household" UI | `Family.jsx` | 1. Load without a household.<br>2. Click "Create a Household". | The 'Enter Household Name' input form shows up on the screen. |Vitest rendered the component, simulated the click event and verified the input field appeared. |Pass |
| FAM-IT-02 | "Join Household" UI | `Family.jsx` | 1. Load without a household.<br>2. Click "Join a Household". | The 'Enter 6 Digit Invite Code' input form shows up on screen. |Vitest rendered the component and verified the invite code field appeared |Pass |
| FAM-IT-03 | Cancel Button | `Family.jsx` | 1. Click "Create a Household".<br>2. Click "Cancel". | Form disappears and initial buttons return. |Vitest simulated clicking 'Cancel' button and verified the React state removed the input form |Pass |
| FAM-IT-04 | Join Code Input State | `Family.jsx` | 1. Open Join form.<br>2. Type "ABCDEF" into input. | Input value updates to "ABCDEF" in the UI. | Vitest opned the form and succesfully typed into the join form |Pass |
| FAM-IT-05 | Join Valid Family Manual | `Family.jsx` | *(Manual)* 1. Log in.<br>2. Go to Family.<br>3. Click "Join a Household", enter `VZX2G9` as the Invite code, click Join. | Circuit Seekers V2 Family dashboard shows up |Sucessfully joined the household by following the UI (Picture Attached) |Pass |
| FAM-IT-06 | Dashboard Goal Update Manual Test | `Family.jsx` | *(Manual)* 1. Log in.<br>2. Go to Family *(Which you are an admin of)*.<br>3. Click "Edit Goal", enter 100, click Save. | Goal updates to 100 on the dashboard. | Goal Successfuly updated to 100 by following the UI (Picture Attached) |Pass |
| FAM-IT-07 | Leave Household Manual | `Family.jsx` | *(Manual)* 1. Click "Leave Household".<br>2. Click "OK" on prompt. | Returns to "You don't have a household yet!" screen. | Sucessfully left the household and returned to the "You don't have a household screen" (Picture Attached) |Pass |

## Settings Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |