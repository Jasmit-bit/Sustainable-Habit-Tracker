import { describe, test, expect } from 'vitest';
import { predictActivity, getTopHabits } from '../pages/Analytics.jsx';

// Helper to build a fake log entry
function makeLog(habitName, hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return {
    timestamp: date.toISOString(),
    habit: { habit_name: habitName },
  };
}

// Helper to build a fake log entry with monthly metadata for getTopHabits
function makeFullLog(habitName, hour, monthsAgo = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setHours(hour, 0, 0, 0);
  return {
    timestamp: date.toISOString(),
    habit: { habit_name: habitName },
  };
}

describe('Prediction Unit Tests', function () {

  test('PRED-UT-01: predictActivity returns most frequent habit in current time window', function () {
    const currentHour = new Date().getHours();
    const logs = [
      makeLog('Walking', currentHour),
      makeLog('Walking', currentHour),
      makeLog('Cycling', currentHour),
    ];
    const result = predictActivity(logs);
    expect(result).toBe('Walking');
  });

  test('PRED-UT-02: predictActivity falls back to all logs when no match in current time window', function () {
    // Use an hour guaranteed to be outside the current time bucket
    const currentHour = new Date().getHours();
    const oppositeHour = currentHour >= 12 ? 7 : 14; // morning vs afternoon
    const logs = [
      makeLog('Cycling', oppositeHour),
      makeLog('Cycling', oppositeHour),
      makeLog('Walking', oppositeHour),
    ];
    // Falls back to all logs — most frequent overall should be returned
    const result = predictActivity(logs);
    expect(result).toBe('Cycling');
  });

  test('PRED-UT-03: predictActivity returns empty string for empty logs', function () {
    const result = predictActivity([]);
    expect(result).toBe('');
  });

  test('PRED-UT-04: getTopHabits returns top 3 habits sorted by total frequency', function () {
    const logs = [
      makeFullLog('Walking', 9),
      makeFullLog('Walking', 9),
      makeFullLog('Walking', 9),
      makeFullLog('Cycling', 9),
      makeFullLog('Cycling', 9),
      makeFullLog('Shopping', 9),
    ];
    const result = getTopHabits(logs);
    expect(result.length).toBe(3);
    expect(result[0].name).toBe('Walking');
    expect(result[1].name).toBe('Cycling');
    expect(result[2].name).toBe('Shopping');
  });

  test('PRED-UT-05: getTopHabits returns correct this-month count', function () {
    const logs = [
      makeFullLog('Walking', 9, 0), // this month
      makeFullLog('Walking', 9, 0), // this month
      makeFullLog('Walking', 9, 1), // last month
    ];
    const result = getTopHabits(logs);
    expect(result[0].name).toBe('Walking');
    expect(result[0].monthCount).toBe(2);
  });

  test('PRED-UT-06: getTopHabits returns empty array for empty logs', function () {
    const result = getTopHabits([]);
    expect(result).toEqual([]);
  });

});
