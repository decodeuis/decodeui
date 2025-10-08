import { parse } from "yaml";

import type { ComponentNode } from "./type/ComponentTreeType";

type ParsedYamlNode = string | { [key: string]: ParsedYamlNode[] };

export function getComponentTree(): ComponentNode[] {
  const yamlContent = `- Root:
  - Html
  - Slot
`;
  // - Table
  // - Transition
  // - TransitionGroup
  const parsedYaml: ParsedYamlNode[] = parse(yamlContent);
  return cleanFormat(convertToRequiredFormat(parsedYaml));
}

function cleanFormat(data: ComponentNode[]): ComponentNode[] {
  return data.map((item) => {
    if (item.children && item.children.length > 0) {
      item.children = cleanFormat(item.children);
    } else {
      delete item.children;
    }
    return item;
  });
}

function convertToRequiredFormat(data: ParsedYamlNode[]): ComponentNode[] {
  return data.map((item) => {
    if (typeof item === "string") {
      return { Component: item };
    }
    const key = Object.keys(item)[0];
    return {
      children: item[key] ? convertToRequiredFormat(item[key]) : undefined,
      Component: key,
    };
  });
}
