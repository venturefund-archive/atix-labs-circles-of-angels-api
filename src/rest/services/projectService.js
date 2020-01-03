/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const path = require('path');
const { projectStatuses, userRoles } = require('../util/constants');
const files = require('../util/files');
const {
  validateExistence,
  validateParams,
  validateOwnership,
  validateStatusChange
} = require('./helpers/projectServiceHelper');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

const thumbnailType = 'thumbnail';
const coverPhotoType = 'coverPhoto';
const milestonesType = 'milestones';

module.exports = {
  async updateProject(projectId, fields) {
    // TODO updateProject = updateMilestone, is should abstract this like validateExistence, also change tests
    const updatedProject = await this.projectDao.updateProject(
      fields,
      projectId
    );
    if (!updatedProject) {
      logger.error('[ProjectService] :: Error updating project in DB');
      throw new COAError(errors.CantUpdateProject(projectId));
    }
    return updatedProject.id;
  },

  async updateMilestone(milestoneId, fields) {
    const updatedMilestone = await this.milestoneDao.updateMilestone(
      fields,
      milestoneId
    );
    if (!updatedMilestone)
      throw new COAError(errors.CantUpdateMilestone(milestoneId));
    return updatedMilestone.id;
  },

  async saveProject(project) {
    const savedProject = await this.projectDao.saveProject(project);
    if (!savedProject) {
      logger.error('[ProjectService] :: Error saving project in DB');
      throw new COAError(errors.CantSaveProject);
    }
    return savedProject.id;
  },

  async createProjectThumbnail({
    projectName,
    location,
    timeframe,
    goalAmount,
    ownerId,
    file
  }) {
    logger.info('[ProjectService] :: Entering createProjectThumbnail method');
    validateRequiredParams({
      method: 'createProjectThumbnail',
      params: { projectName, location, timeframe, goalAmount, ownerId, file }
    });
    const user = await checkExistence(this.userDao, ownerId, 'user');

    if (user.role !== userRoles.ENTREPRENEUR) {
      logger.error(
        `[ProjectService] :: User ${user.id} is not ${userRoles.ENTREPRENEUR}`
      );
      throw new COAError(errors.UnauthorizedUserRole(user.role));
    }

    validateMtype(thumbnailType, file);
    validatePhotoSize(file);

    logger.info(`[ProjectService] :: Saving file of type '${thumbnailType}'`);
    const cardPhotoPath = await files.saveFile(thumbnailType, file);
    logger.info(`[ProjectService] :: File saved to: ${cardPhotoPath}`);

    const project = {
      projectName,
      location,
      timeframe,
      goalAmount,
      cardPhotoPath,
      owner: ownerId
    };

    logger.info(
      `[ProjectService] :: Saving project ${projectName} description`
    );
    const projectId = await this.saveProject(project);

    logger.info(`[ProjectService] :: New project created with id ${projectId}`);

    return { projectId };
  },

  async updateProjectThumbnail(
    projectId,
    { projectName, location, timeframe, goalAmount, ownerId, file }
  ) {
    logger.info('[ProjectService] :: Entering updateProjectThumbnail method');
    validateRequiredParams({
      method: 'createProjectThumbnail',
      params: { ownerId }
    });
    await checkExistence(this.userDao, ownerId, 'user');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    if (project.status !== projectStatuses.NEW) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not ${
          projectStatuses.NEW
        }`
      );
      throw new COAError(errors.ProjectCantBeUpdated);
    }

    let { cardPhotoPath } = project;

    if (file) {
      validateMtype(thumbnailType, file);
      validatePhotoSize(file);
      logger.info(`[ProjectService] :: Saving file of type '${thumbnailType}'`);
      cardPhotoPath = await files.saveFile(thumbnailType, file);
      logger.info(`[ProjectService] :: File saved to: ${cardPhotoPath}`);
    }

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const updatedProjectId = await this.updateProject(projectId, {
      projectName,
      location,
      timeframe,
      goalAmount,
      cardPhotoPath
    });
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);

    return { projectId: updatedProjectId };
  },

  async getProjectThumbnail(projectId) {
    logger.info('[ProjectService] :: Entering getProjectThumbnail method');
    validateParams(projectId);
    const {
      projectName,
      location,
      timeframe,
      goalAmount,
      cardPhotoPath
    } = await validateExistence(this.projectDao, projectId, 'project');
    logger.info(`[ProjectService] :: Project of id ${projectId} found`);
    return {
      projectName,
      location,
      timeframe,
      goalAmount,
      imgPath: cardPhotoPath
    };
  },

  async createProjectDetail(
    projectId,
    { mission, problemAddressed, file, ownerId }
  ) {
    logger.info('[ProjectService] :: Entering createProjectDetail method');
    validateRequiredParams({
      method: 'createProjectDetail',
      params: { mission, problemAddressed, file, ownerId, projectId }
    });

    await checkExistence(this.userDao, ownerId, 'user');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    validateMtype(coverPhotoType, file);
    validatePhotoSize(file);

    logger.info(`[ProjectService] :: Saving file of type '${coverPhotoType}'`);
    const coverPhotoPath = await files.saveFile(coverPhotoType, file);
    logger.info(`[ProjectService] :: File saved to: ${coverPhotoPath}`);

    const projectDetail = {
      mission,
      problemAddressed,
      coverPhotoPath
    };

    logger.info(
      `[ProjectService] :: Saving detail for project id ${projectId}`
    );
    const updatedProject = await this.updateProject(projectId, projectDetail);

    logger.info(
      `[ProjectService] :: New project created with id ${updatedProject}`
    );

    return {
      projectId: updatedProject
    };
  },

  async updateProjectDetail(
    projectId,
    { mission, problemAddressed, file, ownerId }
  ) {
    logger.info('[ProjectService] :: Entering updateProjectDetail method');
    validateRequiredParams({
      method: 'updateProjectDetail',
      params: { ownerId }
    });

    await checkExistence(this.userDao, ownerId, 'user');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    if (file) {
      validateMtype(coverPhotoType, file);
      validatePhotoSize(file);
    }

    if (project.status !== projectStatuses.NEW) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not ${
          projectStatuses.NEW
        }`
      );
      throw new COAError(errors.ProjectCantBeUpdated);
    }

    let { coverPhotoPath } = project;

    if (file) {
      validateMtype(coverPhotoType, file);
      validatePhotoSize(file);
      logger.info(
        `[ProjectService] :: Saving file of type '${coverPhotoType}'`
      );
      coverPhotoPath = await files.saveFile(coverPhotoType, file);
      logger.info(`[ProjectService] :: File saved to: ${coverPhotoPath}`);
    }

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const updatedProjectId = await this.updateProject(projectId, {
      mission,
      problemAddressed,
      coverPhotoPath
    });
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);
    return { projectId: updatedProjectId };
  },

  async getProjectDetail(projectId) {
    logger.info('[ProjectService] :: Entering getProjectDetail method');
    validateRequiredParams({
      method: 'getProjectDetail',
      params: { projectId }
    });
    const {
      mission,
      problemAddressed,
      coverPhotoPath
    } = await validateExistence(this.projectDao, projectId, 'project');
    logger.info(`[ProjectService] :: Project of id ${projectId} found`);
    return { mission, problemAddressed, imgPath: coverPhotoPath };
  },

  async createProjectProposal(projectId, { projectProposal, ownerId }) {
    validateParams(projectId, projectProposal, ownerId);

    await validateExistence(this.userDao, ownerId, 'user');
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    validateOwnership(project.owner, ownerId);

    return {
      projectId: await this.updateProject(projectId, {
        proposal: projectProposal
      })
    };
  },

  async updateProjectProposal(projectId, { projectProposal, ownerId }) {
    validateParams(projectProposal, ownerId, projectId);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    await validateExistence(this.userDao, ownerId, 'user');
    validateOwnership(project.owner, ownerId);

    return {
      projectId: await this.updateProject(projectId, {
        proposal: projectProposal
      })
    };
  },

  async getProjectProposal(projectId) {
    validateParams(projectId);
    const { proposal } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    return { proposal };
  },

  filterMilestones(milestones, milestoneIdToFilter) {
    const filteredMilestones = milestones.filter(
      ({ id }) => id !== milestoneIdToFilter
    );
    if (filteredMilestones.length === milestones.length) {
      throw new COAError(errors.MilestoneDoesNotBelongToProject);
    }
    return filteredMilestones;
  },

  async deleteMilestoneOfProject(projectId, milestoneId) {
    //FIXME ADD OWNER VALIDATION
    validateParams(projectId, milestoneId);
    await validateExistence(this.milestoneDao, milestoneId, 'milestone');
    const { milestones } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    return {
      projectId: await this.updateProject(projectId, {
        milestones: this.filterMilestones(milestones, milestoneId)
      })
    };
  },

  async editTaskOfMilestone(milestoneId, taskId, taskParams) {}, // TODO

  async deleteTaskOfMilestone({ milestoneId, taskId }) {
    // TODO shouldnt this belong to milestoneService?
    // FIXME ADD OWNER VALIDATION
    validateParams(milestoneId, taskId);
    const { tasks } = await validateExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );
    await validateExistence(this.activityDao, taskId, 'task');

    return {
      milestoneId: this.updateMilestone(
        milestoneId,
        tasks.filter(({ id }) => taskId !== id)
      )
    };
  },

  async uploadMilestoneFile(projectId, { file, ownerId }) {
    validateParams(projectId, file, ownerId);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    if (project.milestonePath)
      throw new COAError(errors.MilestoneFileHasBeenAlreadyUploaded);

    validateOwnership(project.owner, ownerId);

    validateMtype(milestonesType, file);

    const milestonePath = await files.saveFile(milestonesType, file);

    return {
      projectId: await this.updateProject(projectId, { milestonePath })
    };
  },

  async processMilestoneFile(projectId, { ownerId }) {
    validateParams(projectId, ownerId);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    if (project.status !== projectStatuses.NEW)
      throw new COAError(errors.InvalidStatusForMilestoneFileProcess);
    validateOwnership(project.owner, ownerId);
    const milestones = (await this.milestoneService.createMilestones(
      project.milestonePath,
      projectId
    )).map(({ id }) => id);
    return { projectId: await this.updateProject(projectId, { milestones }) };
  },

  async getProjectMilestones(projectId) {
    validateParams(projectId);
    await validateExistence(this.projectDao, projectId, 'project');
    return this.milestoneDao.getMilestoneByProjectId(projectId);
  },

  async getProjectMilestonesPath(projectId) {
    validateParams(projectId);
    await validateExistence(this.projectDao, projectId, 'project');

    logger.info(
      `[Project Routes] :: Getting milestones file of project ${projectId}`
    );

    const milestonesFilePath = await this.projectDao.getProjectMilestonesFilePath(
      projectId
    );

    if (!milestonesFilePath)
      throw new COAError(errors.ProjectDoesntHaveMilestonesFile(projectId));

    const { milestonePath } = milestonesFilePath;
    logger.info('[Project Routes] :: MilestonesFilePath: ', milestonesFilePath);

    const milestonesFileExists = await files.fileExists(milestonePath);

    if (!milestonesFileExists)
      throw new COAError(
        errors.MilestonesFileNotFound(projectId, milestonePath)
      );

    const response = {
      filename: path.basename(milestonePath),
      filepath: milestonePath
    };

    logger.info(
      `[Project Routes] :: Milestones file of project ${projectId} got successfully`
    );

    return response;
  },

  // TODO analize if this method will be useful
  async publishProject(projectId, { ownerId }) {
    validateParams(projectId, ownerId);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    validateOwnership(project.owner, ownerId);
    if (project.status !== projectStatuses.NEW) {
      throw new COAError(errors.ProjectIsNotPublishable);
    }
    return {
      projectId: await this.updateProject(projectId, {
        status: projectStatuses.TO_REVIEW
      })
    };
  },

  async updateProjectStatus(user, projectId, newStatus) {
    validateParams(projectId, user);

    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );

    const { status: currentStatus, owner } = project;

    logger.info(
      `[Project Service] :: Updating project ${projectId} from ${currentStatus} to ${newStatus}`
    );

    if (
      !validateStatusChange({
        user,
        currentStatus,
        newStatus,
        projectOwner: owner
      })
    ) {
      logger.error(
        '[Project Service] :: Project status transition is not valid'
      );
      throw new COAError(errors.InvalidProjectTransition);
    }

    return {
      projectId: await this.updateProject(projectId, { status: newStatus })
    };
  },

  async getProject(id) {
    const project = await this.projectDao.findById(id);
    return project;
  },

  async getProjectFull(id) {
    const project = await this.getProject(id);
    project.milestones = await this.milestoneService.getMilestonesByProject(id);
    return project;
  },

  async getProjects() {
    logger.info('Getting all the projects.');
    return this.projectDao.findAllByProps();
  }
};
