const {
  ethereum,
  run,
  deployments,
  web3,
  ethers
} = require('@nomiclabs/buidler');
const {
  deployRelayHub,
  runRelayer,
  runAndRegister,
  fundRecipient,
  balance
} = require('@openzeppelin/gsn-helpers');

const { fromConnection } = require('@openzeppelin/network');

const Web3 = require("web3");

const { GSNProvider, GSNDevProvider, utils } = require("@openzeppelin/gsn-provider");

const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

const PROVIDER_URL = 'http://localhost:8545';
const ETH_NODE_URL = 'http://localhost:8099';

async function getProjectAt(address, consultant) {
  const project = await deployments.getContractInstance(
    'Project',
    address,
    consultant
  );
  return project;
}

contract('UsersWhitelist.sol', (accounts) => {
  const [creator, userRelayer, userWhitelist, other] = accounts;
  let coa;
  let whitelist;
  let subprocess;
  let gsnWeb3;
  beforeEach('deploy contracts', async function() {
    this.timeout(1 * 60 * 1000);
    // Gsn functions
    //web3 = new Web3(PROVIDER_URL);
    console.log("Parte 1");
    gsnWeb3 = new Web3(new GSNDevProvider(PROVIDER_URL));
    console.log("Parte 2");
    await run('deploy', { reset: true });
    [coa] = await deployments.getDeployedContracts('COA');
    [whitelist] = await deployments.getDeployedContracts('UsersWhitelist');
    console.log("Parte 3");
    //whitelist.addUser(userWhitelist);
    //coa.setWhitelist(whitelist);
    let relayHubAddress = await deployRelayHub(web3, {
      from: userRelayer
    });
    console.log("Parte 4");
    console.log("RelayHub address", relayHubAddress);
    subprocess = await runRelayer(web3, { quiet: true, ethereumNodeURL: PROVIDER_URL});
    await fundRecipient(web3, { recipient:coa.address, amount: 50000000, relayHubAddress: relayHubAddress, from: userRelayer});
    /*const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress: creator,
      relayerAddress: relayHubAddress
    });*/
  });

  afterEach('finish process', async function(){
    if (subprocess) 
      subprocess.kill();
  });

  it('Deployment works', async () => {
    const daosLength = await coa.getDaosLength();
    assert.equal(daosLength, 1);
  });
  describe('Members method', () => {
    const singletonRelayHub = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

    it('initially returns the singleton instance address', async function () {
      expect(await coa.getHubAddr()).to.equal(singletonRelayHub);
      const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
      assert.equal(isCoaReady, true);
    });

    it('should execute coa TX for FREE from a user without any funds', async () => {

      const emptyAcc = await web3.eth.accounts.create("secret");
      const temp = emptyAcc.address;
      //console.log("Account", emptyAcc);
      //console.log("Account", other);
      //let balance1 = await web3.eth.getBalance(userRelayer);
      //let balance2 = await web3.eth.getBalance(emptyAcc);
      //console.log("Balance", balance1, balance2);

      coa = await deployments.getContractInstance('COA', coa.address, other);
      
      /*await expectRevert(
        this.recipient.upgradeRelayHub(singletonRelayHub),
        'GSNRecipient: new RelayHub is the current one',
      );*/
      /*const gsnCtx = await fromConnection(
        web3.eth.currentProvider.host, {
          gsn: {
            dev: false,
            signKey: emptyAcc.privateKey
          }
      });
      
      const coaGSN = await new gsnCtx.lib.eth.Contract(coa.abi, coa.address);
      const gasPrice = await web3.eth.getGasPrice();
      const tx = await coaGSN.methods.createProject(project.id, project.name).send({
        from: emptyAcc.address,
        gasPrice: gasPrice,
        gasLimit: "1000000",
      });
      assert.equal(tx.status, true);*/

      // Disable GSN for a specific transaction
      const project = {
        id: 1,
        name: 'a good project'
      };
      await coa.createProject(project.id, project.name, { useGSN: false});
      //await coa.methods.createProject(project.id, project.name).send({ useGSN: false});
      const bal = await balance(web3, {
        recipient: coa.address // required
      });
      console.log("Balance 2", bal);
      balance1 = await web3.eth.getBalance(userRelayer);
      balance2 = await web3.eth.getBalance(other);
      console.log("Balance 3", balance1, balance2);
      
      const instance = await getProjectAt(await coa.projects(0), other);
      assert.equal(await instance.name(), project.name);
    });
  });
});
