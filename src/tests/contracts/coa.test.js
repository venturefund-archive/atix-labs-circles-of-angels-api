const {
  artifacts,
  ethereum,
  web3,
  run,
  deployments
} = require('@nomiclabs/buidler');
const { utils } = require('ethers');

let coa;
let registry;

async function getProjectAt(address) {
  const project = await deployments.getContractInstance('Project', address);
  return project;
}
async function getProject(id) {
  const address = await coa.getProject(id);
  return getProjectAt(address);
}

async function getDAOAt(address) {
  const dao = await deployments.getContractInstance('DAO', address);
  return dao;
}

async function getSuperDAO(address) {
  return deployments.getContractInstance('SuperDAO', address);
}

async function assertThrowsAsync(fn, regExp) {
  let f = () => {};
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
    return true;
  }
  await assert.fail();
}

async function blockTime() {
  const block = await web3.eth.getBlock('latest');
  return block.timestamp;
}

async function forceMine() {
  return ethereum.send('evm_mine', []);
}

async function moveForwardPeriods(periods) {
  await blockTime();
  const goToTime = 17280 * periods;
  await ethereum.send('evm_increaseTime', [goToTime]);
  await forceMine();
  await blockTime();
  return true;
}

async function addMemberToDAO(memberAddress, dao) {
  await dao.submitProposal(memberAddress, 0, 'carlos');
  const proposalIndex = (await dao.getProposalQueueLength()) - 1;
  await moveForwardPeriods(1);
  await dao.submitVote(proposalIndex, 1);
  await moveForwardPeriods(35 + 35);
  await dao.processProposal(proposalIndex);
  const member = await dao.members(memberAddress);
  assert.equal(member.exists, true);
}

