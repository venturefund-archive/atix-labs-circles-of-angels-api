const Web3 = require('web3');
/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = providerHost => {
  const web3 = new Web3(providerHost);
  return {
    async createAccount() {
      return web3.eth.accounts.create();
    }
  };
};

module.exports = ethServices;
