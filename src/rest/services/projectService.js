/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const path = require('path');
const { uniqWith } = require('lodash');
const {
  projectStatuses,
  userRoles,
  supporterRoles,
  publicProjectStatuses,
  txFunderStatus
} = require('../util/constants');
const files = require('../util/files');
const {
  validateExistence,
  validateParams
} = require('./helpers/projectServiceHelper');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const validateOwnership = require('./helpers/validateOwnership');
const validateProjectStatusChange = require('./helpers/validateProjectStatusChange');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

const thumbnailType = 'thumbnail';
const coverPhotoType = 'coverPhoto';
const milestonesType = 'milestones';

// TODO: replace with actual function
const sha3 = (a, b, c) => `${a}-${b}-${c}`;

module.exports = {
  async getProjectById(id) {
    logger.info('[ProjectService] :: Entering getProjectById method');
    const project = await checkExistence(this.projectDao, id, 'project');
    logger.info(`[ProjectService] :: Project id ${project.id} found`);
    return project;
  },

  async updateProject(projectId, fields) {
    // TODO updateProject = updateMilestone, is should abstract this like validateExistence, also change tests
    const updatedProject = await this.projectDao.updateProject(
      fields,
      projectId
    );
    if (!updatedProject) {
      logger.error('[ProjectService] :: Error updating project in DB');
      throw new COAError(errors.project.CantUpdateProject(projectId));
    }
    return updatedProject.id;
  },

  async saveProject(project) {
    const savedProject = await this.projectDao.saveProject(project);
    if (!savedProject) {
      logger.error('[ProjectService] :: Error saving project in DB');
      throw new COAError(errors.project.CantSaveProject);
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
    const user = await this.userService.getUserById(ownerId);

    if (user.role !== userRoles.ENTREPRENEUR) {
      logger.error(
        `[ProjectService] :: User ${user.id} is not ${userRoles.ENTREPRENEUR}`
      );
      throw new COAError(errors.user.UnauthorizedUserRole(user.role));
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
    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    const { status } = project;
    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
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

    await this.userService.getUserById(ownerId);
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

    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    if (file) {
      validateMtype(coverPhotoType, file);
      validatePhotoSize(file);
    }

    const { status } = project;
    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
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

  async updateProjectProposal(projectId, { proposal, ownerId }) {
    logger.info('[ProjectService] :: Entering updateProjectProposal method');
    validateRequiredParams({
      method: 'updateProjectProposal',
      params: { projectId, proposal, ownerId }
    });

    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    const { owner, status } = project;
    validateOwnership(owner, ownerId);

    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
    }

    logger.info(
      `[ProjectService] :: Saving proposal for project id ${projectId}`
    );
    const updatedProjectId = await this.updateProject(projectId, { proposal });
    logger.info(
      `[ProjectService] :: Proposal saved for project id ${updatedProjectId}`
    );
    return { projectId: updatedProjectId };
  },

  async getProjectProposal(projectId) {
    logger.info('[ProjectService] :: Entering getProjectProposal method');
    validateRequiredParams({
      method: 'getProjectProposal',
      params: { projectId }
    });
    const { proposal } = await checkExistence(
      this.projectDao,
      projectId,
      'project'
    );
    return { proposal };
  },

  async processMilestoneFile(projectId, { file, ownerId }) {
    logger.info('[ProjectService] :: Entering processMilestoneFile method');
    validateRequiredParams({
      method: 'processMilestoneFile',
      params: { projectId, ownerId, file }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');

    validateOwnership(project.owner, ownerId);
    // should we validate file size?
    validateMtype(milestonesType, file);

    const { status } = project;
    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(
        errors.project.InvalidStatusForMilestoneFileProcess(status)
      );
    }

    // TODO?: in this case it should probably overwrite all milestones and file
    if (project.milestonePath)
      throw new COAError(errors.project.MilestoneFileHasBeenAlreadyUploaded);

    const milestones = await this.milestoneService.createMilestones(
      file,
      projectId
    );

    if (milestones.errors) {
      logger.info(
        '[ProjectService] :: Found errors while processing milestone file',
        milestones.errors
      );
      return {
        errors: milestones.errors
      };
    }

    logger.info(`[ProjectService] :: Saving file of type '${milestonesType}'`);
    const milestonePath = await files.saveFile(milestonesType, file);
    logger.info(`[ProjectService] :: File saved to: ${milestonePath}`);

    const savedProjectId = await this.updateProject(projectId, {
      milestonePath
    });
    logger.info(
      `[ProjectService] :: Milestones of project ${savedProjectId} saved`
    );
    return { projectId: savedProjectId };
  },

  async getProjectMilestones(projectId) {
    logger.info('[ProjectService] :: Entering getProjectMilestones method');
    validateRequiredParams({
      method: 'getProjectMilestones',
      params: { projectId }
    });
    await checkExistence(this.projectDao, projectId, 'project');
    return this.milestoneService.getAllMilestonesByProject(projectId);
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
      throw new COAError(
        errors.project.ProjectDoesntHaveMilestonesFile(projectId)
      );

    const { milestonePath } = milestonesFilePath;
    logger.info('[Project Routes] :: MilestonesFilePath: ', milestonesFilePath);

    const milestonesFileExists = await files.fileExists(milestonePath);

    if (!milestonesFileExists)
      throw new COAError(
        errors.project.MilestonesFileNotFound(projectId, milestonePath)
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

  /**
   * Updates the status of a project to the specified status
   * if the transition is valid.
   * Returns the id of the updated project
   *
   * @param {*} user user requesting the change
   * @param {number} projectId project to update
   * @param {string} newStatus new project status
   */
  async updateProjectStatus(user, projectId, newStatus) {
    logger.info('[ProjectService] :: Entering updateProjectStatus method');
    validateRequiredParams({
      method: 'updateProjectStatus',
      params: { projectId, user, newStatus }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');
    logger.info(
      `[Project Service] :: Updating project ${projectId} from ${
        project.status
      } to ${newStatus}`
    );

    await validateProjectStatusChange({
      user,
      newStatus,
      project
    });

    const updatedProjectId = await this.updateProject(projectId, {
      status: newStatus
    });
    return { projectId: updatedProjectId };
  },

  async getProject(id) {
    const project = await this.projectDao.findById(id);
    return project;
  },

  // TODO: check if this is being used. If not, remove.
  async getProjectFull(id) {
    const project = await this.getProject(id);
    project.milestones = await this.milestoneService.getAllMilestonesByProject(
      id
    );
    return project;
  },

  async getPublicProjects() {
    // TODO: implement pagination
    logger.info('[ProjectService] :: Entering getPublicProjects method');
    return this.projectDao.findAllByProps({
      status: { in: Object.values(publicProjectStatuses) }
    });
  },

  async getProjects() {
    // TODO: implement pagination
    logger.info('Getting all the projects.');
    return this.projectDao.findAllByProps({ sort: 'id DESC' }, { owner: true });
  },

  /**
   * Returns the projects that belong to the specified user
   *
   * @param {number} ownerId
   * @returns {object[]} array of projects
   */
  async getProjectsByOwner(ownerId) {
    // TODO: implement pagination
    logger.info('[ProjectService] :: Entering getProjectsByOwner method');
    return this.projectDao.findAllByProps({ owner: ownerId });
  },

  /**
   * Returns a JSON object containing the description and
   * information of milestones, tasks and funders of a project
   *
   * @param {number} projectId
   * @returns {Promise<string>} agreement in JSON format
   */
  async generateProjectAgreement(projectId) {
    logger.info('[ProjectService] :: Entering generateProjectAgreement method');
    logger.info(`[ProjectService] :: Looking up project of id ${projectId}`);
    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { owner: true }
    );
    if (!project) {
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const milestonesWithTasks = await this.milestoneService.getAllMilestonesByProject(
      projectId
    );

    const milestones = milestonesWithTasks.map(milestone => {
      const { description } = milestone;
      const goal = milestone.tasks.reduce(
        (total, task) => total + Number(task.budget),
        0
      );
      const tasks = milestone.tasks.map(task => ({
        // TODO: define task fields
        id: sha3(projectId, task.oracle, task.id),
        oracle: task.oracle,
        description: task.description,
        reviewCriteria: task.reviewCriteria,
        category: task.category,
        keyPersonnel: task.keyPersonnel
      }));

      return {
        description,
        goal,
        tasks
      };
    });

    const transfersWithSender = await this.transferService.getAllTransfersByProps(
      {
        filters: { project: projectId, status: txFunderStatus.VERIFIED },
        populate: { sender: true }
      }
    );
    const funders = uniqWith(
      transfersWithSender.map(transfer => transfer.sender),
      (a, b) => a.id === b.id
    ).map(funder => ({
      // TODO: define funder fields
      firstName: funder.firstName,
      lastName: funder.lastName,
      email: funder.email,
      address: funder.address
    }));

    const projectOwner = {
      firstName: project.owner.firstName,
      lastName: project.owner.lastName,
      email: project.owner.email,
      address: project.owner.address
    };

    // TODO: define project fields
    const agreement = {
      name: project.projectName,
      mission: project.mission,
      problem: project.problemAddressed,
      owner: projectOwner,
      milestones,
      funders
    };

    const agreementJson = JSON.stringify(agreement, undefined, 2);
    return agreementJson;
  },

  /**
   * Returns an object with all users related to the project
   * (Owner, followers, funders, oracles)
   * @param {number} projectId
   * @returns {{owner: User, followers: User[], funders: User[], oracles: User[]}}
   */
  async getProjectUsers(projectId) {
    logger.info('[ProjectService] :: Entering getProjectUsers method');
    validateRequiredParams({
      method: 'getProjectUsers',
      params: { projectId }
    });

    const projectWithUsers = await this.projectDao.findProjectWithUsersById(
      projectId
    );

    if (!projectWithUsers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    return {
      owner: projectWithUsers.owner,
      followers: projectWithUsers.followers || [],
      funders: projectWithUsers.funders || [],
      oracles: projectWithUsers.oracles || []
    };
  },

  /**
   * Following of a project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns projectId || error
   */
  async followProject({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering followProject method');
    validateRequiredParams({
      method: 'followProject',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status, followers } = projectWithFollowers;

    const allowFollow = Object.values(publicProjectStatuses).includes(status);

    if (!allowFollow) {
      logger.error(
        `[ProjectService] :: Project ${projectId} has't been published yet`
      );
      throw new COAError(errors.project.CantFollowProject(projectId));
    }

    const alreadyFollowing = followers.some(follower => follower.id === userId);

    if (alreadyFollowing) {
      logger.error('[ProjectService] :: User already  follow this project');
      throw new COAError(errors.project.AlreadyProjectFollower());
    }

    const followerCreated = await this.followerDao.saveFollower({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} following project ${projectId}`
    );

    return { projectId: followerCreated.projectId };
  },

  /**
   * Unfollowing of a project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns projectId || error
   */
  async unfollowProject({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering unfollowProject method');
    validateRequiredParams({
      method: 'unfollowProject',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status, followers } = projectWithFollowers;

    const allowUnfollow = Object.values(publicProjectStatuses).includes(status);

    if (!allowUnfollow) {
      logger.error(
        `[ProjectService] :: Project ${projectId} has't been published yet`
      );
      throw new COAError(errors.project.CantFollowProject(projectId));
    }

    const isFollowing = followers.some(follower => follower.id === userId);

    if (!isFollowing) {
      logger.error('[ProjectService] :: User is not following this project');
      throw new COAError(errors.project.IsNotFollower());
    }

    const followerDeleted = await this.followerDao.deleteFollower({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} unfollowed project ${projectId}`
    );

    return { projectId: followerDeleted.projectId };
  },

  /**
   * Check if user is following the specific project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isFollower({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering isFollower method');
    validateRequiredParams({
      method: 'isFollower',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { followers } = projectWithFollowers;

    const isFollowing = followers.some(follower => follower.id === userId);

    return isFollowing;
  },

  /**
   * Apply to a project as FUNDER or ORACLE
   *
   * @param {number} projectId
   * @param {number} userId
   * @param {string} role
   * @returns projectId || error
   */
  async applyToProject({ projectId, userId, role }) {
    logger.info('[ProjectService] :: Entering applyToProject method');
    validateRequiredParams({
      method: 'applyToProject',
      params: { projectId, userId, role }
    });

    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true, funders: true }
    );

    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status } = project;
    const { PUBLISHED, CONSENSUS } = projectStatuses;
    if (status !== PUBLISHED && status !== CONSENSUS) {
      logger.error(
        `[ProjectService] :: It doesn't allow apply when the project is in ${status} status`
      );
      throw new COAError(errors.project.CantApplyToProject(status));
    }

    const user = await this.userService.getUserById(userId);

    if (user.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(`[ProjectService] :: User ${userId} is not supporter`);
      throw new COAError(errors.user.UnauthorizedUserRole(user.role));
    }

    const alreadyApply = Object.values(supporterRoles).some(collection =>
      project[collection].some(participant => participant.id === userId)
    );

    if (alreadyApply) {
      logger.error('[ProjectService] :: User already apply to this project');
      throw new COAError(errors.project.AlreadyApplyToProject());
    }

    const dao =
      role === supporterRoles.ORACLES ? this.oracleDao : this.funderDao;

    const candidateAdded = await dao.addCandidate({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} apply to ${role} into project ${projectId}`
    );

    return { candidateId: candidateAdded.id };
  },

  /**
   * Check if user already applied to the specific project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isCandidate({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering isCandidate method');
    validateRequiredParams({
      method: 'isCandidate',
      params: { projectId, userId }
    });

    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true, funders: true }
    );

    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const alreadyApply = Object.values(supporterRoles).some(collection =>
      project[collection].some(participant => participant.id === userId)
    );

    return alreadyApply;
  },

  /**
   * Check if user applied to the specific project as oracle
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isOracleCandidate({ projectId, userId }) {
    // TODO: maybe somehow fuse this method with isCandidate?
    logger.info('[ProjectService] :: Entering isOracleCandidate method');
    validateRequiredParams({
      method: 'isOracleCandidate',
      params: { projectId, userId }
    });
    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true }
    );
    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }
    const isOracle = !!project.oracles.find(oracle => oracle.id === userId);
    return isOracle;
  },

  /**
   * Returns a list of all projects marked as featured
   * @returns {Promise<[]>} featured projects
   */
  async getFeaturedProjects() {
    logger.info('[ProjectService] :: Entering getFeaturedProjects method');
    // TODO: this should be changed to get all projects in project table marked as featured
    const featuredProjects = await this.featuredProjectDao.findAllByProps(
      undefined,
      { project: true }
    );
    return featuredProjects.map(project => project.project);
  }
};
