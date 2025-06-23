import fs from "node:fs";
import path from "node:path";

/**
 * Load the system prompt from the markdown file
 */
const loadSystemPrompt = () => {
  try {
    // Try different possible paths to find the markdown file
    const possiblePaths = [
      path.join(__dirname, "SYSTEM_PROMPT.md"),
      path.join(
        process.cwd(),
        "src",
        "routes",
        "api",
        "chat",
        "SYSTEM_PROMPT.md",
      ),
      path.resolve(__dirname, "SYSTEM_PROMPT.md"),
    ];

    // Try each path until we find the file
    for (const promptPath of possiblePaths) {
      if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, "utf-8");
      }
    }

    console.error(
      "Could not find SYSTEM_PROMPT.md in any of the expected locations",
    );
    return "";
  } catch (error) {
    console.error("Error reading system prompt markdown file:", error);
    return "";
  }
};

// Export the system prompt loaded from the markdown file
export const SYSTEM_PROMPT = loadSystemPrompt();

// 5. Use components in the main Item tree:
//   - Connect "Attr" vertex to Component vertex with "AttrComp" edge
//   - Omit componentName property

// other improvements can be done in next release:
// 1. find all global and page level component from the frontend(using local data) with its variants and add to prompt 'we have following components with variants:'.
//
