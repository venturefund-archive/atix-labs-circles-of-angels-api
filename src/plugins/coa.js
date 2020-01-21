const { readArtifact } = require('@nomiclabs/buidler/plugins');
const { ContractFactory, utils } = require('ethers');
const {
  createChainIdGetter
} = require('@nomiclabs/buidler/internal/core/providers/provider-utils');

module.exports = class COA {
  constructor(env) {
    this.env = env;
    this.chainIdGetter = createChainIdGetter(env.ethereum);
    this.contracts = {};
  }

  // testing methods
  async fail() {
    const coa = await this.getCOA();
    return coa.fail();
  }

  async success() {
    const coa = await this.getCOA();
    return coa.success();
  }

  async emitEvent() {
    const coa = await this.getCOA();
    return coa.emitEvent();
  }
  // testing methods

  async createMember(profile) {
    const coa = await this.getCOA();
    await coa.createMember(profile);
  }

  async createProject(name, agreement) {
    const coa = await this.getCOA();
    await coa.createProject(name, agreement);
  }

  async createDAO(name) {
    const coa = await this.getCOA();
    await coa.createDAO(name);
  }

  async getProject(address) {
    return this.getContractAt('Project', address);
  }

  async getProjectById(id) {
    const coa = await this.getCOA();
    const address = await coa.projects(id);
    return this.getContractAt('Project', address);
  }

  async getClaim(projectId, validator, claim) {
    const coa = await this.getCOA();
    const projectAddress = await coa.projects(projectId);
    const tx = await coa.registry(projectAddress, validator, claim);
    console.log(tx);
  }

  async addClaim(project, claim, proof, valid) {
    const registry = await this.getRegistry();
    const tx = await registry.addClaim(project, claim, proof, valid);
    // get receipt and check logs
    console.log(tx);
    return tx;
  }

  async approveTask(projectId, validator, taskId, proof) {
    const coa = await this.getCOA();

    const address = await coa.projects(projectId);
    const project = await this.getProject(address);
    const owner = await project.owner();

    const claim = utils.id(`${projectId}${owner}${taskId}`);

    await this.makeClaim(address, validator, claim, proof, true);
  }

  async approveTransfer(projectId, validator, transferId, proof) {
    const coa = await this.getCOA();

    const address = coa.projects(projectId);
    const claim = utils.id(`${address}${transferId}`);

    await this.makeClaim(address, validator, claim, proof, true);
  }

  async makeClaim(project, validator, claim, proof, valid) {
    const coa = await this.getCOA();
    // TODO : connect Contract instance to a signer (similar to web3's `from` argument)
    // coa.connect(validator);
    await coa.addClaim(project, claim, proof, valid);
  }

  async getMember(address) {
    const coa = await this.getCOA();
    return coa.members(address);
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
    const factory = await this.getContract(name, signer);
    return factory.attach(address);
  }

  async getDaoContract(address, signer) {
    const dao = await this.getContractAt('DAO', address, signer);
    return dao;
  }

  async submitProposalVote(daoId, proposalId, vote, signer) {
    const coa = await this.getCOA();
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await dao.submitVote(proposalId, vote);
  }

  async submitProposal(daoId, type, description, applicantAddress, signer) {
    const coa = await this.getCOA();
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await dao.submitProposal(applicantAddress, type, description);
  }

  async processProposal(daoId, proposalId, signer) {
    const coa = await this.getCOA();
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await dao.processProposal(proposalId);
  }

  async getAllProposalsByDaoId(daoId, signer) {
    const coa = await this.getCOA();
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    const proposalsLength = await dao.getProposalQueueLength();
    const proposals = [];
    for (let i = 0; i < proposalsLength; i++) {
      proposals.push(dao.proposalQueue(i));
    }
    return Promise.all(proposals);
  }

  async getDaoMember(daoId, memberAddress, signer) {
    const coa = await this.getCOA();
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    const member = await dao.members(memberAddress);
    return member;
  }

  async getDaos() {
    const coa = await this.getCOA();
    const daosLength = await coa.getDaosLength();
    const daos = [];
    for (let i = 0; i < daosLength; i++) {
      daos.push(coa.daos(i));
    }
    return Promise.all(daos);
  }

  async getCOA() {
    if (this.contracts.coa === undefined) {
      const contract = await this.env.deployments.getLastDeployedContract(
        'COA'
      );
      this.contracts.coa = contract;
    }

    return this.contracts.coa;
  }

  async getRegistry() {
    if (this.contracts.registry === undefined) {
      const contract = await this.env.deployments.getLastDeployedContract(
        'ClaimsRegistry'
      );

      this.contracts.registry = contract;
    }

    return this.contracts.registry;
  }

  async getSigner(account) {
    if (account === undefined) {
      return (await this.env.ethers.signers())[0];
    }
    if (typeof account === 'string') {
      return this.env.ethers.provider.getSigner(account);
    }
    return account;
  }

  isDeployed(state, chainId, name) {
    return (
      state[chainId] !== undefined &&
      state[chainId][name] !== undefined &&
      state[chainId][name].length > 0
    );
  }
};
