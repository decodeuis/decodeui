// Function to calculate the checksum of the file
import crypto from "node:crypto";

export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
