import { describe, test, expect } from 'vitest';
import { validateGoal, generateShareText } from './familyUtils.js';

describe('Family Page Unit Tests', function() {
  
  test('FAM-UT-01: Goal Validation rejects negative numbers', function() {
    const result = validateGoal(-5);
    expect(result).toBe("Please enter a positive goal");
  });

  test('FAM-UT-02: Goal Validation rejects unrealistic numbers', function() {
    const result = validateGoal(1000000);
    expect(result).toBe("Please set a realistic goal");
  });

  test('FAM-UT-03: Share Text generates correct string', function() {
    const result = generateShareText(50, 2);
    expect(result).toContain("saved 50 kg");
    expect(result).toContain("rank #2");
  });

});