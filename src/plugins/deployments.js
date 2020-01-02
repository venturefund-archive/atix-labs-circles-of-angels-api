const {
  readArtifact,
  readArtifactSync
} = require("@nomiclabs/buidler/plugins");
const { ContractFactory } = require("ethers");
const {
  createChainIdGetter
} = require("@nomiclabs/buidler/internal/core/providers/provider-utils");
const {
  ensureFileSync,
  existsSync,
  readJsonSync,
  writeJSONSync
} = require("fs-extra");
// TODO : this can be placed into the buidler's config.
const stateFilename = "state.json";

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

module.exports = class Deployments {
  constructor(env) {
    this.env = env;
    this.chainIdGetter = createChainIdGetter(env.ethereum);
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
    const factory = await this.getContract(name);
    const addresses = await this.getDeployedAddresses(name, chainId);
    const artifact = readArtifactSync(this.env.config.paths.artifacts, name);
    // console.log()
    // TODO : should use deployedBytecode instead?
    // console.log(artifact.bytecode.length, artifact.deployedBytecode.length)
    // console.log(factory.bytecode.length)
    if (artifact.bytecode !== factory.bytecode) {
      console.warn(
        "Deployed contract",
        name,
        " does not match compiled local contract"
      );
    }

    return addresses.map(addr => factory.attach(addr));
  }

  async saveDeployedContract(name, instance) {
    const state = readState();
    if (name === undefined) {
      throw new Error("saving contract with no name");
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

  async deploy(contractName, params, signer) {
    console.log(contractName, params)
    const contractFactory = await this.getContract(contractName, signer);
    contractFactory.connect(await this.getSigner(signer));

    const contract = await contractFactory.deploy(...params);
    await contract.deployed();

    console.log("Deployed", contractName, "at", contract.address);
    await this.saveDeployedContract(contractName, contract);
    const receipt = await this.env.ethers.provider.getTransactionReceipt(
      contract.deployTransaction.hash
    );
    return [contract, receipt];
  }

  async getContract(name, signer) {
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
      : typeof account === "string"
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
};
