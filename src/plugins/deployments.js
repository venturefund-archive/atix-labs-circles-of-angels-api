import { readArtifact, readArtifactSync } from '@nomiclabs/buidler/plugins';
import { BuidlerRuntimeEnvironment } from '@nomiclabs/buidler/types';
import { Contract, ContractFactory, Signer, utils } from 'ethers';

import {
  ensureFileSync,
  existsSync,
  readJsonSync,
  writeJSONSync
} from 'fs-extra';

// TODO : this can be placed into the buidler's config.
const stateFilename = 'state.json';

export const readState = () => readJsonSync(stateFilename);

export const writeState = state => writeJSONSync(stateFilename, state);

export const setInitialState = () => writeState({});

export const ensureStateFile = () => {
  if (!existsSync(stateFilename)) {
    ensureFileSync(stateFilename);
    setInitialState();
  }
};

export class Deployments {
  constructor(env, chainIdGetter, setup) {
    this.context = {};
    this.setup = this.env.network.config.erasureSetup;
    this.env = env;
    this.chainIdGetter = chainIdGetter;
  }

  async getDeployedAddresses(name, chainId) {
    const state = readState();
    chainId = await this.getChainId(chainId);

    if (!this.isDeployed(state, chainId, name)) {
      // chainId wasn't used before or contract wasn't deployed
      return [];
    }

    return state[chainId][name];
  }

  async getLastDeployedContract(name, chainId) {
    return (await this.getDeployedContracts(name, chainId))[0];
  }

  async getDeployedContracts(name, chainId) {
    const factory = await this.getContractFactory(name);
    const addresses = await this.getDeployedAddresses(name, chainId);
    const artifact = readArtifactSync(this.env.config.paths.artifacts, name);

    // TODO : should use deployedBytecode instead?
    if (artifact.bytecode !== factory.bytecode) {
      console.warn(
        'Deployed contract',
        name,
        ' does not match compiled local contract'
      );
    }

    return addresses.map(addr => factory.attach(addr));
  }

  async saveDeployedContract(name, instance) {
    const state = readState();
    if (name === undefined) {
      throw new Error('saving contract with no name');
    }

    const chainId = await this.getChainId();

    // is it already deployed?
    if (this.isDeployed(state, chainId, name)) {
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

  async deploySetup() {
    const contracts = {};
    for (const config of this.setup.contracts) {
      let { signer } = config;

      contracts[config.name] = await this.deployContract({ ...config, signer });
    }

    return contracts;
  }

  async deployContract(config) {
    const { name, params, signer, context, artifact, after } = config;
    // build local context
    const ctx = { ...this.context, ...context };
    const values = typeof params === 'function' ? params(ctx) : params;
    const [contract, receipt] = await this.deploy(
      artifact === undefined ? name : artifact,
      values === undefined ? [] : values,
      signer
    );

    // TODO : store events in context
    this.context[name] = {
      // address: receipt.contractAddress,
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

  async deploy(contractName, params, signer) {
    const factory = await this.getContractFactory(contractName, signer);
    factory.connect(await this.getSigner(signer));

    const contract = await factory.deploy(...params);
    await contract.deployed();

    console.log('Deployed', contractName, 'at', contract.address);
    await this.saveDeployedContract(contractName, contract);
    const receipt = await this.env.ethers.provider.getTransactionReceipt(
      contract.deployTransaction.hash
    );
    return [contract, receipt];
  }

  getContractConfig(name) {
    const config = this.setup.contracts.find(c => c.name === name);
    if (config === undefined) {
      throw new Error('unknown contract' + name);
    }
    return config;
  }

  async getContractInstance(name, address, signer) {
    const config = this.getContractConfig(name);

    if (address === undefined) {
      if (address === undefined) {
        const contract = await this.getLastDeployedContract(name);
        address = contract.address;
      } else {
        address = config.address;
      }
    }
    if (address === undefined) {
      throw new Error('unable to resolve' + name + 'contract address');
    }

    const factory = await this.getContractFactory(name, signer);

    return factory.attach(address);
  }

  async getContractFactory(name, signer) {
    signer = await this.getSigner(signer);
    const { abi, bytecode } = await readArtifact(
      this.env.config.paths.artifacts,
      name
    );
    return new ContractFactory(abi, bytecode, signer);
  }

  async getChainId(chainId) {
    if (chainId === undefined) {
      chainId =
        this.env.network.config.chainId === undefined
          ? await this.chainIdGetter()
          : this.env.network.config.chainId;
    }
    return chainId;
  }

  async getSigner(account) {
    return account === undefined
      ? (await this.env.ethers.signers())[0]
      : typeof account === 'string'
      ? this.env.ethers.provider.getSigner(account)
      : account;
  }

  isDeployed(state, chainId, name) {
    return (
      state[chainId] !== undefined &&
      state[chainId][name] !== undefined &&
      state[chainId][name].length > 0
    );
  }
}
