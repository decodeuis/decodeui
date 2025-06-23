export function validateUsername(username: string) {
  if (!username) {
    return "Please enter a username";
  }
  if (username.length < 3) {
    return "Please enter a username with at least 3 characters";
  }
  // Check for invalid characters
  const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validUsernameRegex.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  return undefined; // No error, username is valid
}
