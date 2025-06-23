import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { CssType } from "~/components/form/type/CssType";

const ID_PLACEHOLDER_REGEX = /\._id/g;

/**
 * Processes CSS content from different formats into a single string
 * Used by both As.tsx and DynamicComponent.tsx for consistent CSS handling
 *
 * @param cssContent - CSS content that can be a string, function, or array of either
 * @param functionArgs - Arguments to pass to CSS functions, typically contains theme
 * @param uniqueId - The unique ID to replace '._id' placeholders with
 * @returns Processed CSS string
 */
export const processCssContent = (
  cssContent: CssType,
  functionArgs: FunctionArgumentType,
  uniqueId: string,
): string | undefined => {
  if (!cssContent) {
    return undefined;
  }

  // Handle array of CSS strings/functions
  if (Array.isArray(cssContent)) {
    let result = "";
    for (let i = 0; i < cssContent.length; i++) {
      const cssItem = cssContent[i];
      const processed =
        typeof cssItem === "function"
          ? processStyle(cssItem(functionArgs), functionArgs, uniqueId)
          : processStyle(cssItem, functionArgs, uniqueId);

      if (processed) {
        result += (result ? "\n" : "") + processed;
      }
    }
    return result || undefined;
  }

  // Handle function CSS
  if (typeof cssContent === "function") {
    return processStyle(cssContent(functionArgs), functionArgs, uniqueId);
  }

  // Handle string CSS directly
  return processStyle(cssContent, functionArgs, uniqueId);
};

/**
 * Helper function to process a CSS string and replace ._id placeholders
 * Also evaluates template strings with variables
 */
export const processStyle = (
  style: string | string[] | undefined,
  functionArgs: FunctionArgumentType,
  uniqueId: string,
): string => {
  if (!style) {
    return "";
  }

  if (Array.isArray(style)) {
    let result = "";
    for (let i = 0; i < style.length; i++) {
      const processed = processStyle(style[i], functionArgs, uniqueId);
      if (processed) {
        result += (result ? "\n" : "") + processed;
      }
    }
    return result;
  }

  // Early return for empty strings
  const trimmedStyle = style.trim();
  if (!trimmedStyle) {
    return "";
  }

  // Fast path for simple ID replacement
  // if (!trimmedStyle.includes("args.") && !trimmedStyle.includes("return")) {
  //   return trimmedStyle.replace(ID_PLACEHOLDER_REGEX, `.${uniqueId}`);
  // }

  // Handle template string evaluation
  try {
    // const cssFunction = style.includes("return")
    //   ? new Function("args", style)
    //   : new Function("args", `return \`${style}\``);
    const cssFunction = new Function("args", style);

    const evaluatedStyle = cssFunction(functionArgs);

    if (typeof evaluatedStyle === "string") {
      return evaluatedStyle.replace(ID_PLACEHOLDER_REGEX, `.${uniqueId}`);
    }

    return "";
  } catch (error) {
    console.error("Error evaluating css template string:", error, style);
    return "";
  }
};
