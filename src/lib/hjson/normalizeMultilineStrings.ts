/**
 * Normalizes the indentation of multiline strings in HJSON content.
 * Finds the minimum whitespace prefix across all lines and removes it.
 *
 * Processing steps:
 * 1. Find all multiline strings enclosed in triple quotes (''')
 * 2. Extract the content between the triple quotes
 * 3. Split the content into individual lines
 * 4. Filter out empty lines at the beginning and end of the string
 * 5. Find the minimum whitespace prefix across all non-empty lines
 * 6. Remove the minimum indent from all lines to normalize indentation
 * 7. Rejoin the lines with triple quotes
 *
 * @param hjsonContent - The HJSON content string to process
 * @returns The HJSON content with normalized multiline string indentation
 *
 * @example
 * // Input HJSON with excessive indentation:
 * '''
 *         function example() {
 *           return true;
 *         }
 * '''
 *
 * // Output after normalization:
 * '''
 * function example() {
 *   return true;
 * }
 * '''
 */
export function normalizeMultilineStrings(hjsonContent: string): string {
  // Process multiline strings denoted by triple quotes
  return hjsonContent.replace(/'''[\s\S]*?'''/g, (match) => {
    // Extract the content between triple quotes
    const content = match.slice(3, -3);

    // Split into lines
    const lines = content.split("\n");

    // Skip empty lines at the beginning and end
    const trimmedLines = lines.filter((line, index) => {
      if (index === 0 || index === lines.length - 1) {
        return line.trim() !== "";
      }
      return true;
    });

    if (trimmedLines.length === 0) {
      return "''''''";
    }

    // Find minimum whitespace prefix (ignoring empty lines)
    let minIndent = Number.POSITIVE_INFINITY;
    for (const line of trimmedLines) {
      if (line.trim() !== "") {
        const leadingWhitespace = line.match(/^[\s]*/)?.[0] || "";
        minIndent = Math.min(minIndent, leadingWhitespace.length);
      }
    }

    // Remove the minimum indent from all lines
    const normalizedLines = trimmedLines.map((line) => {
      if (line.trim() === "") {
        return "";
      }
      return line.slice(minIndent);
    });

    // Rejoin with triple quotes
    return "'''" + normalizedLines.join("\n") + "'''";
  });
}
