// Function to create directory if it doesn't exist
import fs from "node:fs";

export function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
