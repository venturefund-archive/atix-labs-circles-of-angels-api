/* eslint-disable no-console */
const {
  ethereum,
  run,
  deployments,
  // web3,
  ethers
} = require('@nomiclabs/buidler');
const {
  deployRelayHub,
  runRelayer,
  runAndRegister,
  fundRecipient,
  balance
} = require('@openzeppelin/gsn-helpers');

const Web3 = require('web3');

const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');
const Web3HttpProvider = require('web3-providers-http');
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

contract('UsersWhitelist.sol', accounts => {
  const [
    creator,
    userRelayer,
    userWhitelist,
    other,
    ownerAddress,
    relayerAddress,
    signerAddress,
    directSenderAddress
  ] = accounts;
  let coa;
  let whitelist;
  let subprocess;
  let gsnWeb3;
  let hubAddress;
  let deploymentProvider;
  before('Gsn provider run', async function before() {
    gsnWeb3 = new Web3(PROVIDER_URL);
    hubAddress = await deployRelayHub(gsnWeb3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });
    const web3provider = new Web3HttpProvider(PROVIDER_URL);
    deploymentProvider = new ethers.providers.Web3Provider(web3provider);
  });

  beforeEach('deploy contracts', async function beforeEach() {
    this.timeout(1 * 60 * 1000);
    await run('deploy', { reset: true });
    [coa] = await deployments.getDeployedContracts('COA');
    [whitelist] = await deployments.getDeployedContracts('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);

    await fundRecipient(gsnWeb3, {
      recipient: coa.address,
      amount: '100000000000000000',
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function after() {
    if (subprocess) subprocess.kill();
  });

  it('initially returns the singleton instance address', async () => {
    expect(await coa.getHubAddr()).to.equal(singletonRelayHub);
    const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
    assert.equal(isCoaReady, true);
  });

  describe.only('GSN enabled ', () => {
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

  describe.only('GSN disabled', () => {
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
