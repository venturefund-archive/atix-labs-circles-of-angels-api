const {
  ethereum,
  run,
  deployments,
  //web3,
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
const Web3HttpProvider = require( 'web3-providers-http');
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
  let hubAddress;
  let deploymentProvider;
  let provider;
  let tempAccount;
  let gsnDevProvider;
  let signer;
  before('Gsn provider run' , async function() {
    gsnWeb3 = new Web3(PROVIDER_URL);
    hubAddress = await deployRelayHub(gsnWeb3, {
      from: userRelayer
    });
    console.log("Run relayed hub", hubAddress);
    subprocess = await runRelayer( { quiet: true, relayHubAddress: hubAddress});
    const web3provider = new Web3HttpProvider(PROVIDER_URL);
    deploymentProvider = new ethers.providers.Web3Provider(web3provider)
    console.log("Provider", deploymentProvider);
  });

  beforeEach('deploy contracts', async function() {
    this.timeout(1 * 60 * 1000);
    
    console.log("Parte 1");
    await run('deploy', { reset: true });
    console.log("Parte 2");
    [coa] = await deployments.getDeployedContracts2('COA');
    console.log("Parte 3");
    [whitelist] = await deployments.getDeployedContracts2('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);
    console.log("Parte 4");
    
    //whitelist.addUser(userWhitelist);
    //coa.setWhitelist(whitelist);
    
    await fundRecipient(gsnWeb3, { recipient:coa.address, amount: 0, relayHubAddress: hubAddress});
    console.log("Parte 5");
    signer = new ethers.Wallet.createRandom();

    const web3provider = new Web3HttpProvider(PROVIDER_URL);
    const web3 = new Web3(web3provider);

    //tempAccount = await web3.eth.personal.privateKeyToAccount(signer.privateKey);
    console.log("Provider web3", await web3.eth.personal.currentProvider);
    console.log("Provider web3", await web3.eth.getAccounts());

    gsnDevProvider = new GSNDevProvider(web3provider, {
      ownerAddress: creator,
      relayerAddress: hubAddress,
      useGSN: true
    });
    console.log("Parte 6");
    
    provider = new ethers.providers.Web3Provider(gsnDevProvider);
    
    //gsnDevProvider.addAccount(signer.privateKey);

    //coa = coa.connect(provider.getSigner(signer.address));
    console.log("Parte 7", coa);
    //console.log("Parte 5", provider);
  });

  after('finish process', async function(){
    console.log("Finish process relayer hub");
    if (subprocess) 
      subprocess.kill();
  });

  describe('Members method', () => {
    const singletonRelayHub = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

    /*
    it('initially returns the singleton instance address', async function () {
      expect(await coa.getHubAddr()).to.equal(singletonRelayHub);
      const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
      assert.equal(isCoaReady, true);
    });
    */

    it('should execute coa TX for FREE from a user without any funds', async () => {
      const project = {
        id: 1,
        name: 'a good project'
      };
      //const wallet = new ethers.Wallet(creator, provider);
      //console.log("Parte 4", wallet);
      

      //console.log("Account", tempAccount);
      //whitelist.addUser(temp.address);
      
      console.log("Signer", signer);
      coa = await deployments.getContractInstance('COA', coa.address, provider.getSigner(signer.address));
      //coa = coa.connect(provider);
      //const signer = await ethers.provider.getSigner(temp);
      //coa = coa.connect(temp);
      //console.log("Coa", coa);
      await coa.createProject(project.id, project.name);
      const instance = await getProjectAt(await coa.projects(0), provider.getSigner(signer.address));
      assert.equal(await instance.name(), project.name);
    });
  });
});
