const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { GSNDevProvider } = require('@openzeppelin/gsn-provider');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient
} = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');

const PROVIDER_URL = 'http://localhost:8545';

contract('UsersWhitelist.sol', accounts => {
  const [
    creator,
    userRelayer,
    other,
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
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    coa = await deployments.getLastDeployedContract('COA');
    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');
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
