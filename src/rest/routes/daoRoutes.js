const basePath = '/daos';
const handlers = require('./handlers/daoHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');
const { idParam } = require('../util/params');

const proposalIdParam = idParam('Proposal identification', 'proposalId');
const daoIdParam = idParam('DAO identification', 'daoId');

const memberAddressParam = {
  type: 'object',
  properties: {
    memberAddress: {
      type: 'string',
      description: 'Member Address'
    }
  }
};

const successWithProposalId = {
  type: 'object',
  properties: {
    proposalId: { type: 'integer' }
  },
  description: 'Returns the id of the proposal'
};

const successWithDaoId = {
  type: 'object',
  properties: {
    daoId: { type: 'integer' }
  },
  description: 'Returns the id of the DAO'
};

const responseProposalProperties = {
  proposer: { type: 'string' },
  applicant: { type: 'string' },
  proposalType: { type: 'number' },
  yesVotes: { type: 'number' },
  noVotes: { type: 'number' },
  didPass: { type: 'boolean' },
  description: { type: 'string' },
  startingPeriod: { type: 'number' },
  currentPeriod: { type: 'number' },
  votingPeriodExpired: { type: 'boolean' },
  processed: { type: 'boolean' },
  id: { type: 'integer' }
};

const responseDaosProperties = {
  name: { type: 'string' },
  address: { type: 'string' },
  proposalsAmount: { type: 'number' },
  id: { type: 'integer' }
};

const submitProposalProperties = {
  description: { type: 'string' },
  applicant: { type: 'string' }
};

const sendTransactionProperties = {
  signedTransaction: { type: 'string' }
};

const responseMemberProperties = {
  role: { type: 'string' },
  exists: { type: 'boolean' },
  shares: { type: 'number' }
};

const successWithProposalsArray = {
  type: 'array',
  items: {
    type: 'object',
    properties: responseProposalProperties
  },
  description: 'Returns an array of proposals for a DAO'
};

const successWithDaosArray = {
  type: 'array',
  items: {
    type: 'object',
    properties: responseDaosProperties
  },
  description: 'Returns an array of DAOS'
};

const successWithMemberResponse = {
  type: 'object',
  properties: responseMemberProperties,
  description: 'Return the information of a member of a DAO'
};

const userResponse = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    address: { type: 'string' },
    role: { type: 'string' }
  }
};

const successWithUserResponse = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: userResponse
    }
  },
  description: 'Returns an array of objects with the users information'
};

