/* eslint-disable no-restricted-syntax */
const {
  ethereum,
  run,
  deployments,
  web3,
  ethers
} = require('@nomiclabs/buidler');

const { throwsAsync, waitForEvent } = require('./testHelpers');

const ProposalType = {
  NewMember: 0,
  NewDAO: 1,
  AssignBank: 2,
  AssignCurator: 3
};

const VoteType = {
  Null: 0,
  Yes: 1,
  No: 2
};

const VOTING_PERIOD_LENGTH = 35;
const GRACE_PERIOD_LENGTH = 35;

async function blockTime() {
  // eslint-disable-next-line no-undef
  const block = await web3.eth.getBlock('latest');
  return block.timestamp;
}

const moveForwardPeriods = async periods => {
  await blockTime();
  const goToTime = 17280 * periods;
  await ethereum.send('evm_increaseTime', [goToTime]);
  await ethereum.send('evm_mine', []);
  return true;
};

const moveForwardPeriodsUntilProcessingEnabled = async (
  dao,
  proposal,
  offset = 0
) => {
  const canProcessPeriod =
    proposal.startingPeriod.toNumber() +
    VOTING_PERIOD_LENGTH +
    GRACE_PERIOD_LENGTH;
  const moveTo = canProcessPeriod + offset;
  const currentPeriod = await dao.getCurrentPeriod();
  if (currentPeriod < moveTo) await moveForwardPeriods(moveTo - currentPeriod);
};

/**
 * Fetches the latest proposal and checks if it was created properly, i.e., runs
 * assertions assuming nothing has changed the proposal state after submission.
 *
 * It won't starting period as it depends on previous proposals
 *
 * @param {contract} dao DAO where the proposal is stored
 * @param {address} proposer account that submitted the proposal
 * @param {number} type Proposal type
 * @param {string} description Proposal Description
 * @param {address} applicant Account
 */
const checkNewSubmittedProposal = async (
  dao,
  proposer,
  type,
  description,
  applicant
) => {
  const proposalIndex = (await dao.getProposalQueueLength()) - 1;
  const proposal = await dao.proposalQueue(proposalIndex);

  assert.equal(proposal.proposer, proposer, 'Wrong proposer!');
  assert.equal(proposal.description, description, 'Wrong description');
  assert.equal(proposal.proposalType, type, 'Wrong proposal type');
  assert.equal(proposal.applicant, applicant, 'Wrong applicant');
  assert.equal(proposal.yesVotes, 0, 'Initial yes votes should be');
  assert.equal(proposal.noVotes, 0, 'Initial no votes should be 0');
  assert.equal(proposal.didPass, false, 'Initial didPass should be false');
  assert.equal(
    proposal.processed,
    false,
    'It should be created as not processed'
  );
  return proposal;
};

