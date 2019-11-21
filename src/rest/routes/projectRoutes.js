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

const projectThumbnailProperties = {
  projectName: { type: 'string' },
  countryOfImpact: { type: 'string' },
  timeframe: { type: 'string' },
  goalAmount: { type: 'number' },
  thumbnailImgHash: { type: 'string' }
};

const projectIdParam = {
  type: 'object',
  properties: {
    projectId: {
      type: 'integer',
      description: 'Project identification'
    }
  }
};

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
            properties: projectThumbnailProperties
          }
        },
        response: {
          ...successResponse({
            properties: {
              projectId: { type: 'integer' }
            },
            description: 'Returns the id of the project'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.createThumbnail // TODO implement in handler
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
            properties: projectThumbnailProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse({
            properties: {
              projectId: { type: 'integer' }
            },
            description: 'Returns the id of the project'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.updateThumbnail // TODO implement in handler
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
        params: projectIdParam,
        raw: {
          files: { type: 'object' }
        },
        response: {
          ...successResponse({
            properties: {
              thumbnailImgHash: { type: 'string' }
            },
            description: 'Returns the thumbnailImg hash'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.uploadThumbnailFile // TODO implement in handler
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
        params: projectIdParam,
        response: {
          ...successResponse({
            properties: projectThumbnailProperties,
            description: 'Returns the project description'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getThumbnail // TODO implement in handler
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
