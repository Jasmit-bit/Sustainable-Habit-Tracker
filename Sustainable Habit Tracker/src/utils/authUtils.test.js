import { describe, test, expect } from 'vitest';
import { checkPasswordLength, checkPasswordLetter, checkPasswordNumber, validatePasswordCompleteness } from './authUtils.js';

describe('Auth Password Validation Rules', function() {
  
  test('AUTH-UT-01: Password Length Checl', function() {
    expect(checkPasswordLength("passw")).toBe(false); 
    expect(checkPasswordLength("Password123")).toBe(true); 
  });
  test('AUTH-UT-02: Password Letter Check', function() {
    expect(checkPasswordLetter("327482")).toBe(false); 
    expect(checkPasswordLetter("Password123")).toBe(true); 
  });
  test('AUTH-UT-03: Password Number Check', function() {
    expect(checkPasswordNumber("Passwordabcde")).toBe(false); 
    expect(checkPasswordNumber("Password123")).toBe(true); 
  });
  test('AUTH-UT-04: Complete Password Check', function() {
    expect(validatePasswordCompleteness("didthiswork")).toBe(false);
    expect(validatePasswordCompleteness("StrongPassword47")).toBe(true);
  });

});