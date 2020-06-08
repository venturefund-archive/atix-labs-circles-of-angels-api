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
  async getNewProposalTransaction({
    daoId,
    userWallet,
    user,
    applicant,
    description,
    type
  }) {
    logger.info('[DAOService] :: Entering getNewProposalTransaction method');
    validateRequiredParams({
      method: 'getNewProposalTransaction',
      params: { daoId, userWallet, user, applicant, description, type }
    });

    if (!Object.values(proposalTypeEnum).includes(type)) {
      logger.error(
        `[DAOService] :: Proposal type of value ${type} is not valid`
      );
      throw new COAError(errors.dao.InvalidProposalType);
    }

    logger.info('[DAOService] :: Getting new proposal transaction');
    const unsignedTx = await coa.getNewProposalTransaction(
      daoId,
      applicant,
      type,
      description,
      userWallet.address
    );

    const nonce = await this.transactionService.getNextNonce(userWallet.address);
    const txWithNonce = { ...unsignedTx, nonce };

    logger.info(
      '[DAOService] :: Sending unsigned transaction to client',
      txWithNonce
    );
    return {
      tx: txWithNonce,
      encryptedWallet: userWallet.encryptedWallet
    };
  },
  /*
   * Sends the signed transaction to the blockchain
   */
  async sendNewProposalTransaction({ daoId, signedTransaction, userWallet }) {
    logger.info('[DAOService] :: Entering sendNewProposalTransaction method');
    validateRequiredParams({
      method: 'sendNewProposalTransaction',
      params: {
        daoId,
        signedTransaction,
        userWallet
      }
    });

    const userAddress = userWallet.address;
    logger.info(
      '[DAOService] :: Sending signed tx to the blockchain for proposal of DAO: ',
      daoId
    );

    const tx = await coa.sendNewProposalTransaction(signedTransaction);
    logger.info('[DAOService] :: New proposal transaction sent', tx);

    logger.info('[DAOService] :: Saving transaction in database', tx);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return daoId;
  },
  /*
   * Gets the unsigned transaction of a vote
   */
  async getNewVoteTransaction({ daoId, proposalId, userWallet, vote }) {
    logger.info('[DAOService] :: Entering getNewVoteTransaction method');
    validateRequiredParams({
      method: 'getNewVoteTransaction',
      params: { daoId, proposalId, userWallet, vote }
    });

    let userVote = voteEnum.NULL;
    if (vote !== null && vote !== undefined) {
      userVote = vote ? voteEnum.YES : voteEnum.NO;
    }

    logger.info('[DAOService] :: Getting new vote transaction');
    try {
      const unsignedTx = await coa.getNewVoteTransaction(
        daoId,
        proposalId,
        userVote,
        userWallet.address
      );

      const nonce = await this.transactionService.getNextNonce(
        userWallet.address
      );
      const txWithNonce = { ...unsignedTx, nonce };
      logger.info(
        '[DAOService] :: Sending unsigned transaction to client',
        txWithNonce
      );
      return {
        tx: txWithNonce,
        encryptedWallet: userWallet.encryptedWallet
      };
    } catch (error) {
      logger.error('[DAOService] :: Error voting proposal', error);
      throw new COAError(errors.dao.ErrorVotingProposal(proposalId, daoId));
    }
  },
  async sendNewVoteTransaction({
    daoId,
    proposalId,
    signedTransaction,
    userWallet
  }) {
    logger.info('[DAOService] :: Entering sendNewVoteTransaction method');
    validateRequiredParams({
      method: 'sendNewVoteTransaction',
      params: {
        daoId,
        proposalId,
        signedTransaction,
        userWallet
      }
    });

    const userAddress = userWallet.address;
    logger.info(
      '[DAOService] :: Sending signed tx to the blockchain for vote of DAO: ',
      daoId,
      'Proposal: ',
      proposalId
    );

    const tx = await coa.sendNewProposalTransaction(signedTransaction);
    logger.info('[DAOService] :: New vote transaction sent', tx);

    logger.info('[DAOService] :: Saving transaction in database', tx);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return daoId;
  },
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
      await coa.submitProposalVote(daoId, proposalId, userVote, undefined);
      // await coa.submitProposalVote(daoId, proposalId, userVote, user.wallet.address);
      // Temporally this will stay commented until signer
      // is implemented on this service: user.wallet.address
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
        // Temporally this will stay commented until signer
        // is implemented on this service.
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
      const formattedProposals = proposals.map((proposal, index) => ({
        proposer: proposal.proposer,
        applicant: proposal.applicant,
        proposalType: proposal.proposalType,
        yesVotes: Number(proposal.yesVotes),
        noVotes: Number(proposal.noVotes),
        didPass: proposal.didPass,
        description: proposal.description,
        startingPeriod: Number(proposal.startingPeriod),
        processed: proposal.processed,
        id: index
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
        daos[i].id = i;
        const isMember = await coa.getDaoMember(i, userAddress);
        if (isMember.exists) filteredDaos.push(daos[i]);
      }
      const formattedDaos = filteredDaos.map(async dao => ({
        name: await dao.name(),
        address: await dao.address,
        proposalsAmount: await dao.getProposalQueueLength(),
        id: dao.id
        // TODO: add dao.getMembers() in COA plugin
      }));
      return await Promise.all(formattedDaos);
    } catch (error) {
      logger.error('[DAOService] :: Error getting Daos', error);
      throw new COAError(errors.dao.ErrorGettingDaos());
    }
  }
};
