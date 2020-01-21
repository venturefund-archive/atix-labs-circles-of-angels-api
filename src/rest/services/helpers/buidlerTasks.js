const { readArtifact } = require('@nomiclabs/buidler/plugins');
const { ContractFactory, Wallet } = require('ethers');

const { proposalTypeEnum, voteEnum } = require('../../util/constants');

const getCOAContract = async env => {
  const [coa] = await env.deployments.getDeployedContracts('COA');
  return coa;
};

const getSigner = async (env, account) => {
  let creator = (await env.ethers.signers())[0];
  if (account && typeof account === 'string') {
    creator = await env.ethers.provider.getSigner(account);
  }
  return creator;
};

const getDAOContract = async (env, address, signer) => {
  const { abi, bytecode } = await readArtifact(
    env.config.paths.artifacts,
    'DAO'
  );
  const factory = new ContractFactory(abi, bytecode, signer);
  return factory.attach(address);
};

module.exports = {
  async createMember({ profile }, env) {
    const coa = await getCOAContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
    const wallet = Wallet.createRandom();
    const { address } = wallet;
    const memberProfile = profile || 'Member created by buidler';
    await coa.createMember(memberProfile);
    console.log('New member address:', address);
  },
  async createDao({ account }, env) {
    const coa = await getCOAContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
    const creator = await getSigner(env, account);
    await coa.createDAO('DAO created by buidler task', creator._address);
    const daoIndex = (await coa.getDaosLength()) - 1;
    const daoAddress = await coa.daos(daoIndex);
    console.log(`New DAO Address: ${daoAddress} index: ${daoIndex}`);
  },
  async proposeMemberToDao({ daoaddress, applicant, proposer }, env) {
    const signer = await getSigner(env, proposer);
    const dao = await getDAOContract(env, daoaddress, signer);

    await dao.submitProposal(
      applicant,
      proposalTypeEnum.NEW_MEMBER,
      'Member added by buidler task'
    );
    const proposalIndex = (await dao.getProposalQueueLength()) - 1;
    console.log('New Proposal Index: ', proposalIndex);
  },
  async voteProposal({ daoaddress, proposal, vote, voter }, env) {
    const signer = await getSigner(env, voter);
    const dao = await getDAOContract(env, daoaddress, signer);
    let voted = voteEnum.NULL;
    if (vote) voted = voteEnum.YES;
    if (vote === false) voted = voteEnum.NO;
    await dao.submitVote(proposal, voted);
  },
  async processProposal({ daoaddress, proposal, signer }, env) {
    const member = await getSigner(env, signer);
    const dao = await getDAOContract(env, daoaddress, member);
    await dao.processProposal(proposal);
  }
};
