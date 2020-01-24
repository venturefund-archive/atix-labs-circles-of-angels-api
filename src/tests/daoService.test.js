const { run, coa, ethereum } = require('@nomiclabs/buidler');
const errors = require('../rest/errors/exporter/ErrorExporter');
const daoService = require('../rest/services/daoService');
const {
  proposalTypeEnum,
  voteEnum,
  daoMemberRoleEnum,
  daoMemberRoleNames
} = require('../rest/util/constants');

const TEST_TIMEOUT_MS = 10000;
const PERIOD_DURATION_SEC = 17280;
const VOTING_PERIOD_LENGTH = 35; // periods
const GRACE_PERIOD_LENGTH = 35;
const VOTING_PERIOD_SEC = PERIOD_DURATION_SEC * VOTING_PERIOD_LENGTH;
const GRACE_PERIOD_SEC = PERIOD_DURATION_SEC * GRACE_PERIOD_LENGTH;

// TODO: change to use snapshots when buidler supports it
const redeployContracts = async () => {
  await run('deploy', { reset: true });
  const coaContract = await coa.getCOA();
  const superDaoAddress = await coaContract.daos(0);
  const { _address } = await coa.getSigner();
  return { coaContract, superDaoAddress, superUserAddress: _address };
};

describe('Testing daoService', () => {
  const defaultUser = {
    id: 1,
    wallet: undefined // uses member 0
  };
  const ALL_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  let coaContract;
  let superDaoAddress;
  let superUserAddress;
  beforeEach(async () => {
    ({
      coaContract,
      superDaoAddress,
      superUserAddress
    } = await redeployContracts());
  }, TEST_TIMEOUT_MS);
  describe('Testing submitProposal method', () => {
    it(
      'should create a new proposal in the specified DAO ' +
        'if the user is a member and return the DAO id',
      async () => {
        const memberAddress = await run('create-member');
        const response = await daoService.submitProposal({
          daoId: 0,
          type: proposalTypeEnum.NEW_MEMBER,
          description: 'Test proposal',
          applicant: memberAddress,
          user: defaultUser
        });
        const proposals = await coa.getAllProposalsByDaoId(0);
        expect(response).toEqual({ daoId: 0 });
        expect(proposals).toHaveLength(1);
      },
      TEST_TIMEOUT_MS
    );
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.submitProposal({
          daoId: 0,
          type: proposalTypeEnum.NEW_MEMBER,
          description: 'Test proposal',
          user: defaultUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('submitProposal'));
    });
    it('should throw an error if the proposal type is not a valid value', async () => {
      await expect(
        daoService.submitProposal({
          daoId: 0,
          type: 10,
          description: 'Test proposal',
          applicant: ALL_ZERO_ADDRESS,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.InvalidProposalType);
    });
    it('should throw an error if the applicant address is invalid', async () => {
      await expect(
        daoService.submitProposal({
          daoId: 0,
          type: proposalTypeEnum.NEW_MEMBER,
          description: 'Test proposal',
          applicant: '0x01234',
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorSubmittingProposal(0));
    });
  });
  describe('Testing voteProposal method', () => {
    it.each`
      vote     | yesVotes | noVotes
      ${true}  | ${1}     | ${0}
      ${false} | ${0}     | ${1}
    `(
      'should allow the user to vote on a proposal of a DAO ' +
        'with vote=$vote and return the proposal id',
      async ({ vote, yesVotes, noVotes }) => {
        const memberAddress = await run('create-member');
        const createdProposalIndex = await run('propose-member-to-dao', {
          daoaddress: superDaoAddress,
          applicant: memberAddress
        });
        await ethereum.send('evm_increaseTime', [PERIOD_DURATION_SEC]);
        const response = await daoService.voteProposal({
          daoId: 0,
          proposalId: createdProposalIndex,
          vote,
          user: defaultUser
        });
        expect(response).toEqual({ proposalId: createdProposalIndex });
        const proposal = (await coa.getAllProposalsByDaoId(0))[
          createdProposalIndex
        ];
        expect(Number(proposal.yesVotes)).toEqual(yesVotes);
        expect(Number(proposal.noVotes)).toEqual(noVotes);
      },
      TEST_TIMEOUT_MS
    );
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.voteProposal({
          daoId: 0,
          proposalId: 0,
          user: defaultUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('voteProposal'));
    });
    it('should throw an error if the user address is invalid', async () => {
      await expect(
        daoService.voteProposal({
          daoId: 0,
          proposalId: 0,
          vote: voteEnum.YES,
          user: { ...defaultUser, wallet: { address: '0xx123' } }
        })
      ).rejects.toThrow(errors.dao.ErrorVotingProposal(0, 0));
    });
  });
  describe('Testing processProposal method', () => {
    it.each`
      vote     | didPass
      ${true}  | ${true}
      ${false} | ${false}
    `(
      'should process the existing proposal, mark it as processed, ' +
        'set didPass=$didPass and return its id',
      async ({ vote, didPass }) => {
        const memberAddress = await run('create-member');
        const createdProposalIndex = await run('propose-member-to-dao', {
          daoaddress: superDaoAddress,
          applicant: memberAddress
        });
        await ethereum.send('evm_increaseTime', [PERIOD_DURATION_SEC]);
        await run('vote-proposal', {
          daoaddress: superDaoAddress,
          proposal: createdProposalIndex,
          vote
        });
        await ethereum.send('evm_increaseTime', [
          VOTING_PERIOD_SEC + GRACE_PERIOD_SEC
        ]);
        const response = await daoService.processProposal({
          daoId: 0,
          proposalId: createdProposalIndex,
          user: defaultUser
        });
        expect(response).toEqual({ proposalId: createdProposalIndex });
        const proposal = (await coa.getAllProposalsByDaoId(0))[
          createdProposalIndex
        ];
        expect(proposal.processed).toBe(true);
        expect(proposal.didPass).toBe(didPass);
      },
      TEST_TIMEOUT_MS
    );
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.processProposal({
          daoId: 0,
          user: defaultUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('processProposal'));
    });
    it('should throw an error if the user address is invalid', async () => {
      await expect(
        daoService.processProposal({
          daoId: 0,
          proposalId: 0,
          user: { ...defaultUser, wallet: { address: '0xx123' } }
        })
      ).rejects.toThrow(errors.dao.ErrorProcessingProposal(0, 0));
    });
  });
  describe('Testing getMember method', () => {
    it('should return the information of the existing member in the DAO', async () => {
      const response = await daoService.getMember({
        daoId: 0,
        memberAddress: superUserAddress,
        user: defaultUser
      });
      expect(response.role).toEqual(
        daoMemberRoleNames[daoMemberRoleEnum.NORMAL]
      );
      expect(response.exists).toBe(true);
    });
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          user: defaultUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('getMember'));
    });
    it('should throw an error if no member was found in the DAO with that address', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          memberAddress: ALL_ZERO_ADDRESS,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.MemberNotFound(ALL_ZERO_ADDRESS, 0));
    });
    it('should throw an error if the member address is invalid', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          memberAddress: '0x123456',
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingMember('0x123456', 0));
    });
  });
  describe('Testing getProposalsByDaoId method', () => {
    it('should return a list of all proposals in a dao', async () => {
      const firstMemberAddress = await run('create-member');
      const secondMemberAddress = await run('create-member');
      const firstCreatedProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: firstMemberAddress
      });
      const secondCreatedProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: secondMemberAddress
      });
      const response = await daoService.getProposalsByDaoId({
        daoId: 0,
        user: defaultUser
      });
      expect(response).toHaveLength(2);
      expect(response[firstCreatedProposalIndex].applicant).toEqual(
        firstMemberAddress
      );
      expect(response[firstCreatedProposalIndex].proposalType).toEqual(
        proposalTypeEnum.NEW_MEMBER
      );
      expect(response[secondCreatedProposalIndex].applicant).toEqual(
        secondMemberAddress
      );
      expect(response[secondCreatedProposalIndex].proposalType).toEqual(
        proposalTypeEnum.NEW_MEMBER
      );
    });
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.getProposalsByDaoId({
          user: defaultUser
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getProposalsByDaoId')
      );
    });
    it('should throw an error if the user address is invalid', async () => {
      await expect(
        daoService.getProposalsByDaoId({
          daoId: 0,
          user: { ...defaultUser, wallet: { address: '0x123' } }
        })
      ).rejects.toThrow(errors.dao.ErrorGettingProposals(0));
    });
  });
});
