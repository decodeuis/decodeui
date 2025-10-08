// https://github.com/sindresorhus/html-tags/blob/main/html-tags.json
// https://html.spec.whatwg.org/multipage/indices.html#elements-3

// Root element
export const rootElements = ["html"];

// Document metadata
export const metadataElements = [
  "base",
  // "head",
  "link",
  "meta",
  "style",
  "title",
];

// Sectioning elements
export const sectioningElements = [
  "address",
  "article",
  "aside",
  "body",
  "footer",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hgroup",
  "main",
  "nav",
  "section",
];

// Text content elements
export const textContentElements = [
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "hr",
  "li",
  "menu",
  "ol",
  "p",
  "pre",
  "ul",
];

// Inline text elements
export const inlineTextElements = [
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
];

// Custom elements
export const customElements = ["icon", "portal"];

// Image and multimedia elements
export const multimediaElements = [
  "area",
  "audio",
  "img",
  "map",
  "track",
  "video",
  "picture",
  "source",
];

// Embedded content elements
export const embeddedElements = [
  "embed",
  "iframe",
  "object",
  "param",
  "canvas",
  "math",
  "svg",
];

// Form elements
export const formElements = [
  "button",
  "datalist",
  "fieldset",
  "form",
  "input",
  "label",
  "legend",
  "meter",
  "optgroup",
  "option",
  "output",
  "progress",
  "select",
  "textarea",
  "search",
];

// Table elements
export const tableElements = [
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
];

// Interactive elements
export const interactiveElements = ["details", "dialog", "summary", "menuitem"];

// Web components
export const webComponentElements = ["slot", "template"];

// Scripting elements
export const scriptingElements = ["script"]; // "noscript"

// Editing elements
export const editingElements = ["del", "ins"];

// SVG Basic Shape Elements
export const svgBasicShapeElements = [
  "circle",
  "rect",
  "line",
  "path",
  "polygon",
  "polyline",
  "ellipse",
  "switch",
];

// SVG Text Elements
export const svgTextElements = ["text", "tspan", "textPath", "title", "desc"];

// SVG Container Elements
export const svgContainerElements = [
  "svg",
  "g",
  "defs",
  "use",
  "symbol",
  "metadata",
];

// SVG Gradient Elements
export const svgGradientElements = ["linearGradient", "radialGradient", "stop"];

// SVG Filter Elements
export const svgFilterElements = [
  "filter",
  "feGaussianBlur",
  "feColorMatrix",
  "feBlend",
  "feComposite",
  "feOffset",
  "feFlood",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feSpecularLighting",
  "feTurbulence",
  "feComponentTransfer",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "fePointLight",
  "feSpotLight",
  "feTile",
];

// SVG Animation Elements
export const svgAnimationElements = [
  "animate",
  "animateTransform",
  "animateMotion",
  "set",
  "mpath",
];

// SVG Other Elements
export const svgOtherElements = [
  "view",
  "marker",
  "pattern",
  "image",
  "foreignObject",
  "mask",
  "clipPath",
];

// All SVG elements combined
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
export const svgElements = [
  ...svgBasicShapeElements,
  ...svgTextElements,
  ...svgContainerElements,
  ...svgGradientElements,
  ...svgFilterElements,
  ...svgAnimationElements,
  ...svgOtherElements,
];

// All HTML tags combined
export const htmlTags = [
  // ...rootElements,
  ...metadataElements,
  ...sectioningElements,
  ...textContentElements,
  ...inlineTextElements,
  ...multimediaElements,
  ...embeddedElements,
  ...formElements,
  ...tableElements,
  ...interactiveElements,
  ...webComponentElements,
  ...scriptingElements,
  ...editingElements,
  ...svgElements,
  ...customElements,
];

// HTML tags tree structure
export const htmlTagsTree = {
  children: [
    // {
    //   children: rootElements.map(tag => ({ children: [], id: tag, label: tag })),
    //   id: "root-elements",
    //   label: "Root Elements"
    // },
    {
      children: metadataElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "metadata-elements",
      label: "Metadata Elements",
    },
    {
      children: sectioningElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "sectioning-elements",
      label: "Sectioning Elements",
    },
    {
      children: textContentElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "text-content-elements",
      label: "Text Content Elements",
    },
    {
      children: inlineTextElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "inline-text-elements",
      label: "Inline Text Elements",
    },
    {
      children: multimediaElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "multimedia-elements",
      label: "Multimedia Elements",
    },
    {
      children: embeddedElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "embedded-elements",
      label: "Embedded Elements",
    },
    {
      children: formElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "form-elements",
      label: "Form Elements",
    },
    {
      children: tableElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "table-elements",
      label: "Table Elements",
    },
    {
      children: interactiveElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "interactive-elements",
      label: "Interactive Elements",
    },
    // {
    //   children: webComponentElements.map(tag => ({ children: [], id: tag, label: tag })),
    //   id: "web-component-elements",
    //   label: "Web Component Elements"
    // },
    {
      children: scriptingElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "scripting-elements",
      label: "Scripting Elements",
    },
    {
      children: editingElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "editing-elements",
      label: "Editing Elements",
    },
    {
      children: customElements.map((tag) => ({
        children: [],
        id: tag,
        label: tag,
      })),
      id: "custom-elements",
      label: "Custom Elements",
    },
    {
      children: [
        {
          children: svgBasicShapeElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-basic-shapes",
          label: "Basic Shapes",
        },
        {
          children: svgTextElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-text",
          label: "Text Elements",
        },
        {
          children: svgContainerElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-containers",
          label: "Containers",
        },
        {
          children: svgGradientElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-gradients",
          label: "Gradients",
        },
        {
          children: svgFilterElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-filters",
          label: "Filters",
        },
        {
          children: svgAnimationElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-animation",
          label: "Animation",
        },
        {
          children: svgOtherElements.map((tag) => ({
            children: [],
            id: tag,
            label: tag,
          })),
          id: "svg-other",
          label: "Other Elements",
        },
      ],
      id: "svg-elements",
      label: "SVG Elements",
    },
  ],
  id: "html-tags",
  label: "HTML Tags",
};
