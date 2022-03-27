const formats = {
  ean8: { validChars: /^\d{8}$/, validLength: 8 },
  ean12: { validChars: /^\d{12}$/, validLength: 12 },
  ean13: { validChars: /^\d{13}$/, validLength: 13 },
  ean14: { validChars: /^\d{14}$/, validLength: 14 },
  ean18: { validChars: /^\d{18}$/, validLength: 18 },
};

function sumArray(array) {
  return array
    .map((d, i) => (i % 2 === 0 ? Number(d) * 3 : Number(d)))
    .reduce((acc, d) => acc + d);
}
function calcChecksum(sum) {
  return (10 - (sum % 10)) % 10;
}

function getChecksum(barcode, verify = true) {
  const arr = barcode
    .substring(0, barcode.length - 1)
    .split("")
    .reverse();

  const sum = sumArray(arr);

  const checksum = calcChecksum(sum);
  return checksum;
}

function validateFormat(barcode, format) {
  return (
    barcode.length === format.validLength && format.validChars.test(barcode)
  );
}

function validateBarcode(barcode) {
  const lastDigit = Number(barcode.substring(barcode.length - 1));
  const checkSum = getChecksum(barcode);
  return checkSum === lastDigit;
}

module.exports = {
  /**
   * @see https://www.gs1.org/services/how-calculate-check-digit-manually
   */
  formats,
  validate: function (barcode) {
    // check if format is found
    const format = Object.keys(formats).find((f) =>
      validateFormat(barcode, formats[f])
    );

    return {
      format,
      valid: format ? validateBarcode(barcode) : false,
    };
  },

  isValidFormat: function (barcode, format) {
    if (validateFormat(barcode, format)) {
      return validateBarcode(barcode);
    } else {
      false;
    }
  },
  getChecksum,
};
