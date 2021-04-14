/* eslint-disable */
const {
  readArtifact,
  readArtifactSync
} = require('@nomiclabs/buidler/plugins');
const { ContractFactory } = require('ethers');
const { GSNProvider } = require("@openzeppelin/gsn-provider");
const AdminUpgradeabilityProxy = require('@openzeppelin/upgrades-core/artifacts/AdminUpgradeabilityProxy.json');
const {
  ethereum,
  network,
  config,
  ethers,
  upgrades
} = require('@nomiclabs/buidler');
const {
  ensureFileSync,
  existsSync,
  readJsonSync,
  writeJSONSync
} = require('fs-extra');
const {
  createChainIdGetter
} = require('@nomiclabs/buidler/internal/core/providers/provider-utils');
const { contractAddresses, gsnConfig } = require('config');
const logger = require('../rest/logger')

// TODO : this can be placed into the buidler's config.
const stateFilename = 'state.json';

const readState = () => readJsonSync(stateFilename);

const writeState = state => writeJSONSync(stateFilename, state);

const setInitialState = () => writeState({});

const ensureStateFile = () => {
  if (!existsSync(stateFilename)) {
    ensureFileSync(stateFilename);
    setInitialState();
  }
};

ensureStateFile();

class DeploymentSetup {
  constructor(setup, deployer) {
    this.deployer = deployer;
    this.setup = setup;
    this.context = {};
  }

  async deploy() {
    const contracts = {};
    const signer = await getSigner();
    // console.log('About to deploy', this.setup.contracts.length, 'contracts')
    for (const cfg of this.setup.contracts) {
      // console.log('Deploying', cfg.name)
      contracts[cfg.name] = await this.deployContract({ ...cfg, signer });
      // console.log('Deployed', cfg.name)
    }
    return contracts;
  }

  async deployContract(contractConfig) {
    const {
      name,
      params,
      signer,
      context,
      artifact,
      after,
      address
    } = contractConfig;

    // build local context
    // let ctx = {};
    if (address === undefined) {
      const ctx = { ...this.context, ...context };
      const values = typeof params === 'function' ? params(ctx) : params;

      const [contract, receipt] = await deploy(
        artifact === undefined ? name : artifact,
        values === undefined ? [] : values,
        signer
      );

      this.context[name] = {
        address: contract.address,
        contract,
        receipt
      };
    } else {
      const contract = getContractInstance(
        artifact === undefined ? name : artifact,
        address,
        signer
      );
      this.context[name] = {
        address: contract.address,
        contract
      };
    }

    // TODO : store events in context?
    this.context[name] = {
      address: contract.address,
      contract,
      receipt
    };

    if (after !== undefined) {
      // store return value into context?
      await after(contract, receipt, ctx);
    }

    return contract;
  }
}

function getDeploymentSetup(setup, deployer) {
  return new DeploymentSetup(setup, deployer);
}

async function getDeployedAddresses(name, chainId) {
  if (contractAddresses) {
    return contractAddresses[name]
  }
  const state = readState();
  chainId = await getChainId(chainId);

  if (!isDeployed(state, chainId, name)) {
    // chainId wasn't used before or contract wasn't deployed
    return [];
  }

  return state[chainId][name];
}

async function getLastDeployedContract(name, chainId) {
  return (await getDeployedContracts(name, chainId))[0];
}

async function getDeployedContracts(name, chainId) {
  const factory = await getContractFactory(name);
  const addresses = await getDeployedAddresses(name, chainId);
  const artifact = readArtifactSync(config.paths.artifacts, name);

  if (artifact.bytecode !== factory.bytecode) {
    console.warn(
      'Deployed contract',
      name,
      ' does not match compiled local contract'
    );
  }

  const contracts = [];
  for (const addr of addresses) {
    const code = await ethers.provider.getCode(addr);
    const contract = factory.attach(addr);
    if (code === artifact.deployedBytecode || code === AdminUpgradeabilityProxy.deployedBytecode) {
      contracts.push(contract);
    }
  }

  return contracts;
}

