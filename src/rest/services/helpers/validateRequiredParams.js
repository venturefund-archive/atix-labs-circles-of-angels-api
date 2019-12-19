const {
  RequiredParamsMissing
} = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

/**
 * Validate that all required params are defined.
 * Throws an error if any is `undefined`
 * @param {Object} args - Method's name and required params to validate
 * @param {string} args.method - method's name
 * @param {Object} args.params - method's required parameters
 */
module.exports = ({ method, params }) => {
  logger.info(
    '[ValidateRequiredParams] :: Entering validateRequiredParams method'
  );
  logger.info('[ValidateRequiredParams] :: Validating params', params);
  if (
    !Object.values(params).reduce(
      (prev, current) => prev && current !== undefined,
      true
    )
  ) {
    logger.error(
      `[ValidateRequiredParams] :: There are one or more params that are undefined for ${method}. Request is not valid`
    );
    throw new COAError(RequiredParamsMissing(method));
  }
};
