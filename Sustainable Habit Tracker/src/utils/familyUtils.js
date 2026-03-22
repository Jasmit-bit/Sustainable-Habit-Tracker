
export function validateGoal(goalNumber) {
  if (goalNumber <= 0) return "Please enter a positive goal";
  if (goalNumber >= 1000000) return "Please set a realistic goal";
  return "Valid";
}

export function generateShareText(saved, position) {
  return `I have saved ${saved} kg of CO2 this month and I'm currently rank #${position} in my household on the Sustainable Habit Tracker App! Can you beat me? Message me to get my family code, lets Compete!!!`;
}