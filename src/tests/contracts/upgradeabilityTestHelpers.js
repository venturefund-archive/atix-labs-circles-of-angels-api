const { upgrades, deployments } = require('@nomiclabs/buidler');

/**
 * Tests if the contract is upgradeable
 * @param contract Contract to test
 */
async function isUpgradeable(contract) {
  const [mockContract] = await deployments.getContractFactory('MockContract');

  const contractUpgraded = await upgrades.upgradeProxy(
    contract.address,
    mockContract
  );

  return contractUpgraded.mockSum(10, 32) === 42;
}

module.exports = {
  isUpgradeable
};
