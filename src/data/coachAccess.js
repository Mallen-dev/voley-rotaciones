const PASSWORD = "navidad";
const KEY = "voley-coach-v1";

export function coachUnlocked() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockCoach(input) {
  if (input.trim().toLowerCase() !== PASSWORD) return false;
  localStorage.setItem(KEY, "1");
  return true;
}
