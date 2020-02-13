/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/activities';
const handlers = require('./handlers/activityHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const idParam = (description, param) => ({
  type: 'object',
  properties: {
    [param]: {
      type: 'integer',
      description
    }
  }
});

const taskIdParam = idParam('Task identification', 'taskId');
const milestoneIdParam = idParam('Milestone identification', 'milestoneId');

const taskProperties = {
  description: { type: 'string' },
  reviewCriteria: { type: 'string' },
  category: { type: 'string' },
  keyPersonnel: { type: 'string' },
  budget: { type: 'string' }
};

const claimProperties = {
  description: { type: 'string' }
};

const oracleProperties = {
  oracleId: { type: 'number' }
};

const successWithTaskIdResponse = {
  type: 'object',
  properties: {
    taskId: { type: 'integer' }
  },
  description: 'Returns the id of the task'
};

const taskRoutes = {
  updateTask: {
    method: 'put',
    path: `${basePath}/:taskId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Edits the information of an existing task',
        summary: 'Edits task information',
        params: { taskIdParam },
        body: {
          type: 'object',
          properties: taskProperties,
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateTask
  },

  deleteTask: {
    method: 'delete',
    path: `${basePath}/:taskId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.DELETE.name],
        description: 'Deletes an existing task',
        summary: 'Deletes task',
        params: { taskIdParam },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteTask
  },

  createTask: {
    method: 'post',
    path: `/milestones/:milestoneId${basePath}`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Creates a new task for an existing milestone',
        summary: 'Creates new task',
        params: { milestoneIdParam },
        body: {
          type: 'object',
          properties: taskProperties,
          required: [
            'description',
            'reviewCriteria',
            'category',
            'keyPersonnel',
            'budget'
          ],
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createTask
  }
};

const oracleRoutes = {
  assignOracle: {
    method: 'put',
    path: `${basePath}/:taskId/assign-oracle`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Assigns an existing oracle user to an existing activity',
        summary: 'Assign oracle to activity',
        params: { taskIdParam },
        body: {
          type: 'object',
          properties: oracleProperties,
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.assignOracle
  }
};

const routes = {
  ...taskRoutes,
  ...oracleRoutes,

  addApprovedClaim: {
    method: 'post',
    path: `${basePath}/:taskId/claim/approve`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Add an approved claim of a task for an existing project',
        summary: 'Add an approved claim',
        params: { taskIdParam },
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: claimProperties
          }
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addApprovedClaim
  },

  addDisapprovedClaim: {
    method: 'post',
    path: `${basePath}/:taskId/claim/disapprove`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Add an disapproved claim of a task for an existing project',
        summary: 'Add an disapproved claim',
        params: { taskIdParam },
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: claimProperties
          }
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addDisapprovedClaim
  }
};

module.exports = routes;
