export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = input.toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
} // ts-belt
