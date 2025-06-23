import Hjson from "hjson";

/**
 * Extract triple-quoted multiline strings from raw HJSON
 * and preserve their exact content before parsing.
 */
export function parseHjsonPreservingMultiline(rawHjson: string): any {
  // Find triple-quoted multiline strings and replace them with a placeholder
  const tripleQuotedStrings: string[] = [];
  const modifiedRaw = rawHjson.replace(/'''([\s\S]*?)'''/g, (_, multiline) => {
    const index = tripleQuotedStrings.length;
    tripleQuotedStrings.push(multiline);
    return `__HJSON_MULTILINE_PLACEHOLDER_${index}__`;
  });

  // Parse using HJSON (will convert placeholders to strings)
  const parsed = Hjson.parse(modifiedRaw);

  // Replace placeholders in parsed object with original multiline content
  const replacePlaceholders = (obj: any): any => {
    if (typeof obj === "string") {
      // Look for the placeholder pattern anywhere in the string
      const match = obj.match(/__HJSON_MULTILINE_PLACEHOLDER_(\d+)__/);
      if (match) {
        // If the string contains a placeholder, replace it with the original content
        const placeholderIndex = Number.parseInt(match[1], 10);
        return tripleQuotedStrings[placeholderIndex];
      }
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(replacePlaceholders);
    } else if (typeof obj === "object" && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        result[key] = replacePlaceholders(obj[key]);
      }
      return result;
    }
    return obj;
  };

  return replacePlaceholders(parsed);
}
