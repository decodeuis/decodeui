import os from "node:os";
import path from "node:path";

export function getBaseDir() {
  return os.platform() === "win32"
    ? "C:\\UploadFiles"
    : path.join(os.homedir(), "UploadFiles");
}
