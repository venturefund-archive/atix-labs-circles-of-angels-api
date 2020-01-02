usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');

const COA = require('./src/plugins/coa');
const Deployments = require('./src/plugins/deployments');

const INFURA_API_KEY = '';
const MAINNET_PRIVATE_KEY = '';
const ROPSTEN_PRIVATE_KEY = '';

// const Deployments = require("./scripts/deployments");

task('deploy', 'Deploys COA contracts')
  .addOptionalParam('reset', 'force deploy')
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    await run('compile');

    reset = reset === 'true';

    let [registry] = await env.deployments.getDeployedContracts(
      'ClaimsRegistry'
    );
    if (registry === undefined || reset === true) {
      [registry] = await env.deployments.deploy('ClaimsRegistry', []);
      console.log('ClaimsRegistry deployed. Address:', registry.address);
    }

    let [coa] = await env.deployments.getDeployedContracts('COA');
    // console.log(coa, registry.address)
    if (coa === undefined || reset === true) {
      [coa] = await env.deployments.deploy('COA', [registry.address]);
      console.log('COA deployed. Address:', coa.address);
    }

    console.log('Registry attached to', registry.address);
    console.log('COA attached to', coa.address);
  });

extendEnvironment(env => {
  env.coa = new COA(env);
  env.deployments = new Deployments(env);
});

module.exports = {
  paths: {
    sources: './src/contracts'
  },
  networks: {
    develop: {
      url: 'http://localhost:8545'
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
    },
    coverage: {
      url: 'http://localhost:8555'
    }
  },
  solc: {
    version: '0.5.8',
    evmVersion: 'byzantium'
  }
};
