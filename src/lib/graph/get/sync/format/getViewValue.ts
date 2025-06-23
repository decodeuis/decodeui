export const getViewValue = (value: any) => {
  function isObject(value: any): boolean {
    // Check if the value is not null and its type is 'object'
    return value !== null && typeof value === "object";
  }

  if (value === true) {
    return "True";
  }
  if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    const values = [];
    for (const v of value) {
      values.push(getViewValue(v));
    }
    value = values.join(", ");
  }

  return isObject(value) ? JSON.stringify(value) : value;
};
