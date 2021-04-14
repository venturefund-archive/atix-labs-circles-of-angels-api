/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { balancesConfig } = require('config').crons.checkContractBalancesJob;
const { BigNumber } = require('@ethersproject/bignumber');
const { parseEther } = require('ethers').utils;
const { balance, fundRecipient } = require('@openzeppelin/gsn-helpers');
const { coa, web3 } = require('@nomiclabs/buidler');
const { injectMocks } = require('../../rest/util/injection');
const originalBalanceService = require('../../rest/services/balancesService');

let balanceService;
let mocks;
const restoreAll = () => {
  balanceService = Object.assign({}, originalBalanceService);
  mocks = Object.assign({}, originalMocks);
  jest.clearAllMocks();
};

const mockCoaImplementation = () => {
  coa.getProvider.mockImplementation(mocks.coa.getProvider);
  coa.getSigner.mockImplementation(mocks.coa.getSigner);
};

const gsnAccount = 'fakeAccount';
const gsnSigner = {
  _address: gsnAccount
};
const gsnAccountBalance = BigNumber.from(parseEther('1000'));

const originalMocks = {
  provider: {
    listAccounts: () => [gsnAccount],
    getBalance: () => gsnAccountBalance
  },
  coa: {
    getProvider: () => mocks.provider,
    getSigner: () => gsnSigner
  },
  mailService: {
    sendLowBalanceGSNAccountEmail: jest.fn()
  },
  balance: jest.fn(),
  fundRecipient: jest.fn()
};

jest.mock('@openzeppelin/gsn-helpers');
jest.mock('@nomiclabs/buidler');

describe('BalanceService tests', () => {
  beforeAll(restoreAll);

  describe('checkGSNAccountBalance function tests', () => {
    describe('GIVEN the GSN account has enough balance', () => {
      beforeAll(async () => {
        mockCoaImplementation();
        injectMocks(balanceService, {
          mailService: mocks.mailService
        });
        await balanceService.checkGSNAccountBalance();
      });

      it('SHOULD NOT send an alert email', () => {
        expect(
          mocks.mailService.sendLowBalanceGSNAccountEmail
        ).toHaveBeenCalledTimes(0);
      });
    });

    describe('GIVEN the GSN account has enough balance', () => {
      const sameBalanceAmountThanThreshold = BigNumber.from(
        balancesConfig.gsnAccountThreshold
      );

      beforeAll(async () => {
        mocks.provider = {
          ...mocks.provider,
          getBalance: () => sameBalanceAmountThanThreshold
        };
        mockCoaImplementation();
        injectMocks(balanceService, {
          mailService: mocks.mailService
        });
        await balanceService.checkGSNAccountBalance();
      });

      it('SHOULD send an alert email', () => {
        expect(mocks.mailService.sendLowBalanceGSNAccountEmail).toBeCalledWith(
          balancesConfig.email,
          gsnAccount,
          sameBalanceAmountThanThreshold
        );
      });
    });

    describe('GIVEN the GSN account has not enough balance', () => {
      const smallBalanceAmount = BigNumber.from(parseEther('1'));

      beforeAll(async () => {
        mocks.provider = {
          ...mocks.provider,
          getBalance: () => smallBalanceAmount
        };
        mockCoaImplementation();
        injectMocks(balanceService, {
          mailService: mocks.mailService
        });
        await balanceService.checkGSNAccountBalance();
      });

      it('SHOULD send an alert email', () => {
        expect(mocks.mailService.sendLowBalanceGSNAccountEmail).toBeCalledWith(
          balancesConfig.email,
          gsnAccount,
          smallBalanceAmount
        );
      });
    });
  });

  describe('checkContractBalances function tests', () => {
    const contracts = {
      coa: [{ address: 'coa_address' }],
      daos: [{ address: 'dao_address1' }, { address: 'dao_address2' }],
      projects: [
        { address: 'project_address1' },
        { address: 'project_address2' }
      ]
    };

    describe('GIVEN the all contracts have enough balance', () => {
      beforeAll(async () => {
        restoreAll();
        const enoughContractBalance = parseEther('1000');
        mocks.balance.mockReturnValue(enoughContractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        mockCoaImplementation();
        await balanceService.checkContractBalances(contracts);
      });

      it('SHOULD NOT call fundRecipient', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(0);
      });
    });

    describe('GIVEN no contract have enough balance', () => {
      const insufficientContractBalance = '0';
      const coaExpectedAmountSended = parseEther(
        BigNumber.from(balancesConfig.coa.targetBalance)
          .sub(insufficientContractBalance)
          .toString()
      );
      const daoExpectedAmountSended = parseEther(
        BigNumber.from(balancesConfig.daos.targetBalance)
          .sub(insufficientContractBalance)
          .toString()
      );
      const projectExpectedAmountSended = parseEther(
        BigNumber.from(balancesConfig.projects.targetBalance)
          .sub(insufficientContractBalance)
          .toString()
      );

      beforeAll(async () => {
        restoreAll();
        mocks.balance.mockReturnValue(insufficientContractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        mockCoaImplementation();
        await balanceService.checkContractBalances(contracts);
      });

      it('SHOULD call fundRecipient always', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(5);
        expect(mocks.fundRecipient).nthCalledWith(1, web3, {
          recipient: contracts.coa[0].address,
          amount: coaExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(2, web3, {
          recipient: contracts.daos[0].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(4, web3, {
          recipient: contracts.projects[0].address,
          amount: projectExpectedAmountSended,
          from: gsnAccount
        });
      });
    });

    describe('GIVEN only dao contracts need more balance', () => {
      const contractBalance = BigNumber.from(parseEther('60')); // @SEE thresholds in config/test.js
      const daoExpectedAmountSended = BigNumber.from(
        parseEther(balancesConfig.daos.targetBalance)
      );

      beforeAll(async () => {
        restoreAll();
        mocks.balance.mockReturnValue(contractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        mockCoaImplementation();
        await balanceService.checkContractBalances(contracts);
      });

      it('SHOULD call fundRecipient only for daos', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(2);
        expect(mocks.fundRecipient).nthCalledWith(1, web3, {
          recipient: contracts.daos[0].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(2, web3, {
          recipient: contracts.daos[1].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
      });
    });
  });
});