contract('DAO.sol & SuperDAO.sol', ([creator, founder, curator]) => {
  let coa;
  let dao;
  let superDao;

  beforeEach('deploy contracts', async () => {
    await run('deploy', { reset: true });
    [coa] = await deployments.getDeployedContracts('COA');
    await coa.createDAO('the dao', creator);
    const superDaoAddress = await coa.daos(0);
    const daosLength = await coa.getDaosLength();
    const daoAddress = await coa.daos(daosLength - 1);
    dao = await deployments.getContractInstance('DAO', daoAddress);
    superDao = await deployments.getContractInstance(
      'SuperDAO',
      superDaoAddress
    );
  });

  it('DAO summoner is the one that created the contract', async () => {
    const summoner = await dao.members(creator);
    assert.equal(summoner.exists, true);
  });

  describe('Proposal submission', async () => {
    it('Single proposal', async () => {
      const proposalsBeforeSubmitting = await dao.getProposalQueueLength();
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      const proposalsAfterSubmitting = await dao.getProposalQueueLength();

      assert.equal(
        proposalsAfterSubmitting.toNumber(),
        proposalsBeforeSubmitting.toNumber() + 1
      );

      const proposal = await checkNewSubmittedProposal(
        dao,
        creator,
        ProposalType.NewMember,
        'carlos',
        founder
      );
      assert.equal(proposal.startingPeriod.toNumber(), 1);
    });

    it('Sending two proposals in a row', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await dao.submitProposal(curator, ProposalType.AssignCurator, 'luis');

      const proposalsLength = await dao.getProposalQueueLength();

      assert.equal(proposalsLength, 2);
      const proposal = await checkNewSubmittedProposal(
        dao,
        creator,
        ProposalType.AssignCurator,
        'luis',
        curator
      );

      assert.equal(proposal.startingPeriod, 2);
    });

    it('It should fail when a non member is sending a proposal', async () => {
      const signers = await ethers.signers();
      await throwsAsync(
        // We are using the first few signers
        dao
          .connect(signers[signers.length - 1])
          .submitProposal(founder, ProposalType.NewMember, 'carlos'),
        'VM Exception while processing transaction: revert not a DAO member'
      );
    });

    it('It should fail when a non member is voting', async () => {
      const signers = await ethers.signers();
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await throwsAsync(
        // We are using the first few signers
        dao.connect(signers[signers.length - 1]).submitVote(0, VoteType.Yes),
        'VM Exception while processing transaction: revert not a DAO member'
      );
    });

    it("Should fail if proposal doesn't exist", async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await throwsAsync(
        dao.submitVote(1, VoteType.Yes),
        'VM Exception while processing transaction: revert Moloch::submitVote - proposal does not exist'
      );
    });

    it('Should fail when sending an invalid vote type', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await throwsAsync(
        dao.submitVote(0, 4),
        'VM Exception while processing transaction: invalid opcode'
      );
    });

    it('Should fail if voting period has not started', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await throwsAsync(
        dao.submitVote(0, VoteType.Yes),
        'VM Exception while processing transaction: revert voting period has not started'
      );
    });

    it('Should only allow users to vote once', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await moveForwardPeriods(1);
      await dao.submitVote(0, VoteType.Yes);
      // Check for all the vote types
      for (const voteType of [VoteType.Yes, VoteType.No]) {
        // eslint-disable-next-line no-await-in-loop
        await throwsAsync(
          // eslint-disable-next-line no-loop-func
          dao.submitVote(0, voteType),
          'VM Exception while processing transaction: revert member has already voted on this proposal'
        );
      }
    });

    it('Should fail if voting Null', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await moveForwardPeriods(1);
      await throwsAsync(
        dao.submitVote(0, VoteType.Null),
        'VM Exception while processing transaction: revert vote must be either Yes or No'
      );
    });

    // eslint-disable-next-line array-callback-return
    ['Yes', 'No'].map(voteToEmit => {
      it(`Should allow users emit valid ${voteToEmit} vote`, async () => {
        const voteType = VoteType[voteToEmit];
        await dao.submitProposal(founder, 0, 'carlos');
        const proposalToVoteIndex = (await dao.getProposalQueueLength()) - 1;
        await moveForwardPeriods(1);
        const proposalBeforeVoting = await dao.proposalQueue(
          proposalToVoteIndex
        );
        await dao.submitVote(proposalToVoteIndex, voteType);

        const proposal = await dao.proposalQueue(proposalToVoteIndex);
        const [proposalIndex, memberAddress, vote] = await waitForEvent(
          dao,
          'SubmitVote'
        );

        // Vote is ok
        assert.equal(
          proposal.yesVotes.toNumber(),
          proposalBeforeVoting.yesVotes.add(voteType === VoteType.Yes ? 1 : 0)
        );
        assert.equal(
          proposal.noVotes.toNumber(),
          proposalBeforeVoting.noVotes.add(voteType === VoteType.No ? 1 : 0)
        );
        assert.equal(proposal.didPass, false);

        // Event was properly emitted
        assert.equal(proposalIndex, proposalToVoteIndex);
        assert.equal(memberAddress, creator);
        assert.equal(vote, voteType);
      });
    });
  });

  describe('Proposal processing', async () => {
    it("Should fail if proposal doesn't exist", async () => {
      await throwsAsync(
        dao.processProposal(0),
        'VM Exception while processing transaction: revert proposal does not exist'
      );
    });

    it("Should revert if proposal hasn't started", async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      const proposalIndex = (await dao.getProposalQueueLength()) - 1;
      const proposal = await dao.proposalQueue(proposalIndex);
      await moveForwardPeriodsUntilProcessingEnabled(dao, proposal, -1);

      await throwsAsync(
        dao.processProposal(proposalIndex),
        'VM Exception while processing transaction: revert proposal is not ready to be processed'
      );
    });

    it('Should revert if proposal has already been processed', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      const proposalIndex = (await dao.getProposalQueueLength()) - 1;
      const proposal = await dao.proposalQueue(proposalIndex);
      await moveForwardPeriodsUntilProcessingEnabled(dao, proposal);
      await dao.processProposal(proposalIndex);

      await throwsAsync(
        dao.processProposal(proposalIndex),
        'VM Exception while processing transaction: revert proposal has already been processed'
      );
    });

    it("Should fail if previous proposal hasn't been processed", async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      await dao.submitProposal(founder, ProposalType.AssignBank, 'carlos');
      const proposalIndex = (await dao.getProposalQueueLength()) - 1;
      const proposal = await dao.proposalQueue(proposalIndex);
      await moveForwardPeriodsUntilProcessingEnabled(dao, proposal);

      await throwsAsync(
        dao.processProposal(proposalIndex),
        'VM Exception while processing transaction: revert previous proposal must be processed'
      );
    });

    it.skip("Should fail if trying to assign a role to a member that does't belong to the DAO", async () => {});

    it('Should process a new member proposal', async () => {
      await dao.submitProposal(founder, ProposalType.NewMember, 'carlos');
      const proposalIndex = (await dao.getProposalQueueLength()) - 1;
      await moveForwardPeriods(35);
      await moveForwardPeriods(35);
      await dao.submitVote(proposalIndex, 1);
      let member = await dao.members(founder);
      assert.equal(member.exists, false);
      await moveForwardPeriods(1);
      await dao.processProposal(proposalIndex);
      const proposal = await dao.proposalQueue(proposalIndex);
      assert.equal(proposal.didPass, true);
      member = await dao.members(founder);
      assert.equal(member.exists, true);
    });

    it('Should process a new dao proposal', async () => {
      await superDao.submitProposal(founder, ProposalType.NewDAO, 'new dao');
      const proposalIndex = (await superDao.getProposalQueueLength()) - 1;
      await moveForwardPeriods(35);
      await moveForwardPeriods(35);
      await superDao.submitVote(proposalIndex, 1);
      await moveForwardPeriods(1);

      const daosBeforeProposal = await coa.getDaosLength();
      await superDao.processProposal(proposalIndex);
      const proposal = await superDao.proposalQueue(proposalIndex);

      const daosAfterProposal = await coa.getDaosLength();
      const newDaoAddress = await coa.daos(daosAfterProposal - 1);
      const newDao = await deployments.getContractInstance(
        'DAO',
        newDaoAddress
      );

      assert.equal(proposal.didPass, true);
      assert.equal(
        daosAfterProposal.toNumber(),
        daosBeforeProposal.add(1).toNumber()
      );
      assert.equal(await newDao.name(), 'A DAO');
      // applicant was added as member
      assert.notEqual(await new dao.members(founder), undefined);
    });

    const assignRoleTests = [
      {
        proposalTypeName: 'AssignBank',
        proposalType: ProposalType.AssignBank,
        expectedRole: 1
      },
      {
        proposalTypeName: 'AssignCurator',
        proposalType: ProposalType.AssignCurator,
        expectedRole: 2
      }
    ];

    // eslint-disable-next-line array-callback-return
    assignRoleTests.map(({ proposalTypeName, proposalType, expectedRole }) => {
      it(`Should process an ${proposalTypeName} proposal`, async () => {
        // Creator is being used as it's the only member already added to the DAO
        await dao.submitProposal(creator, proposalType, 'carlos');
        const proposalIndex = (await dao.getProposalQueueLength()) - 1;
        await moveForwardPeriods(1);
        await dao.submitVote(proposalIndex, VoteType.Yes);
        const proposal = await dao.proposalQueue(proposalIndex);
        // Check proposal is ok
        assert.equal(proposal.yesVotes, 1);
        assert.equal(proposal.noVotes, 0);
        assert.equal(proposal.didPass, false);

        await moveForwardPeriodsUntilProcessingEnabled(dao, proposal);
        await dao.processProposal(proposalIndex);

        // Proposal went through
        const proposalAfterProcessing = await dao.proposalQueue(proposalIndex);
        assert.equal(proposalAfterProcessing.didPass, true);
        // And member was assigned the role
        const member = await dao.members(creator);
        assert.equal(member.exists, true);
        assert.equal(member.role, expectedRole);
        assert.equal(member.shares, 1);
      });
    });
  });

  describe('transaction', () => {
    it('should revert when sending a tx to the contract', async () => {
      await throwsAsync(
        web3.eth.sendTransaction({
          from: creator,
          to: dao.address,
          value: '0x16345785d8a0000'
        }),
        'Returned error: VM Exception while processing transaction: revert'
      );
    });
  });
});