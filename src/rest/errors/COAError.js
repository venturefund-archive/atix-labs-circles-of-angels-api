module.exports = class COAError extends Error {
  constructor(errorDescriptor) {
    super(errorDescriptor.message);
  }
};
