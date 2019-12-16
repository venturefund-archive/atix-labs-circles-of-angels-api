/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { projectStatusType } = require('../util/constants');
const files = require('../util/files');
const {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize
} = require('./helpers/projectServiceHelper');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');

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
    if (!updatedProject)
      throw new COAError(errors.CantUpdateProject(projectId));
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
    if (!savedProject) throw new COAError(errors.CantSaveProject);
    return savedProject.id;
  },
  validateOwnership(realOwnerId, userId) {
    if (realOwnerId !== userId)
      throw new COAError(errors.UserIsNotOwnerOfProject);
  },
  async createProjectThumbnail({
    projectName,
    countryOfImpact,
    timeframe,
    goalAmount,
    ownerId,
    file
  }) {
    validateParams(
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      ownerId,
      file
    );
    await validateExistence(this.userDao, ownerId, 'user');
    validateMtype(thumbnailType)(file);
    validatePhotoSize(file);

    const cardPhotoPath = await files.saveFile(thumbnailType, file);

    const project = {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      cardPhotoPath,
      ownerId
    };

    return { projectId: await this.saveProject(project) };
  },

  async updateProjectThumbnail(
    projectId,
    { projectName, countryOfImpact, timeframe, goalAmount, ownerId, file }
  ) {
    validateParams(
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      ownerId,
      projectId
    );
    await validateExistence(this.userDao, ownerId, 'user');
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    this.validateOwnership(project.ownerId, ownerId);
    if (file) {
      validateMtype(thumbnailType)(file);
      validatePhotoSize(file);
    }

    const cardPhotoPath = file
      ? await files.saveFile(thumbnailType, file)
      : project.filePath;

    return {
      projectId: await this.updateProject(projectId, {
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        cardPhotoPath
      })
    };
  },

  async getProjectThumbnail(projectId) {
    validateParams(projectId);
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      cardPhotoPath
    } = await validateExistence(this.projectDao, projectId, 'project');
    return {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      imgPath: cardPhotoPath
    };
  },

  async createProjectDetail(
    projectId,
    { projectMission, theProblem, file, ownerId }
  ) {
    validateParams(projectMission, theProblem, file, ownerId, projectId);
    await validateExistence(this.userDao, ownerId, 'user');
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    validateMtype(coverPhotoType)(file);
    validatePhotoSize(file);
    this.validateOwnership(project.ownerId, ownerId);

    const filePath = await files.saveFile(coverPhotoType, file);

    return {
      projectId: await this.updateProject(projectId, {
        mission: projectMission,
        problemAddressed: theProblem,
        coverPhotoPath: filePath
      })
    };
  },

  async updateProjectDetail(
    projectId,
    { projectMission, theProblem, file, ownerId }
  ) {
    validateParams(projectMission, theProblem, ownerId, projectId);

    await validateExistence(this.userDao, ownerId);
    const project = await validateExistence(this.projectDao, projectId);
    this.validateOwnership(project.ownerId, ownerId);
    if (file) {
      validateMtype(coverPhotoType)(file);
      validatePhotoSize(file);
    }
    const filePath = file
      ? await files.saveFile(coverPhotoType, file)
      : project.filePath;

    return {
      projectId: await this.updateProject(projectId, {
        mission: projectMission,
        problemAddressed: theProblem,
        coverPhotoPath: filePath
      })
    };
  },

  async getProjectDetail(projectId) {
    validateParams(projectId);
    const {
      mission,
      problemAddressed,
      coverPhotoPath
    } = await validateExistence(this.projectDao, projectId, 'project');
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
    this.validateOwnership(project.ownerId, ownerId);

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
    this.validateOwnership(project.ownerId, ownerId);

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

    this.validateOwnership(project.ownerId, ownerId);

    validateMtype(milestonesType)(file);

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
    if (project.status !== projectStatusType.DRAFT)
      throw new COAError(errors.InvalidStatusForMilestoneFileProcess);
    this.validateOwnership(project.ownerId, ownerId);
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

  async publishProject(projectId, { ownerId }) {
    validateParams(projectId, ownerId);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    this.validateOwnership(project.ownerId, ownerId);
    if (project.status !== projectStatusType.DRAFT) {
      throw new COAError(errors.ProjectIsNotPublishable);
    }
    return {
      projectId: await this.updateProject(projectId, {
        status: projectStatusType.PENDING_APPROVAL
      })
    };
  },

  async getProjects() {
    return this.projectDao.findAllByProps();
  },

  async getProject(id) {
    const project = await this.projectDao.findById(id);
    return project;
  },

  async getProjectFull(id) {
    const project = await this.getProject(id);
    project.milestones = await this.milestoneService.getMilestonesByProject(id);
    return project;
  }
};
