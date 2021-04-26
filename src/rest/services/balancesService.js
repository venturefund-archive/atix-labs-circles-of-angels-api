const { balancesConfig } = require('config');
const { fundRecipient, balance } = require('@openzeppelin/gsn-helpers');
const { parseEther, formatEther } = require('ethers').utils;
const { BigNumber } = require('@ethersproject/bignumber');

const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

/**
 * Checks balance of the main account defined for the project and sends
 *  alerts if the account is running out of balance
 *
 * @param coa Coa plugin instance
 */
async function checkGSNAccountBalance(coa) {
  logger.info('[BalancesService] :: Entering to checkGSNAccountBalance');
  const provider = await coa.getProvider();
  const gsnAccount = (await provider.listAccounts())[0];

  if (!gsnAccount) throw new COAError(errors.task.GSNAccountNotConfigured());

  const accountBalance = await provider.getBalance(gsnAccount);

  logger.info(`[BalancesService] :: Main account balance: ${accountBalance}`);
  const gsnAccountThreshold = parseEther(balancesConfig.gsnAccountThreshold);
  if (accountBalance.lte(gsnAccountThreshold)) {
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
 * @param signer Signer who sends the tokens
 * @param web3 Web3 provider
 */
async function checkContractBalances(allContracts, signer, web3) {
  logger.info(
    '[BalancesService] :: Entering to checkContractBalances with contracts: ',
    Object.values(allContracts).map(contracts =>
      contracts.map(contract => contract.address)
    )
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(allContracts)) {
    const config = balancesConfig[key]
      ? balancesConfig[key]
      : balancesConfig.default;
    logger.info(`[BalancesService] :: checking ${key} contract balances`);
    // eslint-disable-next-line no-await-in-loop
    await _checkBalances(allContracts[key], signer, web3, config);
  }
}

async function _checkBalances(contracts, signer, web3, config) {
  // eslint-disable-next-line no-restricted-syntax
  for (const contract of contracts) {
    // eslint-disable-next-line no-await-in-loop
    await _checkBalance(contract.address, signer, web3, config);
  }
}

async function _checkBalance(recipient, signer, web3, config) {
  const contractBalance = BigNumber.from(await balance(web3, { recipient }));
  const balanceThreshold = parseEther(config.balanceThreshold);
  logger.info(
    `[BalancesService] :: ${recipient} contract balance: ${contractBalance}`
  );
  if (contractBalance.lte(balanceThreshold)) {
    const targetBalance = parseEther(config.targetBalance);
    logger.info(
      `[BalancesService] :: Contract recipient at ${recipient} has not enough balance, sending ${targetBalance
        .sub(contractBalance)
        .toString()} WEIs...`
    );
    await fundRecipient(web3, {
      recipient,
      amount: targetBalance.toString(),
      from: signer._address
    });
    const newBalance = await balance(web3, { recipient });
    logger.info(
      `Contract ${recipient} founded, new balance: ${formatEther(
        newBalance
      )} ETH`
    );
  }
}

module.exports = {
  checkGSNAccountBalance,
  checkContractBalances
};