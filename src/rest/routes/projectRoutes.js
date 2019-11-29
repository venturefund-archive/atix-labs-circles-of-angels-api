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

const clientErrorResponse = () => ({
  '4xx': {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

const serverErrorResponse = () => ({
  500: {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

const successResponse = response => ({
  200: {
    ...response
  }
});

const ownerIdProperty = {
  ownerId: { type: 'integer' }
};
const projectThumbnailProperties = {
  projectName: { type: 'string' },
  countryOfImpact: { type: 'string' },
  timeframe: { type: 'string' },
  goalAmount: { type: 'number' }
};
const imgPathProperty = {
  imgPath: { type: 'string' }
};
const projectDetailProperties = {
  mission: { type: 'string' },
  problemAddressed: { type: 'string' }
};
const projectProposalProperties = {
  proposal: { type: 'string' }
};
const milestoneIdProperties = {
  milestoneId: { type: 'integer' }
};
const projectMilestonesProperties = {
  // TODO
  milestoneId: { type: 'integer' }
};
const taskProperties = {
  // TODO
  milestoneId: { type: 'integer' }
};

const idParam = description => ({
  type: 'object',
  properties: {
    projectId: {
      type: 'integer',
      description
    }
  }
});

const projectIdParam = idParam('Project identification');
const milestoneIdParam = idParam('Milestone identification');
const taskIdParam = idParam('Task identification');

const successWithProjectIdResponse = {
  type: 'object',
  properties: {
    projectId: { type: 'integer' }
  },
  description: 'Returns the id of the project'
};

const projectsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      projectName: { type: 'string' },
      mission: { type: 'string' },
      problemAddressed: { type: 'string' },
      location: { type: 'string' },
      timeframe: { type: 'string' },
      proposal: { type: 'string' },
      faqLink: { type: 'string' },
      coverPhotoPath: { type: 'string' },
      cardPhotoPath: { type: 'string' },
      goalAmount: { type: 'number' },
      status: { type: 'string' },
      ownerId: { type: 'number' },
      createdAt: { type: 'string' },
      transactionHash: { type: 'string' },
      milestones: { type: 'object' },
      id: { type: 'number' }
    }
  },
  description: 'Returns all projects'
};

const successWithProjectMilestoneProcess = {
  type: 'object',
  properties: {
    projectId: { type: 'integer' }
  },
  description: 'Returns the id of the project'
}; // TODO

const projectThumbnailRoutes = {
  // create project thumbnail
  createProjectThumbnail: {
    method: 'post',
    path: `${basePath}/description`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project thumbnail to it.',
        summary: 'Create new project and project thumbnail',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectThumbnailProperties,
              ownerIdProperty
            )
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.createProjectThumbnail // TODO implement in handler
  },
  updateProjectThumbnail: {
    method: 'put',
    path: `${basePath}/:projectId/description`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectThumbnailProperties,
              ownerIdProperty
            )
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.updateProjectThumbnail // TODO implement in handler
  },
  getThumbnail: {
    method: 'get',
    path: `${basePath}/:projectId/description`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              Object.assign({}, projectThumbnailProperties, ownerIdProperty),
              imgPathProperty
            ),
            description: 'Returns the project description'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getProjectThumbnail // TODO implement in handler
  }
};

const projectDetailRoutes = {
  createProjectDetail: {
    method: 'post',
    path: `${basePath}/detail`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project detail to it.',
        summary: 'Create new project and project detail',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectDetailProperties,
              ownerIdProperty
            )
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.createProjectDetail // TODO implement in handler
  },
  updateProjectDetail: {
    method: 'put',
    path: `${basePath}/:projectId/detail`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectDetailProperties,
              ownerIdProperty
            )
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.updateProjectDetail // TODO implement in handler
  },
  getProjectDetail: {
    method: 'get',
    path: `${basePath}/:projectId/detail`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              projectDetailProperties,
              ownerIdProperty
            ),
            description: 'Returns the project detail'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getProjectDetail
  }
};

