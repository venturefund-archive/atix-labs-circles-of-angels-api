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
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');
const { projectStatuses } = require('../util/constants');
const { idParam } = require('../util/params');

const projectThumbnailProperties = {
  projectName: { type: 'string' },
  location: { type: 'string' },
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

const experienceProperties = {
  comment: { type: 'string' }
};

const milestonesResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      category: { type: 'string' },
      description: { type: 'string' },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
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

const projectIdParam = idParam('Project identification', 'projectId');

const successWithProjectIdResponse = {
  type: 'object',
  properties: {
    projectId: { type: 'integer' }
  },
  description: 'Returns the id of the project'
};

const successWithCandidateIdResponse = {
  type: 'object',
  properties: {
    candidateId: { type: 'integer' }
  },
  description: 'Returns the id of the project'
};

const successWithBooleanResponse = {
  type: 'boolean',
  description: 'Returns the boolean result'
};

// FIXME: I don't think this is the best way to do this but ¯\_(ツ)_/¯
const responseWithMilestoneErrors = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rowNumber: { type: 'number' },
          msg: { type: 'string' }
        }
      }
    },
    projectId: { type: 'integer' }
  },
  description:
    'Returns an array with all errors while processing the milestone file or the project id if successful'
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

const usersResponse = {
  type: 'object',
  properties: {
    owner: userResponse,
    followers: { type: 'array', items: userResponse },
    funders: { type: 'array', items: userResponse },
    oracles: { type: 'array', items: userResponse }
  }
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
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Updates the thumbnail of an existing draft project',
        summary: 'Updates an existing project thumbnail',
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
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets the thumbnail information of an existing project',
        summary: 'Gets a project thumbnail info',
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
            properties: projectDetailProperties
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
        description: 'Updates the detail of an existing project.',
        summary: 'Updates a project detail',
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
        description: 'Returns the detail of an existing project',
        summary: 'Get project detail',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              projectDetailProperties,
              imgPathProperty
            ),
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
  updateProjectProposal: {
    method: 'put',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description:
          'Adds or modifies the project proposal of an existing project.',
        summary: 'Adds or modifies project proposal',
        body: {
          type: 'object',
          properties: projectProposalProperties
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
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the project proposal of a project',
        summary: 'Gets project proposal',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: projectProposalProperties,
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
  processMilestonesFile: {
    method: 'put',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description:
          'Process excel file and creates the milestones of a project',
        summary: 'Creates milestones from file',
        type: 'multipart/form-data',
        raw: {
          type: 'object',
          properties: {
            files: { type: 'object' }
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(responseWithMilestoneErrors),
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
        description: 'Returns the milestones of an existing project',
        summary: 'Gets milestones of a project',
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
  getMilestonesFile: {
    method: 'get',
    path: `${basePath}/:projectId/milestonesFile`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: "Returns the specified project's milestones file",
        summary: 'Get a project milestones file',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to download the milestones file from'
            }
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getMilestonesFile
  }
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
    path: `${basePath}/:projectId`,
    handler: handlers.getProject,
    options: {
      beforeHandler: []
    }
  },

  getProjectFull: {
    method: 'get',
    path: `${basePath}/:projectId/full`,
    handler: handlers.getProjectFull,
    options: {
      beforeHandler: []
    }
  },

  getPublicProjects: {
    method: 'get',
    path: `${basePath}/public`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Get all public projects.',
        summary: 'Get all public project',
        response: {
          ...successResponse(projectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getPublicProjects
  },

  updateProjectStatus: {
    method: 'put',
    path: `${basePath}/:projectId/status`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Update project status',
        summary: 'Update project status',
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: Object.values(projectStatuses)
            }
          },
          required: ['status'],
          description: 'New project status'
        },
        type: 'object',
        params: projectIdParam,
        response: {
          // TODO send project updated to update on front too
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectStatus
  },

  getProjectUsers: {
    method: 'get',
    path: `${basePath}/:projectId/users`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the users related to an existing project',
        summary: 'Gets users of a project',
        params: projectIdParam,
        response: {
          ...successResponse(usersResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectUsers
  },

  followProject: {
    method: 'post',
    path: `${basePath}/:projectId/follow`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Follow project',
        summary: 'Follow project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.followProject
  },

  unfollowProject: {
    method: 'post',
    path: `${basePath}/:projectId/unfollow`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Unfollow project',
        summary: 'Unfollow project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.unfollowProject
  },

  isFollower: {
    method: 'get',
    path: `${basePath}/:projectId/follower`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Analize if user is following the project',
        summary: 'Check project following',
        params: projectIdParam,
        response: {
          ...successResponse(successWithBooleanResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.isFollower
  },

  applyAsOracle: {
    method: 'post',
    path: `${basePath}/:projectId/oracle`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Apply as a possible oracle for a project',
        summary: 'Apply as oracle',
        params: projectIdParam,
        response: {
          ...successResponse(successWithCandidateIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.applyAsOracle
  },

  applyAsFunder: {
    method: 'post',
    path: `${basePath}/:projectId/funder`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Apply as a possible funder for a project',
        summary: 'Apply as funder',
        params: projectIdParam,
        response: {
          ...successResponse(successWithCandidateIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.applyAsFunder
  },

  isCandidate: {
    method: 'get',
    path: `${basePath}/:projectId/candidate`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Analize if user already applied to the project',
        summary: 'Check project applying',
        params: projectIdParam,
        response: {
          ...successResponse(successWithBooleanResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.isCandidate
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
