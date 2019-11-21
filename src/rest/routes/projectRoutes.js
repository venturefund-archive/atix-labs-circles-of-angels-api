/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/projects';
const handlers = require('./handlers/projectHandlers');
const routeTags = require('../util/routeTags');

const clientErrorResponse = ({ errors }) => ({
  '4xx': {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' },
      errors
    },
    description: 'Returns a message describing the error'
  }
});

const serverErrorResponse = () => ({
  500: {
    type: 'object',
    properties: {
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

const successResponse = ({ properties, description }) => ({
  200: {
    type: 'object',
    properties,
    description
  }
});

const projectThumbnailRoutes = {
  // create project thumbnail
  createProjectThumbnail: {
    method: 'post',
    path: `${basePath}/description`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project thumbnail to it.',
        summary: 'Create new project and project thumbnail',
        type: 'multipart/form-data',
        raw: {
          body: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              countryOfImpact: { type: 'string' },
              timeframe: { type: 'string' },
              goalAmount: { type: 'number' },
              thumbnailImgHash: { type: 'string' }
            }
          }
        },
        response: {
          ...successResponse({
            properties: {
              projectId: { type: 'number' } // TODO number? long? integer?
            },
            description:
              'Returns an array of objects with the information of the projects'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createThumbnail // TODO FIXME change this
  },
  updateProjectThumbnail: {
    method: 'put',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: '',
        summary: '',
        type: 'multipart/form-data',
        raw: {
          body: {
            type: 'object',
            properties: {}
          }
        },
        response: {
          ...successResponse(),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateThumbnail // TODO FIXME change this
  },
  uploadsThumbnailFile: {
    method: 'put',
    path: `${basePath}/:projectId/description/file`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: '',
        summary: '',
        type: 'multipart/form-data',
        raw: {
          body: {
            type: 'object',
            properties: {}
          }
        },
        response: {
          ...successResponse(),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.uploadThumbnailFile // TODO FIXME change this
  },
  getThumbnail: {
    method: 'get',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: '',
        summary: '',
        type: 'multipart/form-data',
        raw: {
          body: {
            type: 'object',
            properties: {}
          }
        },
        response: {
          ...successResponse(),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getThumbnail // TODO FIXME change this
  }
};

const projectDetailRoutes = {
  createProjectDetail: {},
  updateProjectDetail: {},
  getProjectDetail: {}
};

const projectProposalRoutes = {
  createProjectProposal: {},
  updateProjectProposal: {},
  getProjectProposal: {}
};

const milestoneRoutes = {
  deleteMilestone: {},
  editActivityOfMilestone: {},
  deleteActivityOfMilestone: {},
  addActivityOnAMilestone: {}
};

const projectMilestonesRoute = {
  getMilestoneTemplate: {},
  uploadsMilestonesFile: {},
  processMilestonesFile: {},
  getMilestones: {},
  ...milestoneRoutes
};

const createProjectRoute = {
  createProject: {}
};

const routes = {
  ...projectThumbnailRoutes,
  ...projectDetailRoutes,
  ...projectProposalRoutes,
  ...projectMilestonesRoute,
  createProjectRoute
};

module.exports = routes;