contract(
  'COA application',
  ([creator, social, funder, oracle, ...otherAccounts]) => {
    beforeEach('deploy contracts', async () => {
      await run('deploy', { reset: true });
      [registry] = await deployments.getDeployedContracts('ClaimsRegistry');
      [coa] = await deployments.getDeployedContracts('COA');
    });
    describe('COA main contract', async () => {
      describe('constructor', () => {
        it('deploy params are ok', async () => {
          const { address } = registry;
          assert.equal(await coa.registry(), address);
        });
      });
      describe('members', () => {
        it('should create a member', async () => {
          const userData = ['first user profile'];
          await coa.createMember(...userData);
          assert.equal(await coa.members(creator), userData);
        });
        it('should migrate an existing member', async () => {
          const userData = ['first user profile'];
          await coa.migrateMember(...userData, funder);
          assert.equal(await coa.members(funder), userData);
        });
      });

      describe('projects', () => {
        it('should create a project', async () => {
          const project = {
            id: 1,
            name: 'a good project'
          };
          await coa.createProject(project.id, project.name);
          const instance = await getProjectAt(await coa.projects(0));
          assert.equal(await instance.name(), project.name);
        });
        it('should add an agreement to an address', async () => {
          const agreementHash = 'an IPFS/RIF Storage hash';
          await coa.addAgreement(coa.address, agreementHash);
          const agreementAdded = await coa.agreements(coa.address);
          assert.equal(agreementAdded, agreementHash);
        });
      });

      describe('transaction', () => {
        it('should revert when sending a tx to the contract', async () => {
          await assertThrowsAsync(
            async () =>
              creator.sendTransaction({
                to: coa.address,
                value: '0x16345785d8a0000'
              }),
            'VM Exception while processing transaction: revert'
          );
        });
      });
    });

    describe('claims registry', () => {
      it('should add a claim', async () => {
        await coa.createProject(1, 'a project');
        const project = await coa.projects(0);
        const claimHash = utils.id('a very useful task');
        const proof = utils.id('an authentic proof');
        const milestone = utils.id('a milestone');
        const approved = true;
        await registry.addClaim(project, claimHash, proof, approved, milestone);
        const claim = await registry.registry(project, creator, claimHash);
        assert.equal(claim.proof, proof);
        assert.equal(claim.approved, approved);
      });

      it('should check if claims are approved correctly', async () => {
        await coa.createProject(1, 'a project');
        const project = await coa.projects(0);
        const claimHash1 = utils.id('a very useful task 1');
        const claimHash2 = utils.id('a very useful task 2');
        const proof = utils.id('an authentic proof');
        const milestone = utils.id('a milestone');
        await registry.addClaim(project, claimHash1, proof, true, milestone);
        await registry.addClaim(project, claimHash2, proof, true, milestone);
        const approved = await registry.areApproved(
          project,
          [creator, creator],
          [claimHash1, claimHash2]
        );
        assert.equal(approved, true);
      });
      it('should check non-approved claims are approved correctly', async () => {
        await coa.createProject(1, 'a project');
        const project = await coa.projects(0);
        const claimHash1 = utils.id('a very useful task 1');
        const claimHash2 = utils.id('a very useful task 2');
        const milestone = utils.id('a milestone');
        const invalidClaimHash = utils.id('invalid');
        const proof = utils.id('an authentic proof');
        await registry.addClaim(project, claimHash1, proof, true, milestone);
        await registry.addClaim(project, claimHash2, proof, true, milestone);
        const approved = await registry.areApproved(
          project,
          [creator, creator, funder],
          [claimHash1, claimHash2, invalidClaimHash]
        );
        assert.equal(approved, false);
      });
      it('should handle large set of claims to be checked', async () => {
        await coa.createProject(1, 'project');
        const project = await coa.projects(0);
        const proof = utils.id('an authentic proof');
        const milestone = utils.id('a milestone');
        const claims = [];
        const validators = [];
        for (let i = 0; i < 50; i++) {
          claims.push(utils.id(`claim${i}`));
          validators.push(creator);
          // eslint-disable-next-line no-await-in-loop
          await registry.addClaim(project, claims[i], proof, true, milestone);
        }
        const approved = await registry.areApproved(
          project,
          validators,
          claims
        );
        assert.equal(approved, true);
      });
      it('should revert when sending a tx to the contract', async () => {
        await assertThrowsAsync(
          async () =>
            creator.sendTransaction({
              to: registry.address,
              value: '0x16345785d8a0000'
            }),
          'VM Exception while processing transaction: revert'
        );
      });
    });

    describe('DAO', () => {
      beforeEach('deploy contracts', async () => {
        const project = {
          id: 1,
          name: 'a good project',
          agreementHash: 'an IPFS/RIF Storage hash'
        };
        await coa.createProject(project.id, project.name);
      });
      describe('not time movement', async () => {
        it('DAO has a summoner', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          const summoner = await superDAO.members(creator);
          assert.equal(summoner.exists, true);
        });

        it('submit proposal', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          const proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.proposer, creator);
          assert.equal(proposal.applicant, funder);
          assert.equal(proposal.description, 'carlos');
          // TODO : this should check for more things.
        });
        it('submit vote - yes', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          await moveForwardPeriods(35);
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await superDAO.submitVote(proposalIndex, 1);
          const proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.yesVotes, 1);
          assert.equal(proposal.noVotes, 0);
          assert.equal(proposal.didPass, false);
        });
        it('submit vote - no', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          await moveForwardPeriods(35);
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await superDAO.submitVote(proposalIndex, 2);
          const proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.yesVotes, 0);
          assert.equal(proposal.noVotes, 1);
          assert.equal(proposal.didPass, false);
        });
        it('should revert when submitting an invalid vote', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          await moveForwardPeriods(35);
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await assertThrowsAsync(
            async () => superDAO.submitVote(proposalIndex, 3),
            'VM Exception while processing transaction: revert _vote must be less than 3'
          );
        });
        it('should revert when trying to revote', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          await moveForwardPeriods(35);
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await superDAO.submitVote(proposalIndex, 2);
          await assertThrowsAsync(
            async () => superDAO.submitVote(proposalIndex, 2),
            'VM Exception while processing transaction: revert _vote must be less than 3'
          );
        });
      });
      describe('moving through time', async () => {
        it('should process a new member proposal', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 0, 'carlos');
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await moveForwardPeriods(35);
          await moveForwardPeriods(35);
          await superDAO.submitVote(proposalIndex, 1);
          let member = await superDAO.members(funder);
          assert.equal(member.exists, false);
          await moveForwardPeriods(1);
          await superDAO.processProposal(proposalIndex);
          const proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.didPass, true);
          member = await superDAO.members(funder);
          assert.equal(member.exists, true);
        });

        it('process new dao', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await superDAO.submitProposal(funder, 1, 'carlos');
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await moveForwardPeriods(1);
          await superDAO.submitVote(proposalIndex, 1);
          let proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.yesVotes, 1);
          assert.equal(proposal.noVotes, 0);
          assert.equal(proposal.didPass, false);
          await moveForwardPeriods(35);
          await moveForwardPeriods(35);
          await assertThrowsAsync(async () => coa.daos(1));
          await superDAO.processProposal(proposalIndex);
          proposal = await superDAO.proposalQueue(proposalIndex);
          assert.equal(proposal.didPass, true);
          const dao1 = await getDAOAt(await coa.daos(1));
          const member = await dao1.members(funder);
          assert.equal(member.exists, true);
        });

        it('process assign role bank', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await addMemberToDAO(funder, superDAO);
          await superDAO.submitProposal(funder, 2, 'carlos');
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await moveForwardPeriods(1);
          await superDAO.submitVote(proposalIndex, 1);
          await moveForwardPeriods(35);
          await moveForwardPeriods(35);
          let member = await superDAO.members(funder);
          assert.equal(member.exists, true);
          assert.equal(member.role, 0);
          await superDAO.processProposal(proposalIndex);
          member = await superDAO.members(funder);
          assert.equal(member.exists, true);
          assert.equal(member.role, 1);
        });

        it('process assign role curator', async () => {
          const superDAOAddress = await coa.daos(0);
          const superDAO = await getSuperDAO(superDAOAddress);
          await addMemberToDAO(funder, superDAO);
          await superDAO.submitProposal(funder, 3, 'carlos');
          const proposalIndex = (await superDAO.getProposalQueueLength()) - 1;
          await moveForwardPeriods(1);
          await superDAO.submitVote(proposalIndex, 1);
          await moveForwardPeriods(35);
          await moveForwardPeriods(35);
          let member = await superDAO.members(funder);
          assert.equal(member.exists, true);
          assert.equal(member.role, 0);
          await superDAO.processProposal(proposalIndex);
          member = await superDAO.members(funder);
          assert.equal(member.role, 2);
        });
      });
      describe('transaction', () => {
        it('should revert when sending a tx to the contract', async () => {
          const superDAOAddress = await coa.daos(0);
          await assertThrowsAsync(
            async () =>
              creator.sendTransaction({
                to: superDAOAddress,
                value: '0x16345785d8a0000'
              }),
            'VM Exception while processing transaction: revert'
          );
        });
      });
    });
  }
);
