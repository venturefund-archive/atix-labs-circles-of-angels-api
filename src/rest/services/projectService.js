/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const mkdirp = require('mkdirp-promise');
const { promisify } = require('util');
const fs = require('fs');
const mime = require('mime');
const { projectStatus } = require('../util/constants');
const files = require('../util/files');

const MAX_PHOTO_SIZE = 500000;

const thumbnailType = 'thumbnail';
const coverPhotoType = 'coverPhoto';
const milestonesType = 'milestones';

const validateExistence = (dao, id, model) => {
  try {
    return dao.findById(id);
  } catch (error) {
    throw new Error(`Cant find ${model} with id ${id}`); // TODO throw COAError
  }
};

const saveProject = project => {
  const savedProject = this.projectDao.saveProject(project);
  if (!savedProject) throw new Error('Cant save project');
  return savedProject.id;
};

const updateProject = (projectId, fields) => {
  const updatedProject = this.projectDao.updateProject(fields, projectId);
  if (!updatedProject) throw new Error('Cant update project');
  return updatedProject.id;
};

const updateMilestone = (milestoneId, fields) => {
  const updatedMilestone = this.milestoneDao.updateMilestone(
    fields,
    milestoneId
  );
  if (!updatedMilestone) throw new Error('Cant update milestone');
  return updatedMilestone.id;
};

const validateParams = (...params) => {
  if (!params.reduce((prev, current) => prev && current, true))
    throw new Error('Params are not valid');
};

const imgValidator = file => {
  const fileType = mime.lookup(file.name);
  if (!fileType.includes('image/'))
    throw new Error('File type is not valid (img)'); // FIXME
};

const xslValidator = file => {
  const fileType = mime.lookup(file.name);
  if (
    !(
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  )
    throw new Error('File tpye is not valid (xls)'); // FIXME
};

const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xslValidator
};

const validateMtype = type => file => mtypesValidator[type](file);

const validatePhotoSize = file => {
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('Photo size is bigger than allowed'); // FIXME
  }
};

module.exports = {
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
    const user = await validateExistence(this.userDao, ownerId, 'user');
    console.log('user', user);
    // FIXME ROLE VALIDATION
    validateMtype(thumbnailType)(file);
    validatePhotoSize(file);

    const filePath = await files.saveFile(thumbnailType, { file });

    const project = {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      filePath,
      ownerId
    };

    return saveProject(project);
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
    const project = await validateExistence(this.projectDao, projectId, 'project');
    validateMtype(thumbnailType)(file);
    validatePhotoSize(file);

    const filePath = file ? await files.saveFile(file) : project.filePath;

    return updateProject(projectId, {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      filePath
    });
  },

  async getProjectThumbnail(projectId) {
    validateParams(projectId);
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      thumbnail
    } = await validateExistence(projectId);
    return {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      thumbnail
    };
  },

  async createProjectDetail({
    projectMission,
    theProblem,
    backgroundImg,
    ownerId
  }) {
    validateParams(projectMission, theProblem, backgroundImg, ownerId);
    await validateExistence(this.userDao, ownerId);
    validateMtype(coverPhotoType)(backgroundImg);
    validatePhotoSize(backgroundImg);

    const filePath = await files.saveFile(backgroundImg);

    const project = {
      projectMission,
      theProblem,
      filePath,
      ownerId
    };

    return saveProject(project);
  },

  async updateProjectDetail(
    projectId,
    { projectMission, theProblem, backgroundImg, ownerId }
  ) {
    validateParams(
      projectMission,
      theProblem,
      backgroundImg,
      ownerId,
      projectId
    );

    await validateExistence(this.userDao, ownerId);
    const project = await validateExistence(this.projectDao, projectId);
    validateMtype(coverPhotoType)(backgroundImg);
    validatePhotoSize(backgroundImg);

    const filePath = backgroundImg
      ? await files.saveFile(backgroundImg)
      : project.filePath;

    return updateProject(projectId, {
      projectMission,
      theProblem,
      filePath
    });
  },

  async getProjectDetail(projectId) {
    validateParams(projectId);
    const { projectMission, theProblem, backgroundImg } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );

    return { projectMission, theProblem, backgroundImg };
  },

  async createProjectProposal({ projectProposal, ownerId }) {
    validateParams(projectProposal, ownerId);

    await validateExistence(this.userDao, ownerId, 'user');

    const project = {
      projectProposal,
      ownerId
    };

    return saveProject(project);
  },

  async updateProjectProposal(projectId, { projectProposal, ownerId }) {
    validateParams(projectProposal, ownerId, projectId);
    await validateExistence(this.projectDao, projectId, 'project');

    return updateProject(projectId, { projectProposal });
  },

  async getProjectProposal(projectId) {
    validateParams(projectId);
    const { projectProposal } = await validateExistence(this.projectDao, projectId);

    return { projectProposal };
  },

  async deleteMilestoneOfProject(projectId, milestoneId) {
    validateParams(projectId, milestoneId);
    await validateExistence(this.milestoneId, milestoneId, 'milestone');
    const { milestones } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );

    return updateProject(
      projectId,
      milestones.filter(({ id }) => id !== milestoneId)
    );
  },

  async editTaskOfMilestone(milestoneId, taskId, taskParams) {}, // TODO

  async deleteTaskOfMilestone(milestoneId, taskId) {
    validateParams(milestoneId, taskId);
    const { tasks } = await validateExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );
    await validateExistence(this.taskDao, taskId, 'task');

    return updateMilestone(
      milestoneId,
      tasks.filter(({ id }) => taskId !== id)
    );
  },

  async uploadMilestoneFile(projectId, milestoneFile) {
    validateParams(projectId, milestoneFile);
    const project = await validateExistence(this.projectDao, projectId, 'project');
    if (project.milestone) throw Error();

    validateMtype(milestonesType)(milestoneFile);

    const milestonesFile = await files.saveFile(milestoneFile);

    return updateProject(projectId, milestonesFile);
  },

  // TODO
  async processMilestoneFile(projectId) {},

  async getProjectMilestones(projectId) {
    validateParams(projectId);
    const { milestones } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    return milestones;
  },

  async publishProject(projectId) {
    validateParams(projectId);
    const { status } = await validateExistence(this.projectDao, projectId, 'project');
    if (status !== projectStatus.EDITING) throw Error();
    return updateProject(projectId, { status: projectStatus.PENDING_APPROVAL });
  }
};
