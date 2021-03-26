const { balancesConfig } = require('config').crons.checkContractBalancesJob;
const { fundRecipient, balance } = require('@openzeppelin/gsn-helpers');
const { BigNumber } = require('@ethersproject/bignumber');
const logger = require('../logger');

/**
 * Checks balance of the main account defined for the project and sends
 *  alerts if the account is running out of balance
 */
async function checkGSNAccountBalance() {
  logger.info('[BalancesService] :: Entering to checkGSNAccountBalance');
  const provider = await this.deployments.getProvider();
  const gsnAccount = await provider.listAccounts()[0];
  const accountBalance = await provider.getBalance(gsnAccount);

  logger.info(`[BalancesService] :: Main account balance: ${accountBalance}`);
  if (accountBalance.lte(BigNumber.from(balancesConfig.gsnAccountThreshold))) {
    await this.mailService.sendLowBalanceGSNAccountEmail(
      balancesConfig.email,
      gsnAccount,
      accountBalance
    );
  }
}

/**
 * @dev check if the balances of the contracts are below the threshold and
 *  send tokens if its needed.
 *
 * @param allContracts Contract object with all recipients.
 *  Each key in the allContract object should have a proper config configured, if not,
 *  default configuration will be used
 */
async function checkContractBalances(allContracts) {
  logger.info(
    '[BalancesService] :: Entering to checkContractBalances with contracts: ',
    allContracts
  );
  const provider = await this.deployments.getProvider();
  const signer = await this.deployments.getSigner();

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(allContracts)) {
    const config = balancesConfig[key]
      ? balancesConfig[key]
      : balancesConfig.default;
    logger.info(`[BalancesService] :: checking ${key} contract balances`);
    // eslint-disable-next-line no-await-in-loop
    await _checkBalances(allContracts[key], signer, provider, config);
  }
}

async function _checkBalances(contracts, signer, provider, config) {
  // eslint-disable-next-line no-restricted-syntax
  for (const contract of contracts) {
    // eslint-disable-next-line no-await-in-loop
    await _checkBalance(contract.address, signer, provider, config);
  }
}

async function _checkBalance(recipient, signer, provider, config) {
  const contractBalance = await balance(provider, { recipient });
  if (contractBalance.lte(config.balanceThreshold)) {
    logger.info(
      `[BalancesService] :: Contract recipient (${recipient}) has not enough balance, 
      sending ${config.amountToAdd}...`
    );
    await fundRecipient(provider, {
      recipient,
      amount: config.amountToAdd,
      from: signer
    });
  }
}

module.exports = {
  checkGSNAccountBalance,
  checkContractBalances
};
