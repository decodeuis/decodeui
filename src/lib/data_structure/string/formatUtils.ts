import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
import * as parserCss from "prettier/plugins/postcss";
import * as prettier from "prettier/standalone";

export async function formatJavaScriptCode(code: string): Promise<string> {
  try {
    return await prettier.format(code, {
      // bracketSpacing: true,
      // printWidth: 80,
      // semi: true,
      // singleQuote: false,
      // tabWidth: 2,
      // trailingComma: "all",
      // useTabs: false,
      parser: "babel",
      plugins: [parserBabel, parserEstree],
    });
  } catch (err) {
    console.error("Formatting failed:", err);
    throw err;
  }
}

export async function formatCSSCode(code: string): Promise<string> {
  try {
    return await prettier.format(code, {
      parser: "css",
      plugins: [parserCss, parserEstree],
    });
  } catch (err) {
    console.error("CSS formatting failed:", err);
    throw err;
  }
}
