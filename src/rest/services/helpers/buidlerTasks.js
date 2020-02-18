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

task('create-member', 'Create COA member')
  .addOptionalParam('profile', 'New member profile')
  .setAction(async ({ profile }, env) => {
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
    return address;
  });

task('create-dao', 'Create DAO')
  .addOptionalParam('account', 'DAO creator address')
  .setAction(async ({ account }, env) => {
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
  });

task('create-project', 'Create Project')
  .addOptionalParam('id', 'Project id')
  .addOptionalParam('name', 'Project name')
  .addOptionalParam('agreement', 'Project agreement hash')
  .setAction(async ({ id, name, agreement }, env) => {
    const coa = await getCOAContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }

    await coa.createProject(
      id || 1,
      name || 'Buidler Project',
      agreement || 'ipfsagreementhash'
    );
    const projectIndex = (await coa.getProjectsLength()) - 1;
    const projectAddress = await coa.projects(projectIndex);
    console.log(
      `New project address: ${projectAddress} index: ${projectIndex}`
    );
  });

task('propose-member-to-dao', 'Creates proposal to add member to existing DAO')
  .addParam('daoaddress', 'DAO address')
  .addParam('applicant', 'Applicant address')
  .addOptionalParam('proposer', 'Proposer address')
  .setAction(async ({ daoaddress, applicant, proposer }, env) => {
    const signer = await getSigner(env, proposer);
    const dao = await getDAOContract(env, daoaddress, signer);

    await dao.submitProposal(
      applicant,
      proposalTypeEnum.NEW_MEMBER,
      'Member added by buidler task'
    );
    const proposalIndex = (await dao.getProposalQueueLength()) - 1;
    console.log('New Proposal Index: ', proposalIndex);
    return proposalIndex;
  });

task('vote-proposal', 'Votes a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index')
  .addParam('vote', 'Vote (true or false)', false, types.boolean)
  .addOptionalParam('voter', 'Voter address')
  .setAction(async ({ daoaddress, proposal, vote, voter }, env) => {
    const signer = await getSigner(env, voter);
    const dao = await getDAOContract(env, daoaddress, signer);
    let voted = voteEnum.NO;
    if (vote) voted = voteEnum.YES;
    await dao.submitVote(proposal, voted);
  });

task('process-proposal', 'Process a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index')
  .addOptionalParam('signer', 'Tx signer address')
  .setAction(async ({ daoaddress, proposal, signer }, env) => {
    const member = await getSigner(env, signer);
    const dao = await getDAOContract(env, daoaddress, member);
    await dao.processProposal(proposal);
  });
