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
    async createProject(sender, onError, onConfirm) {
      return ethSend(
        sender,
        COAContract.methods.createProject(),
        onError,
        onConfirm
      );
    },
    async createMilestones(sender, onError, onConfirm) {
      return ethSend(
        sender,
        COAContract.methods.createMilestones(),
        onError,
        onConfirm
      );
    },
    async createActivity(sender, onError, onConfirm) {
      return ethSend(
        sender,
        COAContract.methods.createActivity(),
        onError,
        onConfirm
      );
    },
    async startProject(sender, onError, onConfirm) {
      return ethSend(
        sender,
        COAContract.methods.startProject(),
        onError,
        onConfirm
      );
    },
    async validateActivity(sender, onError, onConfirm) {
      return ethSend(
        sender,
        COAContract.methods.validateActivity(),
        onError,
        onConfirm
      );
    }
  };
};

const ethSend = async (sender, method, onError, onConfirm) => {
  method
    .send({
      from: sender,
      gasLimit: 1000000
    })
    .on('error', error => {
      if (onError) onError(error);
    })
    .on('transactionHash', transactionHash => {
      return transactionHash;
    })
    .on('confirmation', async (confirmationNumber, receipt) => {
      if (onConfirm) onConfirm({ confirmationNumber, receipt });
    });
};

module.exports = ethServices;