async function getImplContract(contract, contractName) {
  const addr = contract.address;

  // This slot was recollected from
  // @openzeppelin/upgrades-core/artifacts/BaseUpgradeabilityProxy.json
  const IMPLEMENTATION_SLOT =
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

  if (await isProxy(contract)) {
    const storageAddr = await ethers.provider.getStorageAt(
        addr,
        IMPLEMENTATION_SLOT
    );
    const implAddr = `0x${storageAddr.substring(
        storageAddr.length - 40,
        storageAddr.length
    )}`;
    const contractFactory = await ethers.getContractFactory(contractName);
    return contractFactory.attach(implAddr);
  }
  throw new Error("The contract is not a Proxy")
}

async function isProxy(contract) {
  const addr = contract.address;
  const code = await ethers.provider.getCode(addr);

  return code === AdminUpgradeabilityProxy.deployedBytecode;
}

async function saveDeployedContract(name, instance) {
  const state = readState();
  if (name === undefined) {
    throw new Error('saving contract with no name');
  }

  const chainId = await getChainId();

  // is it already deployed?
  if (isDeployed(state, chainId, name)) {
    const [last, ...previous] = state[chainId][name];

    if (last !== instance.address) {
      // place the new instance address first to the list
      state[chainId][name] = [instance.address, last, ...previous];
    }
  } else {
    const addresses = [instance.address];
    // check if the chain is defined.
    if (state[chainId] === undefined) {
      // place the first contract with this chainId
      state[chainId] = {
        [name]: addresses
      };
    } else {
      // just add the new contract to the state.
      state[chainId][name] = addresses;
    }
  }

  // update state
  writeState(state);
}

async function deploy(contractName, params, signer) {
  const factory = await getContractFactory(
    contractName,
    signer
  );
  // factory.connect(await getSigner(signer));

  const contract = await factory.deploy(...params);
  await contract.deployed();

  // console.log('Deployed', contractName, 'at', contract.address);
  // await this.saveDeployedContract(contractName, contract);
  const receipt = await ethers.provider.getTransactionReceipt(
    contract.deployTransaction.hash
  );
  return [contract, receipt];
}


async function deployProxy(contractName, params, signer, opts) {
  const factory = await ethers.getContractFactory(contractName, await getSigner(signer));

  const contract = await upgrades.deployProxy(factory, params, { ...opts, unsafeAllowCustomTypes: true });
  await contract.deployed();

  const receipt = await ethers.provider.getTransactionReceipt(
      contract.deployTransaction.hash
  );
  return [contract, receipt];
}

async function getOrDeployContract(contractName, params, signer = undefined, reset = false) {
  logger.info(
      `[deployments] :: Entering getOrDeployContract. Contract ${contractName} with args [${params}].`
  );
  let [contract] = await getDeployedContracts(contractName);
  if (contract === undefined || reset === true) {
    logger.info(`[deployments] :: ${contractName} not found, deploying...`);
    [contract] = await deploy(contractName, params, signer);
    await saveDeployedContract(contractName, contract, signer);
    logger.info(`[deployments] :: ${contractName} deployed.`);
  }
  return contract;
}

function buildGetOrDeployUpgradeableContract(
  readArtifactSyncFun = readArtifactSync,
  getContractFactoryFun = getContractFactory
) {
  return async function getOrDeployUpgradeableContract(
    contractName,
    params,
    signer = undefined,
    doUpgrade = false,
    options = undefined,
    reset = false
  ) {
    logger.info(
      `[deployments] :: Entering getOrDeployUpgradeableContract. Contract ${contractName} with args [${params}].`
    );
    let [contract] = await getDeployedContracts(contractName);
    if (contract === undefined || reset === true) {
      logger.info(`[deployments] :: ${contractName} not found, deploying...`);
      [contract] = await deployProxy(
        contractName,
        params,
        signer,
        options
      );
      await saveDeployedContract(contractName, contract);
      logger.info(`[deployments] :: ${contractName} deployed.`);
    } else {
      logger.info(
        `[deployments] :: ${contractName} found, checking if an upgrade is needed`
      );
      const implContract = await getImplContract(
        contract,
        contractName
      );
      const artifact = readArtifactSyncFun(config.paths.artifacts, contractName);

      const implCode = await ethers.provider.getCode(implContract.address);
      if (implCode !== artifact.deployedBytecode) {
        logger.info(
          `[deployments] :: ${contractName} need an upgrade, upgrading to new implementation`
        );

        if (!doUpgrade)
          throw new Error(`The contract ${contractName} needs an upgrade, upgrade it with the buidler command ´upgradeContracts´`)

        const factory = await getContractFactoryFun(contractName, signer);
        contract = await upgrades.upgradeProxy(contract.address, factory, options);
        logger.info(`[deployments] :: ${contractName} upgraded`);
      }
    }
    return contract;
  }
}

