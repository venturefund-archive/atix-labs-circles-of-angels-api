const {
  readArtifact,
  readArtifactSync
} = require('@nomiclabs/buidler/plugins');
const { ContractFactory } = require('ethers');
const {
  artifacts,
  ethereum,
  network,
  web3,
  run,
  config,
  ethers
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
    const signer = (await ethers.signers())[0];
    // console.log('About to deploy', this.setup.contracts.length, 'contracts')
    for (const cfg of this.setup.contracts) {
      // console.log('Deploying', cfg.name)
      contracts[cfg.name] = await this.deployContract({ ...cfg, signer });
      // console.log('Deployed', cfg.name)
    }
    return contracts;
  }

  async deployContract(contractConfig) {
    const { name, params, signer, context, artifact, after } = contractConfig;

    // build local context
    const ctx = { ...this.context, ...context };
    const values = typeof params === 'function' ? params(ctx) : params;

    const [contract, receipt] = await deploy(
      artifact === undefined ? name : artifact,
      values === undefined ? [] : values,
      signer
    );

    // TODO : store events in context
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

  // TODO : should use deployedBytecode instead?
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
    if (code === artifact.deployedBytecode) {
      contracts.push(factory.attach(addr));
    }
  }

  // return addresses.map(addr => factory.attach(addr));
  return contracts;
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
  const factory = await getContractFactory(contractName, signer);
  // factory.connect(await this.getSigner(signer));

  const contract = await factory.deploy(...params);
  await contract.deployed();

  console.log('Deployed', contractName, 'at', contract.address);
  // await this.saveDeployedContract(contractName, contract);
  const receipt = await ethers.provider.getTransactionReceipt(
    contract.deployTransaction.hash
  );
  return [contract, receipt];
}

// function getContractConfig(name) {
//   const config = this.setup.contracts.find(c => c.name === name);
//   if (config === undefined) {
//     throw new Error('unknown contract' + name);
//   }
//   return config;
// }

async function getContractInstance(name, address, signer) {
  // const config = this.getContractConfig(name);

  // if (address === undefined) {
  //   if (address === undefined) {
  //     const contract = await this.getLastDeployedContract(name);
  //     address = contract.address;
  //   } else {
  //     address = config.address;
  //   }
  // }
  // if (address === undefined) {
  //   throw new Error('unable to resolve' + name + 'contract address');
  // }

  const factory = await getContractFactory(name, signer);

  return factory.attach(address);
}

async function getContractFactory(name, signer) {
  signer = await getSigner(signer);
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

async function getSigner(account) {
  if (account === undefined) {
    return (await ethers.signers())[0];
  }
  if (typeof account === 'string') {
    return ethers.provider.getSigner(account);
  }
  return account;
}

function isDeployed(state, chainId, name) {
  return (
    state[chainId] !== undefined &&
    state[chainId][name] !== undefined &&
    state[chainId][name].length > 0
  );
}

module.exports = {
  deploy,
  getDeployedContracts,
  saveDeployedContract,
  getLastDeployedContract,
  getContractInstance,
  getDeploymentSetup
};
