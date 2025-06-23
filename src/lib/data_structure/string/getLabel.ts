import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

//'onChange(component,null)'

export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}
