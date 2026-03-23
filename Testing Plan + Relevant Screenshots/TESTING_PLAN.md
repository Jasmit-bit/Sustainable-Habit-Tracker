# Sustainable Habit Tracker Testing Plan

## Auth Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

<br><br>

## Home Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

<br><br>

## Log Habit Page - Test Plan

#### Unit/Integration testing is stored in `Sustainable Habit Tracker\src\services` and ...

### Unit Testing 

Testing logic and the limits I set on the habitlog page using mock data

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| LOG-UT-01 | Getting habit data (Existing) | 'getHabit()' | Attempt to retrieve habit with id of 5 | Habit field should be retrieved | Vitest returns correct habit | Pass |
| LOG-UT-02 | Getting habit data (Non existant) | 'getHabit()' | Attempt to retrieve habit with id of 999 | Error should be returned | Vitest returns an error | Pass |
| LOG-UT-03 | Getting habits with a specific category| 'getHabitsByCategory()' | Attempt to retrieve habits with category of 'food' | All habits with category of 'food' should be returned | Vitest returns all expected habits | Pass |
| LOG-UT-04 | Getting habits with category of 'nonexistent' | 'getHabitsByCategory()' | Attempt to retrieve habits with a nulnonexistent category | empty array | Vitest returns an empty array | Pass |
| LOG-UT-05 | Calculating Co2 saved from transport | 'calculateTransportCo2Saved' | Attempt to calculate co2 saved from cycling 5km | 1.0 | 1.0 | Pass |
| LOG-UT-06 | Calculating Co2 saved (with supabase error) | 'calculateTransportCo2Saved' | Attempt to calculate co2 saved from cycling 5km | Should return null | null | Pass |
| LOG-UT-07 | Calculating Co2 saved with a distance of 0 | 'calculateTransportCo2Saved' | Attempt to calculate co2 saved from cycling 0km | 0 | 0 | Pass |
| LOG-UT-08 | Logging a food/shopping habit (Successful) | 'logNormalHabit()' | Attempt to log a mock habit | null | null | Pass |
| LOG-UT-09 | Logging a food/shopping habit with a profile that has no existing Co2 saved | 'logNormalHabit()' | Attempt to log a mock habit with a non existent habit | null | null | Pass |
| LOG-UT-10 | Logging a non existent food/shopping habit | 'logNormalHabit()' | Attempt to log a non existent habit with an existing profile  | 'Habit not found' | 'TypeError: Cannot read properties of null (reading '0')' | Fail |
| LOG-UT-11 | Logging a food/shopping habit but inserting into the database fails | 'logNormalHabit()' | Attempt to log existing habit but simulate a database error | error | error | Pass |
| LOG-UT-12 | Logging habit where profile update fails | 'logNormalHabit()' | Attempt to log habit but profile update fails | '{ error: 'Update failed' }' | Update failed | Pass |
| LOG-UT-13 | Logging transport habit (Successful) | 'logTransportHabit()' | Attempt to log transport habit with distance 10km | null | null | Pass |
| LOG-UT-14 | Logging transport habit with decimal CO2 values | 'logTransportHabit()' | Attempt to log transport habit with CO2 rate 0.33 over 3km | null | null | Pass |
| LOG-UT-15 | Logging non-existent transport habit | 'logTransportHabit()' | Attempt to log transport habit with ID that doesn't exist | Habit not found | 'TypeError: Cannot read properties of null (reading '0')' | Fail |
| LOG-UT-16 | Logging transport habit where habit_logs insert fails | 'logTransportHabit()' | Attempt to log transport habit but database insert fails | Insert failed | Insert failed | Pass |
| LOG-UT-17 | Logging transport habit where profile update fails | 'logTransportHabit()' | Attempt to log transport habit but profile update fails | Update failed | Update failed | Pass |


### Integration Testing

Testing UI Interaction and component changes on the habitlog Page

| Test ID | Feature Being Tested | Component | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| LOG-IT-01 | Saving a 'Food Waste Recycling' habit | 'Food Waste Recycling' interface | Select a dropdown habit and click on save | 'habit logged successfully' | 'habit logged successfully' | Pass |
| LOG-IT-02 | Saving a 'Transport' habit with a positive distance | 'Transport' interface | Select a dropdown habit and input 12.5 for distance, then click save | 'habit logged successfully' | 'habit logged successfully' | Pass |
| LOG-IT-03 | Saving a 'Transport' habit with a non zero/positive distance | 'Transport' interface | Select a dropdown habit and input 0 or a negative number or non numeric number for distance, then click save | 'Please enter a valid distance' | 'Please enter a valid distance'  | Pass |
| LOG-IT-04 | Saving a 'Shopping Alternatives' habit | 'Shopping Alternatives' habit | Select a dropdown habit and click on save | 'habit logged sucessfully' | 'habit logged sucessfully' | Pass |


<br><br>

## Analytics Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |


<br><br>

## Family Page - Test Plan

#### Unit/Integration testing is stored in `Sustainable Habit Tracker\src\pages\Family.test.jsx`

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

<br><br>

## Settings Page - Test Plan

| Test ID | Feature Being Tested | Component/Function | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |