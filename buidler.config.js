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
    // await run('compile');

    // TODO: check if reset condition is needed
    if (reset) env.coa.clearContracts();

    const implProject = await env.deployments.getOrDeployContract(
      'Project',
      [],
      reset,
      env
    );

    const implSuperDao = await env.deployments.getOrDeployContract(
      'SuperDAO',
      [],
      reset,
      env
    );

    const implDao = await env.deployments.getOrDeployContract(
      'DAO',
      [],
      reset,
      env
    );

    const proxyAdmin = await env.deployments.getOrDeployContract(
      'ProxyAdmin',
      [],
      reset,
      env
    );

    const registry = await env.deployments.getOrDeployUpgradeableContract(
      'ClaimsRegistry',
      [],
      undefined,
      undefined,
      reset,
      env
    );

    await env.deployments.getOrDeployUpgradeableContract(
      'COA',
      [
        registry.address,
        proxyAdmin.address,
        implProject.address,
        implSuperDao.address,
        implDao.address
      ],
      undefined,
      { initializer: 'coaInitialize' },
      reset,
      env
    );
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