async function deployAll(signer = undefined, reset = false, doUpgrade = false) {

  await getOrDeployUpgradeableContract(
    'UsersWhitelist',
    [],
    signer,
    doUpgrade,
    { initializer: 'whitelistInitialize' },
    reset
  );

  const implProject = await getOrDeployContract(
    'Project',
    [],
    signer,
    reset
  );

  const implSuperDao = await getOrDeployContract(
    'SuperDAO',
    [],
    signer,
    reset
  );

  const implDao = await getOrDeployContract('DAO', [], signer, reset);

  const proxyAdmin = await getOrDeployContract(
    'ProxyAdmin',
    [],
    signer,
    reset
  );

  const registry = await getOrDeployUpgradeableContract(
    'ClaimsRegistry',
    [],
    signer,
    doUpgrade,
    undefined,
    reset
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
    signer,
    doUpgrade,
    { initializer: 'coaInitialize' },
    reset
  );
}

async function getContractInstance(name, address, signer) {
  const factory = await getContractFactory(name, signer);

  return factory.attach(address);
}

async function getContractFactory(name, signer) {
  signer = await getSigner(signer);
  // console.log('Deployer', await signer.getAddress());
  const { abi, bytecode } = await readArtifact(config.paths.artifacts, name);
  return new ContractFactory(abi, bytecode, signer);
}

async function getChainId(chainId) {
  if (chainId === undefined) {
    const chainIdGetter = createChainIdGetter(ethereum);
    return network.config.chainId === undefined
      ? chainIdGetter()
      : network.config.chainId;
  }
  return chainId;
}

async function getAccounts() {
  return ethers.provider.listAccounts()
}

async function getSigner(account) {
  const provider = await getProvider();
  const accounts = await getAccounts();
  // TODO: Is it okay return account?
  let signer = account;
  if (account === undefined) {
    signer = provider.getSigner(accounts[0]);
  } else if (typeof account === "number") {
    signer = provider.getSigner(accounts[account]);
  } else if (typeof account === 'string') {
    signer = provider.getSigner(account);
  }
  return signer;
}

async function getProvider() {
  return gsnConfig.isEnabled ? await getGSNProvider() : ethers.provider;
}


async function getGSNProvider() {
  const providerUrl = ethers.provider.connection.url;
  const ownerAddress = (await getAccounts())[0];

  const gsnProvider = new GSNProvider(providerUrl, {
    ownerAddress,
    useGSN: true
  });

  return new ethers.providers.Web3Provider(gsnProvider);
}

function isDeployed(state, chainId, name) {
  return (
    state[chainId] !== undefined &&
    state[chainId][name] !== undefined &&
    state[chainId][name].length > 0
  );
}

const getOrDeployUpgradeableContract = buildGetOrDeployUpgradeableContract()

module.exports = {
  deploy,
  deployProxy,
  getSigner,
  getProvider,
  getAccounts,
  getDeployedContracts,
  saveDeployedContract,
  getLastDeployedContract,
  getContractInstance,
  getContractFactory,
  getImplContract,
  isProxy,
  getDeploymentSetup,
  getOrDeployContract,
  buildGetOrDeployUpgradeableContract,
  getOrDeployUpgradeableContract,
  deployAll
};
