function arrayParse(element) {
  if (parseObject.Array.constructorUsage === undefined) {
    parseObject.Array.constructorUsage = 1;
  } else {
    parseObject.Array.constructorUsage += 1;
  }
  return Array(element);
}
function arrayFromParse(element) {
  if (parseObject.Array.from === undefined) {
    parseObject.Array.from = 1;
  } else {
    parseObject.Array.from += 1;
  }
  return Array.from(element);
}
function arrayIsArrayParse(element) {
  if (parseObject.Array.isArray === undefined) {
    parseObject.Array.isArray = 1;
  } else {
    parseObject.Array.isArray += 1;
  }
  return Array.isArray(element);
}
function arrayOfParse(...elements) {
  if (parseObject.Array.of === undefined) {
    parseObject.Array.of = 1;
  } else {
    parseObject.Array.of += 1;
  }
  return Array.of(elements);
}
function parseFloatParse(element) {
  if (parseObject.Number.parseFloat === undefined) {
    parseObject.Number.parseFloat = 1;
  } else {
    parseObject.Number.parseFloat += 1;
  }
  return parseFloat(element);
}
function parseIntParse(element) {
  if (parseObject.Number.parseInt === undefined) {
    parseObject.Number.parseInt = 1;
  } else {
    parseObject.Number.parseInt += 1;
  }
  return parseInt(element);
}
function numberIsFiniteParse(element) {
  if (parseObject.Number.isFinite === undefined) {
    parseObject.Number.isFinite = 1;
  } else {
    parseObject.Number.isFinite += 1;
  }
  return Number.isFinite(element);
}
function numberIsSafeIntegerParse(element) {
  if (parseObject.Number.isInteger === undefined) {
    parseObject.Number.isInteger = 1;
  } else {
    parseObject.Number.isInteger += 1;
  }
  return Number.isInteger(element);
}
function numberIsNaNParse(element) {
  if (parseObject.Number.isNaN === undefined) {
    parseObject.Number.isNaN = 1;
  } else {
    parseObject.Number.isNaN += 1;
  }
  return Number.isNaN(element);
}
function numberIsIntegerParse() {}
function numberParse(element) {
  if (parseObject.Number.constructorUsage === undefined) {
    parseObject.Number.constructorUsage = 1;
  } else {
    parseObject.Number.constructorUsage += 1;
  }
  return Number(element);
}

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
