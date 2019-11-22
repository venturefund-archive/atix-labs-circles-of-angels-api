const { ErrorTypes } = require('../../services/errors');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = message;
  }
}

const errors = {
  [ErrorTypes.ProjectNotFound]: {
    message: 'Project not found error',
    statusCode: 404
  },
  [ErrorTypes.CouldNotReadProject]: {
    message: 'Could not read project',
    statusCode: 404
  }
};

function mapError(error) {
  const mapped = errors[error.type];
  if (mapped) return new AppError(mapped.message, mapped.statusCode);
  return new AppError('An error has ocurred', 500);
}

module.exports = mapError;
