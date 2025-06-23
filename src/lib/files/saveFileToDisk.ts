// Function to save file to disk
import fs from "node:fs";
import path from "node:path";

export function saveFileToDisk(
  directory: string,
  fileName: string,
  data: Buffer,
) {
  const filePath = path.join(directory, fileName);
  fs.writeFileSync(filePath, data);
  return filePath;
}
