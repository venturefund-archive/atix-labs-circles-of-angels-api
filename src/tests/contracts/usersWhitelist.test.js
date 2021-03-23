const { web3, run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient
} = require('@openzeppelin/gsn-helpers');
const Web3HttpProvider = require('web3-providers-http');

const PROVIDER_URL = 'http://localhost:8545';

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

    const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress,
      relayerAddress,
      useGSN: true
    });

    const provider = new ethers.providers.Web3Provider(gsnDevProvider);
  });

  after('finish process', async function after() {
    if (subprocess) subprocess.kill();
  });

  describe('whitelist ', () => {
    it('Deployment works', async () => {
      const daosLength = await coa.getDaosLength();
      assert.equal(daosLength, 1);
    });

    it('should add and remove users in whitelist', async () => {
      await whitelist.addUser(signerAddress);
      assert.isTrue(await whitelist.users(signerAddress));
      await whitelist.addUser(other);
      await whitelist.removeUser(signerAddress);
      assert.isTrue(!(await whitelist.users(signerAddress)));
    });
  });
});
