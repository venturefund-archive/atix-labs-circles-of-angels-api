usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('solidity-coverage');

const { lazyObject } = require('@nomiclabs/buidler/plugins');

const config = require('config');
const COA = require('./src/plugins/coa');
require('./src/rest/services/helpers/buidlerTasks');

task('deploy', 'Deploys COA contracts')
  // eslint-disable-next-line no-undef
  .addOptionalParam('reset', 'force deploy', false, types.boolean)
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    await run('compile');

    if (reset) env.coa.clearContracts();

    await env.deployments.deployAll(undefined, reset, false);
  });

task(
  'upgradeContracts',
  'Deploys and Upgrades (if necessary) upgradeable COA contracts'
)
  // eslint-disable-next-line no-undef
  .addOptionalParam('reset', 'force deploy', false, types.boolean)
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    await run('compile');

    let [implWhitelist] = await env.deployments.getDeployedContracts(
      'UsersWhitelist'
    );
    if (implWhitelist === undefined || reset === true) {
      [implWhitelist] = await env.deployments.deployProxy(
        'UsersWhitelist',
        [],
        undefined,
        { initializer: 'whitelistInitialize' }
      );
      await env.deployments.saveDeployedContract(
        'UsersWhitelist',
        implWhitelist
      );
    }

    let [coa] = await env.deployments.getDeployedContracts('COA');
    if (coa === undefined || reset === true) {
      [coa] = await env.deployments.deployProxy(
        'COA',
        [
          registry.address,
          proxyAdmin.address,
          implProject.address,
          implSuperDao.address,
          implDao.address
        ],
        undefined,
        { initializer: 'coaInitialize' }
      );
      await env.deployments.saveDeployedContract('COA', coa);
      // console.log('COA deployed. Address:', coa.address);
    }

    if (reset) env.coa.clearContracts();

    await env.deployments.deployAll(undefined, reset, true);
  });

const coaDeploySetup = {
  contracts: [
    {
      name: 'ClaimsRegistry'
    },
    {
      name: 'COA',
      params: context => [
        context.ClaimsRegistry.address,
        context.ProxyAdmin.address
      ]
    },
    {
      name: 'UsersWhitelist'
    }
  ]
};

task('deploy2').setAction(async (args, env) => {
  const setup = env.deployments.getDeploymentSetup(coaDeploySetup);
  await setup.deploy();
});
// eslint-disable prefer-destructuring
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
    testnet: {
      url: config.buidler.testnet_url,
      accounts: [config.buidler.testnet_account]
    },
    mainnet: {
      url: config.buidler.mainnet_url,
      accounts: [config.buidler.mainnet_account]
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
