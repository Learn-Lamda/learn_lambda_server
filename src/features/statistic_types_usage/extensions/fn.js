function elementAt(element, index) {
  if (typeof element === "string") {
    if (parseObject.String.parenthesisAccessOperator === undefined) {
      parseObject.String.parenthesisAccessOperator = 1;
    } else {
      parseObject.String.parenthesisAccessOperator += 1;
    }
  }
  if (element instanceof Array) {
    if (parseObject.Array.parenthesisAccessOperator === undefined) {
      parseObject.Array.parenthesisAccessOperator = 1;
    } else {
      parseObject.Array.parenthesisAccessOperator += 1;
    }
  }
  return element[index];
}
function lengthParse(element) {
  if (typeof element === "string") {
    if (parseObject.String.length === undefined) {
      parseObject.String.length = 1;
    } else {
      parseObject.String.length += 1;
    }
  }
  if (element instanceof Array) {
    if (parseObject.Array.length === undefined) {
      parseObject.Array.length = 1;
    } else {
      parseObject.Array.length += 1;
    }
  }
  return element.length;
}