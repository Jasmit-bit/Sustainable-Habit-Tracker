export function checkPasswordLength(password) {
  return password.length >= 8;
}

export function checkPasswordLetter(password) {
  return /[a-zA-Z]/.test(password);
}

export function checkPasswordNumber(password) {
  return /\d/.test(password);
}

export function validatePasswordCompleteness(password) {
  return checkPasswordLength(password) && checkPasswordLetter(password) && checkPasswordNumber(password);
}