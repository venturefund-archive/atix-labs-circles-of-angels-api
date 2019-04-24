const Web3 = require('web3');
const ethConfig = require('../../../../config/configs').eth;

/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = async providerHost => {
  const web3 = new Web3(providerHost);
  const COAContract = new web3.eth.Contract(
    ethConfig.CONTRACT_ABI,
    ethConfig.CONTRACT_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );

  return {
    async createAccount() {
      return web3.eth.accounts.create();
    },
    async createProject(sender, onError) {
      return ethSend(sender, COAContract.methods.createProject(), onError);
    },
    async startProject(sender, onError) {
      return ethSend(sender, COAContract.methods.startProject(), onError);
    },
    async validateActivity(sender, onError) {
      return ethSend(sender, COAContract.methods.validateActivity(), onError);
    }
  };
};

const ethSend = async (sender, method, onError) => {
  return new Promise((resolve, reject) => {
    method
      .send({
        from: sender,
        gasLimit: 1000000
      })
      .on('error', error => {
        if (onError) onError(error);
        reject();
      })
      .on('transactionHash', transactionHash => {
        resolve(transactionHash);
      });
  });
};

module.exports = ethServices;
