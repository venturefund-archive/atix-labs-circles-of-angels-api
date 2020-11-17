const daoService = require('../../services/daoService');
const { proposalTypeEnum } = require('../../util/constants');

module.exports = {
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
  //       only one handler could be used and receive type in args
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