const projectProposalRoutes = {
  createProjectProposal: {
    method: 'post',
    path: `${basePath}/proposal`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        raw: {
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectProposalProperties,
              ownerIdProperty
            )
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.createProjectProposal // TODO implement in handler
  },
  updateProjectProposal: {
    method: 'put',
    path: `${basePath}/:projectId/proposal`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        raw: {
          body: {
            type: 'object',
            properties: Object.assign(
              {},
              projectProposalProperties,
              ownerIdProperty
            )
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.updateProjectProposal // TODO implement in handler
  },
  getProjectProposal: {
    method: 'get',
    path: `${basePath}/:projectId/proposal`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              Object.assign({}, projectProposalProperties, ownerIdProperty),
              imgPathProperty
            ),
            description: 'Returns the project proposal'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getProjectProposal // TODO implement in handler
  }
};

const milestoneRoutes = {
  deleteMilestone: {
    method: 'delete',
    path: `${basePath}/:projectId/milestones/:milestoneId`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: { projectIdParam, milestoneIdParam },
        response: {
          ...successResponse({
            type: 'object',
            properties: projectMilestonesProperties,
            description: 'Returns the project proposal'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.deleteMilestoneOfProject // TODO implement in handler
  },
  editTaskOfMilestone: {
    method: 'put',
    path: '/milestones/:milestoneId/activities/:taskId',
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: { projectIdParam, milestoneIdParam },
        raw: {
          body: {
            type: 'object',
            properties: taskProperties
          }
        },
        response: {
          ...successResponse({
            type: 'object',
            properties: milestoneIdProperties,
            description: 'Returns the milestoneId'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.editTaskOfMilestone // TODO implement in handler
  },
  deleteTaskOfMilestone: {
    method: 'delete',
    path: '/milestones/:milestoneId/activities/:taskId',
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: { milestoneIdParam, taskIdParam },
        response: {
          ...successResponse({
            type: 'object',
            properties: milestoneIdProperties,
            description: 'Returns the milestoneId'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.deleteTaskOfMilestone // TODO implement in handler
  },
  addTaskOnMilestone: {
    method: 'put',
    path: '/milestones/:milestoneId/activities',
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: milestoneIdParam,
        raw: {
          body: {
            type: 'object',
            properties: taskProperties
          }
        },
        response: {
          ...successResponse({
            type: 'object',
            properties: milestoneIdProperties,
            description: 'Returns the milestoneId'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.addTaskOnMilestone // TODO implement in handler
  }
};

const projectMilestonesRoute = {
  getMilestonesTemplate: {
    // this endpoint should be in any other place and serve the static file
    method: 'get',
    path: '/templates/milestones',
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'string',
            description: 'Returns the project milestone template stream'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getTemplateOfProjectMilestone // TODO implement in handler
  },
  uploadsMilestonesFile: {
    method: 'put',
    path: `${basePath}/:projectId/milestones/file`,
    options: {
      // // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        type: 'multipart/form-data',
        raw: {
          type: 'object',
          properties: {
            files: { type: 'object' }
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.uploadMilestoneFile // TODO implement in handler
  },
  processMilestonesFile: {
    method: 'post',
    path: `${basePath}/:projectId/milestones`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        response: {
          ...successResponse(successWithProjectMilestoneProcess),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.processMilestonesFile // TODO implement in handler
  },
  getMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/milestones`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: {}, // TODO define project milestones object schema
            description: 'Returns the project milestones'
          }),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getProjectMilestones // TODO implement in handler
  },
  ...milestoneRoutes
};

const createProjectRoute = {
  createProject: {
    method: 'put',
    path: `${basePath}/:projectId`,
    options: {
      // beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        type: 'multipart/form-data',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.publishProject // TODO implement in handler
  }
};

const commonProjectRoutes = {
  getProjects: {
    method: 'get',
    path: `${basePath}/`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Gets all projects.',
        summary: 'Gets all project',
        response: {
          ...successResponse(projectsResponse), // TODO change to proper get projects response
          ...clientErrorResponse(), // TODO add correct params
          ...serverErrorResponse() // TODO add correct params
        }
      }
    },
    handler: handlers.getProjects
  }
};

const routes = {
  ...projectThumbnailRoutes,
  ...projectDetailRoutes,
  ...projectProposalRoutes,
  ...projectMilestonesRoute,
  ...createProjectRoute,
  ...commonProjectRoutes
};

module.exports = routes;
