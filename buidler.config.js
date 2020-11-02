usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('solidity-coverage');
usePlugin('@openzeppelin/buidler-upgrades');
// const deployments = ;
const config = require('config');
const { lazyObject } = require('@nomiclabs/buidler/plugins');
require('./src/rest/services/helpers/buidlerTasks');
const COA = require('./src/plugins/coa');

const INFURA_API_KEY = '';
const ROPSTEN_PRIVATE_KEY = '';

// const Deployments = require("./scripts/deployments");

task('deploy', 'Deploys COA contracts')
  // eslint-disable-next-line no-undef
  .addOptionalParam('reset', 'force deploy', false, types.boolean)
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    // await run('compile');

    // TODO: check if reset condition is needed
    if (reset) env.coa.clearContracts();

    let [proxyAdmin] = await env.deployments.getDeployedContracts('ProxyAdmin');
    if (proxyAdmin === undefined || reset === true) {
      [proxyAdmin] = await env.deployments.deploy('ProxyAdmin', []);
      await env.deployments.saveDeployedContract('ProxyAdmin', proxyAdmin);
    }
    let [registry] = await env.deployments.getDeployedContracts(
      'ClaimsRegistry'
    );
    if (registry === undefined || reset === true) {
      [registry] = await env.deployments.deployProxy('ClaimsRegistry', []);
      await env.deployments.saveDeployedContract('ClaimsRegistry', registry);
      // console.log('ClaimsRegistry deployed. Address:', registry.address);
    }

    let [coa] = await env.deployments.getDeployedContracts('COA');
    if (coa === undefined || reset === true) {
      console.log('deploy coa:', proxyAdmin.address);
      [coa] = await env.deployments.deployProxy('COA', [registry.address, registry.address]);
      await env.deployments.saveDeployedContract('COA', coa);
      // console.log('COA deployed. Address:', coa.address);
    }

    // console.log('Registry attached to', registry.address);
    // console.log('COA attached to', coa.address);
  });

const coaDeploySetup = {
  contracts: [
    {
      name: 'ClaimsRegistry'
    },
    {
      name: 'COA',
      params: context => [context.ClaimsRegistry.address, context.ProxyAdmin.address]
    }
  ]
};

task('deploy2').setAction(async (args, env) => {
  const setup = env.deployments.getDeploymentSetup(coaDeploySetup);
  await setup.deploy();
});

// eslint-disable-next-line no-undef
extendEnvironment(env => {
  // eslint-disable-next-line no-param-reassign
  env.coa = new COA(env);
  // eslint-disable-next-line no-param-reassign
  env.deployments = lazyObject(() => require('./src/plugins/deployments'));
});

module.exports = {
  paths: {
    tests: './src/tests/contracts',
    sources: './src/contracts'
  },
  defaultNetwork: config.buidler.defaultNetwork || 'develop',
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
    },
    buidlerevm: {
      loggingEnabled: true,
      throwOnTransactionFailures: true
    }
  },
  solc: {
    version: '0.5.8',
    evmVersion: 'byzantium',
    optimizer: {
      enabled: true,
      runs: 1
    }
  }
};
