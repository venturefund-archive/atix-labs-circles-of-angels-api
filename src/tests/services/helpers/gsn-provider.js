const { GSNDevProvider } = require('@openzeppelin/gsn-provider');

function setGSNProvider (Contract, owner, relayer) {
  const baseProvider = Contract.currentProvider;
  Contract.setProvider(
    new GSNDevProvider(baseProvider, {
      txfee: 70,
      useGSN: false,
      ownerAddress: owner,
      relayerAddress: relayer,
    }),
  );
};

module.exports = { setGSNProvider };
