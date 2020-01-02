const {
  readArtifact,
  readArtifactSync
} = require('@nomiclabs/buidler/plugins');
const { ContractFactory } = require('ethers');
const {
  createChainIdGetter
} = require('@nomiclabs/buidler/internal/core/providers/provider-utils');

module.exports = class COA {
  constructor(env) {
    this.env = env;
    this.chainIdGetter = createChainIdGetter(env.ethereum);
  }

  async addMember(params) {
    // 0x0000000000000000000000000000000000000000000000000000000000000000
    // 0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    // 0xC2C22CeE68625D65105fE98a92B283b79845F609
    const { profile } = params;
    const coa = await this.getCOA();
    console.log(coa.abi);
    const tx = await coa.createMember(profile);
    console.log(tx);
  }

  async createProject(params, env) {
    const { name, agreement } = params;
    const coa = await getCOA();
    const projectId = await coa.createProject(name, agreement);
    console.log(await projectId.wait());
    const projectAddress = await env.run('get-project', { projectId });
    console.log(projectAddress);
    return getProject(projectAddress);
  }

  async createDAO(params, env) {
    const coa = await this.getCOA();
    const { name, agreement } = params;
    const tx = await coa.createDAO(name);
    console.log(tx);
  }

  // async addClaim(projectId, claim, proof) {
  //   const { projectId, claim, proof } = params;
  //   const coa = await getCOA();
  //   const registry = await getRegistry();
  //   const projectAddress = await env.run("get-project", { projectId });

  //   await coa.approveClaim(projectAddress, claim, proof);
  // };

  async getClaim(projectId, validator, claim) {
    const coa = await getCOA();
    if (validator === undefined) {
      signers = await env.ethers.signers();
    }
    const projectAddress = await env.run('get-project', { projectId });
    validator = signers[0];
    const tx = await coa.registry(projectAddress, validator, claim);
    console.log(tx);
  }

  async addClaim(project, claim, proof, valid) {
    const registry = await getRegistry();
    const tx = await registry.addClaim(project, claim, proof, valid);
    // get receipt and check logs
    return tx;
  }

  async approveTask(projectId, taskId, proof) {
    const coa = await getCOA();

    const projectAddress = '0xC2C22CeE68625D65105fE98a92B283b79845F609'; //await coa.projects(projectId);
    const project = await getProject(projectAddress);
    const owner = await project.owner();

    const claim = ethers.utils.id(`${projectAddress}${owner}${taskId}`);

    return env.run('make-claim', {
      project: projectId,
      claim,
      proof,
      valid: true
    });
  }

  async approveTransfer(projectId, transferId, proof) {
    const coa = await getCOA();
    const projectAddress = coa.projects(projectId);
    // const project = getProject(projectAddress)

    const claim = ethers.utils.id(`${projectAddress}${transferId}`);

    return env.run('make-claim', { project, claim, proof, valid: true });
  }

  async getMember(address) {
    const coa = await this.getCOA();
    // const signers = await env.ethers.signers();
    // const address = await signers[0].getAddress();
    console.log('getting member for', address);
    console.log(await coa.members(address));
  }

  async getProject(projectId) {
    const coa = await getCOA();
    const address = await coa.getProject(projectId);
    console.log('Project', projectId, address);
    return address;
  }

  async getContract(name, signer) {
    signer = await this.getSigner(signer);
    const { abi, bytecode } = await readArtifact(
      this.env.config.paths.artifacts,
      name
    );
    return new ContractFactory(abi, bytecode, signer);
  }

  async getContractAt(name, address, signer) {
    const factory = this.getContract(name, signer);
    return factory.attach(address);
  }

  async getCOA() {
    return this.getContract('COA');
  }

  async getRegistry() {
    return this.getContract('ClaimsRegistry');
  }

  async getProject(address) {
    return this.getContractAt('Project', address);
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
