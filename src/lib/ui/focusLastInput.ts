export function focusLastInput(tableElement?: HTMLTableElement) {
  if (tableElement) {
    const inputs = [...tableElement.getElementsByTagName("input")];
    inputs[inputs.length - 1].focus();
  }
}