const daoRoutes = {
  getDaoUsers: {
    method: 'get',
    path: `${basePath}/users/:daoId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns relevant info of dao users',
        summary: 'Get all existing users',
        params: { daoIdParam },
        response: {
          ...successResponse(successWithUserResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getDaoUsers
  },
  getProcessProposalTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/process-proposal/:proposalId/get-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Get unsigned tx for process an existing proposal',
        summary: 'Get unsigned tx for process a proposal',
        params: { daoIdParam, proposalIdParam },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProcessProposalTransaction
  },
  sendProcessProposalTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/process-proposal/:proposalId/send-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Send signed process proposal tx to the blockchain',
        summary: 'send signed tx for process a proposal',
        params: { daoIdParam, proposalIdParam },
        body: {
          type: 'object',
          properties: sendTransactionProperties,
          required: ['signedTransaction'],
          additionalProperties: false
        },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendProcessProposalTransaction
  },
  getVoteTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/proposal/:proposalId/get-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Get unsigned tx for a new vote on an existing proposal',
        summary: 'Get unsigned tx for new vote',
        params: { daoIdParam, proposalIdParam },
        body: {
          type: 'object',
          properties: { vote: { type: 'boolean' } },
          additionalProperties: false
        },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getNewVoteTransaction
  },
  sendVoteTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/proposal/:proposalId/send-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Send aproved signed vote tx to the blockchain',
        summary: 'send signed tx for new vote',
        params: { daoIdParam, proposalIdParam },
        body: {
          type: 'object',
          properties: sendTransactionProperties,
          required: ['signedTransaction'],
          additionalProperties: false
        },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendNewVoteTransaction
  },
  getProposalTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/get-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Get unsigned tx for a new proposal an existing DAO',
        summary: 'Get unsigned tx for new proposal',
        params: { daoIdParam, proposalIdParam },
        body: {
          type: 'object',
          properties: submitProposalProperties,
          required: ['description', 'applicant'],
          additionalProperties: false
        },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getNewProposalTransaction
  },
  sendProposalTransaction: {
    method: 'post',
    path: `${basePath}/:daoId/send-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        description: 'Send approved signed proposal tx to the blockchain',
        summary: 'Send aproved signed proposal tx to the blockchain',
        params: { daoIdParam },
        body: {
          type: 'object',
          properties: sendTransactionProperties,
          required: ['signedTransaction'],
          additionalProperties: false
        },
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendNewProposalTransaction
  },
  voteProposal: {
    method: 'PUT',
    path: `${basePath}/:daoId/proposals/:proposalId/vote`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { proposalIdParam, daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.PUT.name],
        body: {
          type: 'object',
          properties: { vote: { type: 'boolean' } }
        },
        description: 'Allows a user belonging to a DAO to vote for a proposal',
        summary: 'Allows a user to vote for a proposal',
        response: {
          ...successResponse(successWithProposalId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.voteProposal
  },
  submitNewMemberProposal: {
    method: 'POST',
    path: `${basePath}/:daoId/proposals/member`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        body: {
          type: 'object',
          properties: submitProposalProperties,
          required: ['description', 'applicant'],
          additionalProperties: false
        },
        description: 'Submits a proposal to a DAO to add a new member',
        summary: 'Submits a proposal to add a new member',
        response: {
          ...successResponse(successWithDaoId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.submitNewMemberProposal
  },
  submitNewDAOProposal: {
    method: 'POST',
    path: `${basePath}/:daoId/proposals/dao`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        body: {
          type: 'object',
          properties: submitProposalProperties,
          required: ['description', 'applicant'],
          additionalProperties: false
        },
        description: 'Submits a proposal to a DAO to create a new DAO',
        summary: 'Submits a proposal to create a new DAO',
        response: {
          ...successResponse(successWithDaoId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.submitNewDAOProposal
  },
  submitAssignBankProposal: {
    method: 'POST',
    path: `${basePath}/:daoId/proposals/bank`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        body: {
          type: 'object',
          properties: submitProposalProperties,
          required: ['description', 'applicant'],
          additionalProperties: false
        },
        description:
          'Submits a proposal to a DAO to assign a member as bank operator',
        summary: 'Submits a proposal to assign a bank operator',
        response: {
          ...successResponse(successWithDaoId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.submitAssignBankProposal
  },
  submitAssignCuratorProposal: {
    method: 'POST',
    path: `${basePath}/:daoId/proposals/curator`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.POST.name],
        body: {
          type: 'object',
          properties: submitProposalProperties,
          required: ['description', 'applicant'],
          additionalProperties: false
        },
        description:
          'Submits a proposal to a DAO to assign a member as project curator',
        summary: 'Submits a proposal to assign a project curator',
        response: {
          ...successResponse(successWithDaoId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.submitAssignCuratorProposal
  },
  processProposal: {
    method: 'GET',
    path: `${basePath}/:daoId/proposals/:proposalId/process`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam, proposalIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.GET.name],
        description: 'Process a proposal of a DAO',
        summary: 'Process a proposal',
        response: {
          ...successResponse(successWithProposalId),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.processProposal
  },
  getProposals: {
    method: 'GET',
    path: `${basePath}/:daoId/proposals`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.GET.name],
        description: 'Returns all proposals of a DAO',
        summary: 'Returns all proposals',
        response: {
          ...successResponse(successWithProposalsArray),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProposals
  },
  getDaos: {
    method: 'GET',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.DAO.name, routeTags.GET.name],
        description: 'Returns all DAOS',
        summary: 'Returns all DAOS',
        response: {
          ...successResponse(successWithDaosArray),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getDaos
  },
  getMember: {
    method: 'GET',
    path: `${basePath}/:daoId/members/:memberAddress`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      params: { daoIdParam, memberAddressParam },
      schema: {
        tags: [routeTags.DAO.name, routeTags.GET.name],
        description: 'Returns the information of a member of a DAO',
        summary: 'Returns a member information',
        response: {
          ...successResponse(successWithMemberResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getMember
  }
};

const routes = {
  ...daoRoutes
};

module.exports = routes;
