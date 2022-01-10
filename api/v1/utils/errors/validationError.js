const { BaseError } = require(".");

module.exports = class ValidationError extends BaseError {
  constructor(status, location, message, path) {
    super(status, "ValidationError", location, message, path);
  }
};
