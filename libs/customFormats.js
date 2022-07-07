const { barcode } = require("./validators");

const uuid = (input) => {
  const uuidPattern =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidPattern.test(input);
};

const ean8 = (input) => {
  return barcode.isValidFormat(input, barcode.formats.ean8);
};

const ean13 = (input) => {
  console.log("Custom format triggered.");
  return barcode.isValidFormat(input, barcode.formats.ean13);
};

const productBarcode = (input) => {
  return (ean8(input) && !hasCustomerPrefix(input)) || ean13(input);
};

const userBarcode = (input) => {
  return hasCustomerPrefix(input) && ean8(input);
};

/**
 * helper functions
 */
const hasCustomerPrefix = (input) => {
  const customerPrefix = "957";
  return input.startsWith(customerPrefix);
};

module.exports = {
  uuid,
  ean8,
  ean13,
  productBarcode,
  userBarcode,
};
