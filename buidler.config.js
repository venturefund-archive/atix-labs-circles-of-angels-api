usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('solidity-coverage');

const { ethers, upgrades } = require('@nomiclabs/buidler');
const { readArtifactSync, lazyObject } = require('@nomiclabs/buidler/plugins');

const config = require('config');
const COA = require('./src/plugins/coa');
const logger = require('./src/rest/logger');

async function getOrDeployContract(contractName, params, reset, env) {
  logger.info(
    `[buidler.config] :: Entering getOrDeployContract. Contract ${contractName} with args ${params}.`
  );
  let [contract] = await env.deployments.getDeployedContracts(contractName);
  if (contract === undefined || reset === true) {
    logger.info(`[buidler.config] :: ${contractName} not found, deploying...`);
    [contract] = await env.deployments.deploy(contractName, params);
    await env.deployments.saveDeployedContract(contractName, contract);
    logger.info(`[buidler.config] :: ${contractName} deployed.`);
  }
  return contract;
}

async function getOrDeployUpgradeableContract(
  contractName,
  params,
  signer,
  options,
  reset,
  env
) {
  let [contract] = await env.deployments.getDeployedContracts(contractName);
  if (contract === undefined || reset === true) {
    logger.info(`[buidler.config] :: ${contractName} not found, deploying...`);
    [contract] = await env.deployments.deployProxy(
      contractName,
      params,
      signer,
      options
    );
    await env.deployments.saveDeployedContract(contractName, contract);
    logger.info(`[buidler.config] :: ${contractName} deployed.`);
  } else {
    logger.info(
      `[buidler.config] :: ${contractName} found, checking if an upgrade is needed`
    );
    const implContract = await env.deployments.getImplContract(
      contract,
      contractName
    );
    const artifact = readArtifactSync(config.paths.artifacts, contractName);

    const implCode = await ethers.provider.getCode(implContract.address);
    if (implCode !== artifact.deployedBytecode) {
      logger.info(
        `[buidler.config] :: ${contractName} need an upgrade, upgrading to new implementation`
      );
      const factory = env.deployments.getContractFactory(contractName, signer);
      const nextImpl = upgrades.prepareUpgrade(contract.address, factory);
      await contract.upgradeTo(nextImpl);
      logger.info(`[buidler.config] :: ${contractName} upgraded`);
    }
  }
  return contract;
}

task('deploy', 'Deploys COA contracts')
  // eslint-disable-next-line no-undef
  .addOptionalParam('reset', 'force deploy', false, types.boolean)
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    // await run('compile');

    // TODO: check if reset condition is needed
    if (reset) env.coa.clearContracts();

    const implProject = await getOrDeployContract('Project', [], reset, env);

    const implSuperDao = await getOrDeployContract('SuperDAO', [], reset, env);

    const implDao = await getOrDeployContract('DAO', [], reset, env);

    const proxyAdmin = await getOrDeployContract('proxyAdmin', [], reset, env);

    const registry = await getOrDeployUpgradeableContract(
      'ClaimsRegistry',
      [],
      undefined,
      undefined,
      reset,
      env
    );

    await getOrDeployUpgradeableContract(
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
