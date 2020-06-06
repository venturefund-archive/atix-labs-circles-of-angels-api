/**
 * Executes an async function and checks if an error is thrown.
 *
 * @param {Function} fn function to be invoked
 * @param {String} errorMsg error message the exception should have
 * @returns {Boolean} true if exception was thrown with proper message, false otherwise
 */
const throwsAsync = async (fn, errMsg) => {
  try {
    await fn();
    return false;
  } catch (err) {
    return err.message === errMsg;
  }
};

const waitForEvent = (contract, eventName, timeout = 2000) =>
  new Promise((resolve, reject) => {
    contract.on(eventName, function callback() {
      // eslint-disable-next-line prefer-rest-params
      const event = arguments[arguments.length - 1];
      event.removeListener();
      // eslint-disable-next-line prefer-rest-params
      resolve(arguments);
    });

    setTimeout(() => {
      reject(new Error(`Timeout when waiting for ${eventName}`));
    }, timeout);
  });

module.exports = {
  throwsAsync,
  waitForEvent
};
