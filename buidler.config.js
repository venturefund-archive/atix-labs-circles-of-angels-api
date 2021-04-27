usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('solidity-coverage');

const { lazyObject } = require('@nomiclabs/buidler/plugins');

const config = require('config');
const COA = require('./src/plugins/coa');
require('./src/rest/services/helpers/buidlerTasks');

async function getDeploymentSigner(env) {
  const { provider } = env.ethers;
  const accounts = await provider.listAccounts();

  return provider.getSigner(accounts[0]);
}

async function disableGSNAndDeployAll(
  env,
  resetStates,
  doUpgrade,
  resetAllContracts
) {
  // Make sure everything is compiled
  await run('compile');

  if (resetStates || resetAllContracts) env.coa.clearContracts();

  const oldGSNIsEnabled = config.gsnConfig.isEnabled;
  config.gsnConfig.isEnabled = false;
  const signer = await getDeploymentSigner(env);
  await env.deployments.deployAll(
    signer,
    resetStates,
    doUpgrade,
    resetAllContracts
  );
  config.gsnConfig.isEnabled = oldGSNIsEnabled;
  if (config.gsnConfig.isEnabled) await run('check-balances');
}

task('deploy', 'Deploys COA contracts')
  .addOptionalParam(
    'resetStates',
    'redeploy all proxies in order to reset all contract states',
    false,
    types.boolean
  )
  .addOptionalParam(
    'resetAllContracts',
    'force deploy of all contracts',
    false,
    types.boolean
  )
  .setAction(async ({ resetStates, resetAllContracts }, env) => {
    await disableGSNAndDeployAll(env, resetStates, false, resetAllContracts);
  });

task(
  'upgradeContracts',
  'Deploys and Upgrades (if necessary) upgradeable COA contracts'
)
  .addOptionalParam(
    'resetStates',
    'redeploy all proxies in order to reset all contract states',
    false,
    types.boolean
  )
  .addOptionalParam(
    'resetAllContracts',
    'force deploy of all contracts',
    false,
    types.boolean
  )
  .setAction(async ({ resetStates, resetAllContracts }, env) => {
    await disableGSNAndDeployAll(env, resetStates, true, resetAllContracts);
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
