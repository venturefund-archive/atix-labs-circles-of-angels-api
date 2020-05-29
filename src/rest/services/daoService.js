const { coa } = require('@nomiclabs/buidler');
const COAError = require('../errors/COAError');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const {
  voteEnum,
  daoMemberRoleNames,
  proposalTypeEnum
} = require('../util/constants');

module.exports = {
  async voteProposal({ daoId, proposalId, vote, user }) {
    logger.info('[DAOService] :: Entering voteProposal method');
    validateRequiredParams({
      method: 'voteProposal',
      params: { daoId, proposalId, user, vote }
    });

    // TODO: check if user is allowed to vote?
    let userVote = voteEnum.NULL;
    if (vote !== null && vote !== undefined) {
      userVote = vote ? voteEnum.YES : voteEnum.NO;
    }

    logger.info('[DAOService] :: Voting for proposal', {
      daoId,
      proposalId,
      vote: userVote,
      userId: user.id
    });

    try {
      await coa.submitProposalVote(daoId, proposalId, userVote, user.wallet);
    } catch (error) {
      logger.error('[DAOService] :: Error voting proposal', error);
      throw new COAError(errors.dao.ErrorVotingProposal(proposalId, daoId));
    }
    return { proposalId };
  },
  async submitProposal({ daoId, type, description, applicant, user }) {
    logger.info('[DAOService] :: Entering submitProposal method');
    validateRequiredParams({
      method: 'submitProposal',
      params: { daoId, type, description, applicant, user }
    });
    if (!Object.values(proposalTypeEnum).includes(type)) {
      logger.error(
        `[DAOService] :: Proposal type of value ${type} is not valid`
      );
      throw new COAError(errors.dao.InvalidProposalType);
    }

    // TODO: check if user is allowed to submit?
    logger.info('[DAOService] :: Submitting proposal', {
      daoId,
      applicant,
      type,
      description,
      userId: user.id
    });
    try {
      await coa.submitProposal(
        daoId,
        type,
        description,
        applicant,
        undefined
        // user.wallet.address
      );
    } catch (error) {
      logger.error('[DAOService] :: Error submitting proposal', error);
      throw new COAError(errors.dao.ErrorSubmittingProposal(daoId));
    }
    return { daoId };
  },
  async processProposal({ daoId, proposalId, user }) {
    logger.info('[DAOService] :: Entering processProposal method');
    validateRequiredParams({
      method: 'processProposal',
      params: { daoId, proposalId, user }
    });
    // TODO: check if user is allowed to process?
    logger.info('[DAOService] :: Processing proposal', {
      daoId,
      proposalId,
      userId: user.id
    });
    try {
      await coa.processProposal(daoId, proposalId, user.wallet);
    } catch (error) {
      logger.error('[DAOService] :: Error processing proposal', error);
      throw new COAError(errors.dao.ErrorProcessingProposal(proposalId, daoId));
    }
    return { proposalId };
  },
  async getProposalsByDaoId({ daoId }) {
    logger.info('[DAOService] :: Entering getAllProposalsByDaoId method');
    validateRequiredParams({
      method: 'getProposalsByDaoId',
      params: { daoId }
    });
    logger.info('[DAOService] :: Getting all proposals', {
      daoId
    });
    try {
      const proposals = await coa.getAllProposalsByDaoId(daoId);

      // TODO: should be able to filter by something?
      const formattedProposals = proposals.map(proposal => ({
        proposer: proposal.proposer,
        applicant: proposal.applicant,
        proposalType: proposal.proposalType,
        yesVotes: Number(proposal.yesVotes),
        noVotes: Number(proposal.noVotes),
        didPass: proposal.didPass,
        description: proposal.description,
        startingPeriod: Number(proposal.startingPeriod),
        processed: proposal.processed
      }));

      return formattedProposals;
    } catch (error) {
      logger.error('[DAOService] :: Error getting proposals', error);
      throw new COAError(errors.dao.ErrorGettingProposals(daoId));
    }
  },
  async getMember({ daoId, memberAddress, user }) {
    logger.info('[DAOService] :: Entering getMember method');
    validateRequiredParams({
      method: 'getMember',
      params: { daoId, memberAddress, user }
    });
    logger.info('[DAOService] :: Getting member', {
      daoId,
      memberAddress,
      userId: user.id
    });
    try {
      const member = await coa.getDaoMember(daoId, memberAddress, user.wallet);
      if (!member || !member.exists) {
        logger.error(
          `[DAOService] :: Member of address ${memberAddress} in DAO ${daoId} not found`
        );
        throw new COAError(errors.dao.MemberNotFound(memberAddress, daoId));
      }
      return {
        role: daoMemberRoleNames[member.role],
        exists: member.exists,
        shares: Number(member.shares)
      };
    } catch (error) {
      logger.error('[DAOService] :: Error getting member', error);
      if (error instanceof COAError) throw error;
      throw new COAError(errors.dao.ErrorGettingMember(memberAddress, daoId));
    }
  },
  async getDaos({ user }) {
    logger.info('[DAOService] :: Entering getDaos method');
    validateRequiredParams({
      method: 'getDaos',
      params: { user }
    });
    logger.info('[DAOService] :: Getting all DAOS', {
      userId: user.id
    });
    try {
      const daos = await coa.getDaos();
      const filteredDaos = [];
      const userAddress = user.wallet.address;

      // FIXME: when getMembers() is implemented, change this for
      for (let i = 0; i < daos.length; i++) {
        const isMember = await coa.getDaoMember(i, userAddress);
        if (isMember.exists) filteredDaos.push(daos[i]);
      }
      const formattedDaos = filteredDaos.map(async (dao, index) => ({
        name: await dao.name(),
        address: await dao.address,
        proposalsAmount: await dao.getProposalQueueLength(),
        id: index
        // TODO: add dao.getMembers() in COA plugin
      }));
      return await Promise.all(formattedDaos);
    } catch (error) {
      logger.error('[DAOService] :: Error getting Daos', error);
      throw new COAError(errors.dao.ErrorGettingProposals());
    }
  }
};
