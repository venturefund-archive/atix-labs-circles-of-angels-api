/* eslint-disable no-console */
const { describe, it, before, beforeEach, after } = global;
const { run, deployments, ethers, web3 } = require('@nomiclabs/buidler');
const { BigNumber } = require('@ethersproject/bignumber');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient,
  balance
} = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');
const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');

const chai = require('chai');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

const { throwsAsync } = require('./helpers/testHelpers');

const { isRelayHubDeployedForRecipient } = utils;

const PROVIDER_URL = ethers.provider.connection.url;
const singletonRelayHub = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';
const fundValue = '1000000000000000000';
async function getProjectAt(address, consultant) {
  return deployments.getContractInstance('Project', address, consultant);
}

contract('Gas Station Network Tests', accounts => {
  const [
    creator,
    userRelayer,
    ownerAddress,
    relayerAddress,
    signerAddress,
    other
  ] = accounts;
  let coa;
  let claimsRegistry;
  let whitelist;
  let subprocess;
  let hubAddress;
  before('Gsn provider run', async function b() {
    hubAddress = await deployRelayHub(web3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });
  });

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    coa = await deployments.getLastDeployedContract('COA');
    claimsRegistry = await deployments.getLastDeployedContract(
      'ClaimsRegistry'
    );
    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);

    await fundRecipient(web3, {
      recipient: coa.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });

    await fundRecipient(web3, {
      recipient: claimsRegistry.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function a() {
    if (subprocess) subprocess.kill();
  });

  it('initially returns the singleton instance address', async () => {
    chai.assert.equal(await coa.getHubAddr(), singletonRelayHub);
    const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
    chai.assert.equal(isCoaReady, true);
  });

  describe('GSN enabled ', () => {
    const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress,
      relayerAddress,
      useGSN: true
    });

    const provider = new ethers.providers.Web3Provider(gsnDevProvider);
    const project = {
      id: 1,
      name: 'a good project'
    };

    it('should execute coa TX for FREE from a user in whitelist', async () => {
      await whitelist.addUser(signerAddress);
      const gsnCoa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoa.provider.getBalance(signerAddress);
      await gsnCoa.createProject(project.id, project.name);
      const instance = await getProjectAt(
        await gsnCoa.projects(0),
        provider.getSigner(signerAddress)
      );
      chai.assert.equal(await instance.name(), project.name);
      const newBalance = await gsnCoa.provider.getBalance(signerAddress);
      chai.assert.equal(oldBalance.toString(), newBalance.toString());
    });

    it('should not execute coa TX from a user is not in whitelist', async () => {
      const gsnCoa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoa.provider.getBalance(signerAddress);

      await throwsAsync(
        gsnCoa.createProject(project.id, project.name),
        'Error: Recipient canRelay call was rejected with error 11'
      );
      const newBalance = await gsnCoa.provider.getBalance(signerAddress);
      chai.assert.equal(oldBalance.toString(), newBalance.toString());
    });
  });

  describe('GSN disabled', () => {
    let gsnDevProvider;
    let provider;
    let project;

    before(async () => {
      gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
        ownerAddress,
        relayerAddress,
        useGSN: false
      });
      provider = new ethers.providers.Web3Provider(gsnDevProvider);
      project = {
        id: 1,
        name: 'a good project'
      };
    });

    it('should execute coa TX from a user in whitelist spending his founds', async () => {
      await whitelist.addUser(signerAddress);
      const gsnCoaOff = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      await gsnCoaOff.createProject(project.id, project.name);
      const newBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      chai.assert.isTrue(newBalance.lt(oldBalance));
    });

    describe('WhitdrawDeposit should ==> ', () => {
      const getBalances = async (
        _hubAddress,
        _relayerAddress,
        _contractAddress,
        _userAddress
      ) => {
        const balances = {
          hub: BigNumber.from(await coa.provider.getBalance(_hubAddress)),
          relayer: BigNumber.from(
            await coa.provider.getBalance(_relayerAddress)
          ),
          contract: BigNumber.from(
            await balance(web3, {
              recipient: _contractAddress
            })
          ),
          user: BigNumber.from(await coa.provider.getBalance(_userAddress))
        };

        return balances;
      };

      describe('On [Coa] Contract ==> ', () => {
        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            coa.address,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await coa.withdrawDeposits(withdrawAmount, creator);

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            coa.address,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(coa.withdrawDeposits(withdrawAmount, creator))
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(coa.withdrawDeposits(withdrawAmount, '0x0')).to.be
            .reverted;
        });
      });

      describe('On [ClaimRegistry] Contract ==> ', () => {
        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            claimsRegistry.address,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await claimsRegistry.withdrawDeposits(
            withdrawAmount,
            creator
          );

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            claimsRegistry.address,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(claimsRegistry.withdrawDeposits(withdrawAmount, creator))
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(
            claimsRegistry.withdrawDeposits(withdrawAmount, '0x0')
          ).to.be.reverted;
        });
      });
    });
  });
});
