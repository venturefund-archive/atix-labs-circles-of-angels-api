const { run, coa, ethereum } = require('@nomiclabs/buidler');
const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const daoService = require('../../rest/services/daoService');
const { injectMocks } = require('../../rest/util/injection');
const { userRoles } = require('../../rest/util/constants');

const {
  proposalTypeEnum,
  voteEnum,
  daoMemberRoleEnum,
  daoMemberRoleNames
} = require('../../rest/util/constants');

let mockedDaoService = Object.assign({}, daoService);
const restoreMockedDaoService = () => {
  mockedDaoService = Object.assign({}, daoService);
};

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

const moveForwardSeconds = async seconds => {
  await ethereum.send('evm_increaseTime', [seconds]);
  await ethereum.send('evm_mine', []);
};

describe('Testing daoService', () => {
  const defaultUser = {
    id: 1,
    wallet: undefined // uses member 0
  };
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR,
    firstName: 'John',
    lastName: 'Doe',
    address: '0x0000000000000000000000000000000000000000'
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

  beforeAll(() => {
    coa.sendNewTransaction = jest.fn();
    coa.getNewProposalTransaction = jest.fn();
    coa.getProcessProposalTransaction = jest.fn();
    coa.getNewVoteTransaction = jest.fn();
    coa.getTransactionResponse = jest.fn(() => null);
    coa.getBlock = jest.fn();
  });

  const transactionService = {
    getNextNonce: jest.fn(() => 0),
    save: jest.fn(),
    hasFailed: jest.fn(() => false)
  };

  let dbUser = [];
  const resetDb = () => {
    dbUser = [];
  };

  const userService = {
    getUsers: () => dbUser
  };

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
    it('should throw an error if the DAO does not exist', async () => {
      const memberAddress = await run('create-member');
      await expect(
        daoService.submitProposal({
          daoId: 1,
          type: proposalTypeEnum.NEW_MEMBER,
          description: 'Test proposal',
          applicant: memberAddress,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorSubmittingProposal(1));
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
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        daoService.voteProposal({
          daoId: 1,
          proposalId: 0,
          vote: voteEnum.YES,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorVotingProposal(0, 1));
    });
    it('should throw an error if the proposal does not exist', async () => {
      await expect(
        daoService.voteProposal({
          daoId: 0,
          proposalId: 1,
          vote: voteEnum.YES,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorVotingProposal(1, 0));
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
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        daoService.processProposal({
          daoId: 1,
          proposalId: 0,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorProcessingProposal(0, 1));
    });
    it('should throw an error if the proposal does not exist', async () => {
      await expect(
        daoService.processProposal({
          daoId: 0,
          proposalId: 1,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorProcessingProposal(1, 0));
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
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        daoService.getMember({
          daoId: 1,
          memberAddress: superUserAddress,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingMember(superUserAddress, 1));
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
        daoId: 0
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
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        daoService.getProposalsByDaoId({
          daoId: 1,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingProposals(1));
    });
  });
  describe('Testing getDaos method', () => {
    it('should have a list of 2 daos when getDaos is applied', async () => {
      const firstMemberAddress = await run('create-member');
      await run('create-dao', { account: firstMemberAddress });
      await run('create-dao', { account: firstMemberAddress });
      const response = await daoService.getDaos({
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      expect(response).toHaveLength(2);
    });
    it('should have 1 proposal length when adding a proposal to a DAO', async () => {
      // Its the only DAO for the user, thats why is unique
      const uniqueDaoIndex = 0;
      const firstMemberAddress = await run('create-member');
      const secondMemberAddress = await run('create-member');
      const daoAddress = await run('create-dao', {
        account: firstMemberAddress
      });
      await run('propose-member-to-dao', {
        daoaddress: daoAddress,
        applicant: secondMemberAddress
      });
      const response = await daoService.getDaos({
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      const proposalAmounts = Number(response[uniqueDaoIndex].proposalsAmount);
      expect(response).toHaveLength(1);
      expect(proposalAmounts).toEqual(1);
    });
    it('should have an empty list of DAOs if the userdoesnt belong to anyone', async () => {
      const firstMemberAddress = await run('create-member');
      const response = await daoService.getDaos({
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      expect(response).toHaveLength(0);
    });
    it('should throw an error if method dont receive any user', async () => {
      await expect(daoService.getDaos({})).rejects.toThrow(
        errors.common.RequiredParamsMissing('getDaos')
      );
    });
  });
  describe('Testing getUsers method', () => {
    beforeAll(() => {
      injectMocks(mockedDaoService, {
        userService
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur);
    });

    it('should have an empty list superDao when no Users are added', async () => {
      const superDaoId = 0;
      const response = await mockedDaoService.getUsers({ daoId: superDaoId });
      expect(response).toHaveLength(0);
    });
    it('should throw an error when no daoId is provided to the method', async () => {
      await expect(mockedDaoService.getUsers({})).rejects.toThrow(
        errors.common.RequiredParamsMissing('getUsers')
      );
    });
    it('should throw an error when the id of the dao is non existent', async () => {
      const nonExistentDaoId = 1;
      await expect(
        mockedDaoService.getUsers({ daoId: nonExistentDaoId })
      ).rejects.toThrow(errors.dao.ErrorGettingDaoUsers(nonExistentDaoId));
    });
    it('should have 1 member when Dao has one user', async () => {
      const firstMemberAddress = await run('create-member');
      const secondMemberAddress = await run('create-member');
      const firstUser = { ...userEntrepreneur, address: firstMemberAddress };
      const secondUser = { ...userEntrepreneur, address: secondMemberAddress };
      dbUser.push(firstUser);
      dbUser.push(secondUser);
      await run('create-dao', { account: firstMemberAddress });
      const response = await mockedDaoService.getUsers({ daoId: 1 });
      expect(response).toHaveLength(1);
    });
  });
  describe('Testing getNewProposalTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    const superDaoId = 0;
    const description = 'a description';

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned transaction when proposal is new member and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.NEW_MEMBER
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should return the unsigned transaction when proposal is new dao and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.NEW_DAO
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing', async () => {
      const applicant = await run('create-member');
      await expect(
        mockedDaoService.getNewProposalTransaction({
          daoId: superDaoId,
          userWallet,
          applicant
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNewProposalTransaction')
      );
    });
  });
  describe('Testing sendNewProposalTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed tx to the contract, save it and return the daoId', async () => {
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendNewProposalTransaction({
        daoId: superDaoId,
        signedTransaction,
        userWallet
      });
      expect(response).toEqual(superDaoId);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendNewProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendNewProposalTransaction')
      );
    });
  });
  describe('Testing getNewVoteTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    const yesVote = true;
    const superDaoId = 0;

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned vote transaction and the encrypted user wallet', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });

      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewVoteTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewVoteTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet,
        vote: yesVote
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.getNewVoteTransaction({
          daoId: superDaoId,
          userWallet,
          vote: yesVote
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNewVoteTransaction')
      );
    });
  });
  describe('Testing sendNewVoteTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed vote tx to the contract, save it and return the daoId', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendNewVoteTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet,
        signedTransaction
      });
      expect(response).toEqual(superDaoId);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendNewVoteTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendNewVoteTransaction')
      );
    });
  });
  describe('Testing getProcessTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    const superDaoId = 0;

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned process transaction and the encrypted user wallet', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });

      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getProcessProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getProcessProposalTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing, in this case proposalId', async () => {
      await expect(
        mockedDaoService.getProcessProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getProcessProposalTransaction')
      );
    });
  });
  describe('Testing sendNewProcessTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed processed tx to the contract, save it and return the proposalId', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendProcessProposalTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet,
        signedTransaction
      });
      expect(response).toEqual(createdProposalIndex);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendProcessProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendProcessProposalTransaction')
      );
    });
  });
});
