/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const mime = require('mime');
const { projectStatus } = require('../util/constants');
const files = require('../util/files');

const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');

const MAX_PHOTO_SIZE = 500000;

const thumbnailType = 'thumbnail';
const coverPhotoType = 'coverPhoto';
const milestonesType = 'milestones';

const validateExistence = (dao, id, model) => {
  try {
    return dao.findById(id);
  } catch (error) {
    throw new COAError(`Cant find ${model} with id ${id}`);
  }
};

const validateParams = (...params) => {
  if (!params.reduce((prev, current) => prev && current, true))
    throw new COAError(errors.CreateProjectFieldsNotValid);
};

const imgValidator = file => {
  const fileType = mime.lookup(file.name);
  if (!fileType.includes('image/'))
    throw new COAError(errors.ImgFileTyPeNotValid);
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
    throw new COAError(errors.MilestoneFileTypeNotValid);
};

const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xslValidator
};

const validateMtype = type => file => mtypesValidator[type](file);

const validatePhotoSize = file => {
  if (file.size > MAX_PHOTO_SIZE) {
    throw new COAError(errors.ImgSizeBiggerThanAllowed);
  }
};

module.exports = {
  async updateProject(projectId, fields) {
    const updatedProject = await this.projectDao.updateProject(
      fields,
      projectId
    );
    if (!updatedProject)
      throw new COAError(`Cant update project with id ${projectId}`);
    return updatedProject.id;
  },
  async updateMilestone(milestoneId, fields) {
    const updatedMilestone = await this.milestoneDao.updateMilestone(
      fields,
      milestoneId
    );
    if (!updatedMilestone)
      throw new COAError(`Cant update milestone with id ${milestoneId}`);
    return updatedMilestone.id;
  },
  async saveProject(project) {
    const savedProject = await this.projectDao.saveProject(project);
    if (!savedProject) throw new COAError(errors.CantSaveProject);
    return savedProject.id;
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
    const user = await validateExistence(this.userDao, ownerId, 'user');
    // TODO ROLE VALIDATION
    validateMtype(thumbnailType)(file);
    validatePhotoSize(file);

    const cardPhotoPath = await files.saveFile(thumbnailType, { file });

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
    validateMtype(thumbnailType)(file);
    validatePhotoSize(file);

    const cardPhotoPath = file ? await files.saveFile(file) : project.filePath;

    return {
      projectId: await this.updateProject(projectId, {
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        imgPath: cardPhotoPath
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

  async createProjectDetail({ projectMission, theProblem, file, ownerId }) {
    validateParams(projectMission, theProblem, file, ownerId);
    await validateExistence(this.userDao, ownerId);
    validateMtype(coverPhotoType)(file);
    validatePhotoSize(file);

    const filePath = await files.saveFile(coverPhotoType, { file });

    const project = {
      mission: projectMission,
      problemAddressed: theProblem,
      filePath,
      ownerId
    };

    return { projectId: await this.saveProject(project) };
  },

  async updateProjectDetail(
    projectId,
    { projectMission, theProblem, file, ownerId }
  ) {
    validateParams(projectMission, theProblem, ownerId, projectId);

    await validateExistence(this.userDao, ownerId);
    const project = await validateExistence(this.projectDao, projectId);
    validateMtype(coverPhotoType)(file);
    validatePhotoSize(file);

    const filePath = file
      ? await files.saveFile(coverPhotoType, { file })
      : project.filePath;

    return {
      projectId: await this.updateProject(projectId, {
        mission: projectMission,
        problemAddressed: theProblem,
        imgPath: filePath
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

  async createProjectProposal({ projectProposal, ownerId }) {
    validateParams(projectProposal, ownerId);

    await validateExistence(this.userDao, ownerId, 'user');

    const project = {
      proposal: projectProposal,
      ownerId
    };

    return { projectId: await this.saveProject(project) };
  },

  async updateProjectProposal(projectId, { projectProposal, ownerId }) {
    validateParams(projectProposal, ownerId, projectId);
    await validateExistence(this.projectDao, projectId, 'project');

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
    return proposal;
  },

  async deleteMilestoneOfProject(projectId, milestoneId) {
    //FIXME ADD OWNER VALIDATION
    validateParams(projectId, milestoneId);
    await validateExistence(this.milestoneId, milestoneId, 'milestone');
    const { milestones } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );

    return {
      milestoneId: this.updateProject(
        projectId,
        milestones.filter(({ id }) => id !== milestoneId)
      )
    };
  },

  async editTaskOfMilestone(milestoneId, taskId, taskParams) {}, // TODO

  async deleteTaskOfMilestone(milestoneId, taskId) {
    // FIXME ADD OWNER VALIDATION
    validateParams(milestoneId, taskId);
    const { tasks } = await validateExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );
    await validateExistence(this.taskDao, taskId, 'task');

    return {
      milestoneId: this.updateMilestone(
        milestoneId,
        tasks.filter(({ id }) => taskId !== id)
      )
    };
  },

  async uploadMilestoneFile(projectId, file) {
    //FIXME ADD OWNER VALIDATION
    validateParams(projectId, file);
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    if (project.milestone) throw Error();

    validateMtype(milestonesType)(file);

    const milestonePath = await files.saveFile(milestonesType, file);

    return {
      projectId: await this.updateProject(projectId, { milestonePath })
    };
  },

  // TODO
  async processMilestoneFile(projectId) {
    const project = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
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

  async publishProject(projectId) {
    //FIXME ADD OWNER VALIDATION
    validateParams(projectId);
    const { status } = await validateExistence(
      this.projectDao,
      projectId,
      'project'
    );
    if (status !== projectStatus.EDITING) {
      throw COAError(errors.ProjectIsNotPublishable);
    }
    return {
      projectId: await this.updateProject(projectId, {
        status: projectStatus.PENDING_APPROVAL
      })
    };
  },

  async getProjects() {
    return this.projectDao.findAllByProps();
  }
};
