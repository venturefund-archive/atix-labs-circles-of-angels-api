module.exports = {
  ErrorSubmittingProposal: daoId => ({
    message: `An error has occurred while submitting the proposal to DAO ${daoId}`
  }),
  ErrorVotingProposal: (proposalId, daoId) => ({
    message: `An error has occurred while voting the proposal ${proposalId} of DAO ${daoId}`
  }),
  ErrorProcessingProposal: (proposalId, daoId) => ({
    message: `An error has occurred while processing the proposal ${proposalId} of DAO ${daoId}`
  }),
  ErrorGettingProposals: daoId => ({
    message: `An error has occurred while getting the proposals of ${daoId}`
  }),
  ErrorGettingMember: (address, daoId) => ({
    message: `An error has occurred while getting the member of address ${address} in DAO ${daoId}`
  }),
  MemberNotFound: (address, daoId) => ({
    message: `Member of address ${address} in DAO ${daoId} not found`,
    statusCode: 403
  })
};
