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
  problemAddressed: { type: 'string' },
  imgPath: { type: 'string' }
};
const projectProposalProperties = {
  proposal: { type: 'string' }
};
const experienceProperties = {
  comment: { type: 'string' }
};
const taskProperties = {
  // TODO
  milestoneId: { type: 'integer' }
};

const milestonesResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      category: { type: 'string' },
      description: { type: 'string' },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            taskHash: { type: 'string' },
            description: { type: 'string' },
            reviewCriteria: { type: 'string' },
            category: { type: 'string' },
            keyPersonnel: { type: 'string' },
            budget: { type: 'string' }
          }
        }
      }
    }
  },
  description: 'Returns all milestones of a project'
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

const userResponse = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    id: { type: 'integer' },
    role: { type: 'string' }
  },
  description: 'Returns and object with the user information'
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
      owner: userResponse,
      createdAt: { type: 'string' },
      transactionHash: { type: 'string' },
      id: { type: 'number' }
    }
  },
  description: 'Returns all projects'
};

const experienceResponse = {
  type: 'object',
  properties: {
    comment: { type: 'string' },
    photos: { type: 'array', items: { type: 'object' } }
  }
};

const projectThumbnailRoutes = {
  // create project thumbnail
  createProjectThumbnail: {
    method: 'post',
    path: `${basePath}/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project thumbnail to it.',
        summary: 'Create new project and project thumbnail',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectThumbnailProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProjectThumbnail
  },
  updateProjectThumbnail: {
    method: 'put',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectThumbnailProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectThumbnail
  },
  getThumbnail: {
    method: 'get',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
              projectThumbnailProperties,
              imgPathProperty
            ),
            description: 'Returns the project description'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectThumbnail
  }
};

const projectDetailRoutes = {
  createProjectDetail: {
    method: 'post',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project detail to it.',
        summary: 'Create new project and project detail',
        params: projectIdParam,
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
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProjectDetail
  },
  updateProjectDetail: {
    method: 'put',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectDetailProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectDetail
  },
  getProjectDetail: {
    method: 'get',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: projectDetailProperties,
            description: 'Returns the project detail'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectDetail
  }
};

const projectProposalRoutes = {
  createProjectProposal: {
    method: 'post',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        params: projectIdParam,
        raw: {
          body: {
            type: 'object',
            properties: projectProposalProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProjectProposal
  },
  updateProjectProposal: {
    method: 'put',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        raw: {
          body: {
            type: 'object',
            properties: projectProposalProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectProposal
  },
  getProjectProposal: {
    method: 'get',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
              projectProposalProperties,
              imgPathProperty
            ),
            description: 'Returns the project proposal'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectProposal
  }
};

const milestoneRoutes = {
  deleteMilestone: {
    method: 'delete',
    path: `${basePath}/:projectId/milestones/:milestoneId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: { projectIdParam, milestoneIdParam },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteMilestoneOfProject
  },
  editTaskOfMilestone: {
    method: 'put',
    path: '/milestones/:milestoneId/activities/:taskId',
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.editTaskOfMilestone
  },
  deleteTaskOfMilestone: {
    method: 'delete',
    path: '/milestones/:milestoneId/activities/:taskId',
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: { milestoneIdParam, taskIdParam },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteTaskOfMilestone
  },
  addTaskOnMilestone: {
    method: 'put',
    path: '/milestones/:milestoneId/activities',
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addTaskOnMilestone
  }
};

const projectMilestonesRoute = {
  getMilestonesTemplate: {
    // this endpoint should be in any other place and serve the static file
    method: 'get',
    path: '/templates/milestones',
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getTemplateOfProjectMilestone
  },
  uploadsMilestonesFile: {
    method: 'put',
    path: `${basePath}/:projectId/milestones/file`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
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
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.uploadMilestoneFile
  },
  processMilestonesFile: {
    method: 'post',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.processMilestonesFile
  },
  getMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse(milestonesResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectMilestones
  },
  ...milestoneRoutes
};

const createProjectRoute = {
  createProject: {
    method: 'put',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        type: 'multipart/form-data',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.publishProject
  }
};

const commonProjectRoutes = {
  getProjects: {
    method: 'get',
    path: `${basePath}`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Gets all projects.',
        summary: 'Gets all project',
        response: {
          ...successResponse(projectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjects
  },
  getProject: {
    method: 'get',
    path: '/project/:projectId',
    handler: handlers.getProject,
    options: {
      beforeHandler: []
    }
  },
  getProjectFull: {
    method: 'get',
    path: '/project/:projectId/full',
    handler: handlers.getProjectFull,
    options: {
      beforeHandler: []
    }
  }
};

const projectExperienceRoutes = {
  addExperience: {
    method: 'post',
    path: `${basePath}/:projectId/experiences`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project proposal to it.',
        summary: 'Create new project and project proposal',
        params: projectIdParam,
        raw: {
          body: {
            type: 'object',
            properties: experienceProperties
          },
          files: { type: 'array', items: { type: 'object' } }
        },
        response: {
          ...successResponse(successWithProjectIdResponse), // TODO
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addExperienceToProject
  },
  getExperiencesOfProject: {
    method: 'get',
    path: `${basePath}/:projectId/experiences`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Gets all experiences of project.',
        summary: 'Gets all experiences of project.',
        params: projectIdParam,
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getExperiencesOfProject
  }
};

const routes = {
  ...projectThumbnailRoutes,
  ...projectDetailRoutes,
  ...projectProposalRoutes,
  ...projectMilestonesRoute,
  ...createProjectRoute,
  ...commonProjectRoutes,
  ...projectExperienceRoutes
};

module.exports = routes;
