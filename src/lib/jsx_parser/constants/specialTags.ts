const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const NO_WHITESPACE = ["table", "tbody", "tfoot", "thead", "tr"];

export default VOID_ELEMENTS;

export function canHaveChildren(tagName: string): boolean {
  return VOID_ELEMENTS.indexOf(tagName.toLowerCase()) === -1;
}

export function canHaveWhitespace(tagName: string): boolean {
  return NO_WHITESPACE.indexOf(tagName.toLowerCase()) !== -1;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
export const containerTags = [
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "hgroup",
  "main",
  "nav",
  "section",
  "search",
  // Text content
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  // "hr",
  "li",
  "menu",
  "ol",
  // "p",
  "pre",
  "ul",
];
