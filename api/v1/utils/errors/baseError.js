module.exports = class BaseError {
  // https://github.com/kogosoftwarellc/express-openapi-validation#argserrortransformer
  constructor(status, errorCode, location, message, path) {
    this.status = status;
    this.errors = {
      errorCode: errorCode,
      location: location,
      message: message,
      path: path,
    };
  }
};
