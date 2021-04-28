/* eslint-disable no-console */
const { describe, it, before, beforeEach, after } = global;
const { run, deployments, ethers, web3 } = require('@nomiclabs/buidler');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient
} = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');
const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');

const { assert } = require('chai');
const { throwsAsync } = require('./helpers/testHelpers');

const { isRelayHubDeployedForRecipient } = utils;

const PROVIDER_URL = ethers.provider.connection.url;
const singletonRelayHub = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

async function getProjectAt(address, consultant) {
  return deployments.getContractInstance('Project', address, consultant);
}

contract('Gas Station Network Tests', accounts => {
  const [
    creator,
    userRelayer,
    ownerAddress,
    relayerAddress,
    signerAddress
  ] = accounts;
  let coa;
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
    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);

    await fundRecipient(web3, {
      recipient: coa.address,
      amount: '100000000000000000',
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function a() {
    if (subprocess) subprocess.kill();
  });

  it('initially returns the singleton instance address', async () => {
    assert.equal(await coa.getHubAddr(), singletonRelayHub);
    const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
    assert.equal(isCoaReady, true);
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
      coa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await coa.provider.getBalance(signerAddress);
      await coa.createProject(project.id, project.name);
      const instance = await getProjectAt(
        await coa.projects(0),
        provider.getSigner(signerAddress)
      );
      assert.equal(await instance.name(), project.name);
      const newBalance = await coa.provider.getBalance(signerAddress);
      assert.equal(oldBalance.toString(), newBalance.toString());
    });

    it('should not execute coa TX from a user is not in whitelist', async () => {
      coa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await coa.provider.getBalance(signerAddress);

      await throwsAsync(
        coa.createProject(project.id, project.name),
        'Error: Recipient canRelay call was rejected with error 11'
      );
      const newBalance = await coa.provider.getBalance(signerAddress);
      assert.equal(oldBalance.toString(), newBalance.toString());
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
      coa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await coa.provider.getBalance(signerAddress);
      await coa.createProject(project.id, project.name);
      const newBalance = await coa.provider.getBalance(signerAddress);
      assert.isTrue(newBalance.lt(oldBalance));
    });
  });
});
