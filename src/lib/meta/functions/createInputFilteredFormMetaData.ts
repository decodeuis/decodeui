import type { FieldAttribute, IFormMetaData } from "../FormMetadataType";

export function createInputFilteredFormMetaData(
  inputMetaData: IFormMetaData,
): IFormMetaData {
  const filterAttributes = (attributes: FieldAttribute[]): FieldAttribute[] => {
    return attributes.reduce<FieldAttribute[]>((acc, attribute) => {
      const componentName = attribute.componentName;

      if (attribute.key || componentName === "DynamicTable") {
        const newAttribute = { ...attribute };

        // Recursively filter nested attributes if they exist
        if (attribute.attributes) {
          newAttribute.attributes = filterAttributes(attribute.attributes);
        }

        acc.push(newAttribute);
      } else if (attribute.attributes) {
        acc.push(...filterAttributes(attribute.attributes));
      }

      return acc;
    }, []);
  };

  return {
    ...inputMetaData,
    attributes: filterAttributes(inputMetaData.attributes),
  };
}
