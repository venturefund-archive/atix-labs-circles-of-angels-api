/* eslint-disable no-console */
const { run, deployments, ethers } = require('@nomiclabs/buidler');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient
} = require('@openzeppelin/gsn-helpers');

const Web3 = require('web3');

const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');

const { assert } = require('chai');
const { throwsAsync } = require('./testHelpers');

const { isRelayHubDeployedForRecipient } = utils;

const PROVIDER_URL = 'http://localhost:8545';
const singletonRelayHub = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

async function getProjectAt(address, consultant) {
  const project = await deployments.getContractInstance(
    'Project',
    address,
    consultant
  );
  return project;
}

contract('Gsn', accounts => {
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
  let gsnWeb3;
  let hubAddress;
  before('Gsn provider run', async function before() {
    gsnWeb3 = new Web3(PROVIDER_URL);
    hubAddress = await deployRelayHub(gsnWeb3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });
  });

  beforeEach('deploy contracts', async function beforeEach() {
    this.timeout(1 * 60 * 1000);
    await run('deploy', { reset: true });
    [coa] = await deployments.getDeployedContracts('COA');
    [whitelist] = await deployments.getDeployedContracts('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);
    let hubBalance = await coa.provider.getBalance(hubAddress);
    console.log('Relayer balance 1', hubBalance.toString());
    await fundRecipient(gsnWeb3, {
      recipient: coa.address,
      amount: '100000000000000000',
      relayHubAddress: hubAddress
    });
    hubBalance = await coa.provider.getBalance(hubAddress);
    console.log('Relayer balance 2', hubBalance.toString());
  });

  after('finish process', async function after() {
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
      let hubBalance = await coa.provider.getBalance(hubAddress);
      console.log('Relayer balance 3', hubBalance.toString());
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
      hubBalance = await coa.provider.getBalance(hubAddress);
      console.log('Relayer balance 4', hubBalance.toString());
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
    const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress,
      relayerAddress,
      useGSN: false
    });

    const provider = new ethers.providers.Web3Provider(gsnDevProvider);
    const project = {
      id: 1,
      name: 'a good project'
    };

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
