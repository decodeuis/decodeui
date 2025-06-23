export function validateDatabaseName(name: string) {
  // Convert to lowercase since names are case-insensitive
  const normalizedName = name.toLowerCase();

  // Check length requirement (3-63 characters)
  if (normalizedName.length < 3 || normalizedName.length > 63) {
    return "Database name must be between 3 and 63 characters long";
  }

  // Check if first character is alphanumeric
  if (!/^[a-z0-9]/.test(normalizedName)) {
    return "Database name must start with a letter or number";
  }

  // Check if all characters are alphanumeric
  if (!/^[a-z0-9]+$/.test(normalizedName)) {
    return "Database name can only contain letters and numbers";
  }

  return undefined; // No error, database name is valid
}
