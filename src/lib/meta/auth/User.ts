export const User = {
  attributes: [
    {
      componentName: "SystemTextInput",
      key: "key",
    },
    {
      componentName: "SystemTextInput",
      key: "email",
    },
    {
      componentName: "SystemTextInput",
      key: "pass",
    },
    {
      collection: "g:'Role'",
      componentName: "MultiSelect",
      key: "role",
    },
  ],
  isInlineEditable: true,
  key: "User",
  title: "User",
};
