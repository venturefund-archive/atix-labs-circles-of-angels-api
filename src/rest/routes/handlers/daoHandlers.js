const daoService = require('../../services/daoService');
const userService = require('../../services/userService');
const { proposalTypeEnum, txProposalStatus } = require('../../util/constants');
const logger = require('../../logger');

module.exports = {
  getAllUsers: () => async (request, reply) => {
    const users = await userService.getUsers();
    reply.status(200).send({ users });
  },
  getUsersFromDao: () => async (request, reply) => {
    const { daoId } = request.params;
    const users = await daoService.getUsers({ daoId });
    reply.status(200).send({ users });
  },
  getProcessProposalTransaction: () => async (request, reply) => {
    const { daoId, proposalId } = request.params;
    const { wallet: userWallet } = request.user;

    const response = await daoService.getProcessProposalTransaction({
      daoId,
      proposalId,
      userWallet
    });
    reply.status(200).send(response);
  },
  sendProcessProposalTransaction: () => async (request, reply) => {
    const { daoId, proposalId } = request.params;
    const { wallet: userWallet } = request.user;
    const { signedTransaction } = request.body || {};

    const response = await daoService.sendProcessProposalTransaction({
      daoId,
      proposalId,
      signedTransaction,
      userWallet
    });
    reply.status(200).send(response);
  },
  getNewProposalTransaction: type => async (request, reply) => {
    const { daoId } = request.params;
    const { wallet: userWallet } = request.user;
    const { description, applicant } = request.body || {};

    const response = await daoService.getNewProposalTransaction({
      daoId,
      userWallet,
      applicant,
      description,
      type
    });
    reply.status(200).send(response);
  },
  sendNewProposalTransaction: () => async (request, reply) => {
    const { daoId } = request.params;
    const { wallet: userWallet } = request.user;
    const { signedTransaction, applicant, description, type } = request.body || {};

    const response = await daoService.sendNewProposalTransaction({
      daoId,
      applicant,
      description,
      type,
      signedTransaction,
      userWallet
    });
    reply.status(200).send(response);
  },
  getNewVoteTransaction: () => async (request, reply) => {
    const { daoId, proposalId } = request.params;
    const { wallet: userWallet } = request.user;
    const { vote } = request.body || {};
    const response = await daoService.getNewVoteTransaction({
      daoId,
      proposalId,
      userWallet,
      vote
    });
    reply.status(200).send(response);
  },
  sendNewVoteTransaction: () => async (request, reply) => {
    const { daoId, proposalId } = request.params;
    const { wallet: userWallet } = request.user;
    const { signedTransaction } = request.body || {};

    const response = await daoService.sendNewVoteTransaction({
      daoId,
      proposalId,
      signedTransaction,
      userWallet
    });
    reply.status(200).send(response);
  },
  SubmitProposal: async (
    proposalIndex,
    memberAddress,
    applicant,
    proposalType,
    tx
  ) => {
    const { transactionHash } = tx;
    const proposalId = proposalIndex.toNumber();

    logger.info('[COA] :: Incoming event SubmitProposal');
    const updated = await daoService.updateProposalByTxHash(
      transactionHash,
      txProposalStatus.CONFIRMED,
      proposalId
    );
    if (updated) {
      logger.info(
        `[DaoHandler] :: Proposal ${updated.proposalId} status updated to ${
          txProposalStatus.CONFIRMED
        }`
      );
    } else {
      logger.info(
        `[DaoHandler] :: Couldn't update proposal with txHash ${transactionHash}`
      );
    }
  },
  voteProposal: () => async (request, reply) => {
    const { proposalId, daoId } = request.params;
    const { vote } = request.body || {};
    const { user } = request;
    const response = await daoService.voteProposal({
      daoId,
      user,
      proposalId,
      vote
    });
    reply.status(200).send(response);
  },
  // TODO: if all submitProposals are the same
  // only one handler could be used and receive type in args
  submitNewMemberProposal: () => async (request, reply) => {
    const { daoId } = request.params;
    const { description, applicant } = request.body || {};
    const { user } = request;
    const response = await daoService.submitProposal({
      daoId,
      user,
      description,
      applicant,
      type: proposalTypeEnum.NEW_MEMBER
    });
    reply.status(200).send(response);
  },
  submitNewDAOProposal: () => async (request, reply) => {
    const { daoId } = request.params;
    const { description, applicant } = request.body || {};
    const { user } = request;
    const response = await daoService.submitProposal({
      daoId,
      user,
      description,
      applicant,
      type: proposalTypeEnum.NEW_DAO
    });
    reply.status(200).send(response);
  },
  submitAssignBankProposal: () => async (request, reply) => {
    const { daoId } = request.params;
    const { description, applicant } = request.body || {};
    const { user } = request;
    const response = await daoService.submitProposal({
      daoId,
      user,
      description,
      applicant,
      type: proposalTypeEnum.ASSIGN_BANK
    });
    reply.status(200).send(response);
  },
  submitAssignCuratorProposal: () => async (request, reply) => {
    const { daoId } = request.params;
    const { description, applicant } = request.body || {};
    const { user } = request;
    const response = await daoService.submitProposal({
      daoId,
      user,
      description,
      applicant,
      type: proposalTypeEnum.ASSIGN_CURATOR
    });
    reply.status(200).send(response);
  },
  processProposal: () => async (request, reply) => {
    const { daoId, proposalId } = request.params;
    const { user } = request;
    const response = await daoService.processProposal({
      daoId,
      proposalId,
      user
    });
    reply.status(200).send(response);
  },
  getProposals: () => async (request, reply) => {
    const { daoId } = request.params;
    const { user } = request;
    const response = await daoService.getProposalsByDaoId({ daoId, user });
    reply.status(200).send(response);
  },
  getDaos: () => async (request, reply) => {
    const { user } = request;
    const response = await daoService.getDaos({ user });
    reply.status(200).send(response);
  },
  getMember: () => async (request, reply) => {
    const { daoId, memberAddress } = request.params;
    const { user } = request;
    const response = await daoService.getMember({
      daoId,
      memberAddress,
      user
    });
    reply.status(200).send(response);
  }
};
