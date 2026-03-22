# Sustainable Habit Tracker - Test Plan

## Unit Testing
Testing individual functions and calculations in isolation.

| Test ID | Feature Being Tested | Function Name | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UT-01 | CO2 Calculation Math | `calculateCO2Saved()` | Pass in an array of 2 mock logs (10kg and 5.5kg). | Function returns `15.50`. | | |
| UT-02 | Smart Activity Predictor | `predictActivity()` | Pass in mock morning logs showing "Cycling" as the most frequent. | Function returns `"Cycling"`. | | |
| UT-03 | Blank State Predictor | `predictActivity()` | Pass in an empty array `[]`. | Function returns an empty string `""` without crashing. | | |

## Integration Testing
Testing how the UI, logic, and database work together.

| Test ID | Feature Being Tested | Component | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| IT-01 | Quick Log Button | `Analytics.jsx` | 1. Click "Log it now". <br> 2. Check screen. | Success message "✅ Successfully logged..." appears. | | |
| IT-02 | Goal Update Flow | `Family.jsx` | 1. Click "Edit Goal". <br> 2. Enter `-5`. <br> 3. Click Save. | Error message "Please enter a positive goal" appears. Goal does not update. | | |