const mkdirp = require('mkdirp-promise');
const path = require('path');
const { isEmpty } = require('lodash');
const fs = require('fs');
const configs = require('../../../config/configs');

const { filePath } = configs.fileServer;

const projectService = ({
  fastify,
  projectDao,
  milestoneService,
  projectStatusDao
}) => ({
  /**
   * Uploads the project's images and files to the server.
   * Creates a new project with the information provided.
   *
   * Returns the created project.
   *
   * @param {*} project JSON object with the project information
   * @param {*} projectProposal project's pitch proposal file
   * @param {*} projectCoverPhoto project's cover photo
   * @param {*} projectCardPhoto project's card photo
   * @param {*} projectMilestones file with the project's milestones' information
   */
  async createProject(
    project,
    projectProposal,
    projectCoverPhoto,
    projectCardPhoto,
    projectMilestones
  ) {
    try {
      const newProject = Object.assign({}, JSON.parse(project));
      // TODO: project validations
      newProject.ownerId = 1; // <-- TODO: Replace this line with the actual user id (owner) when the login is implemented
      newProject.status = 0;

      const coverPhotoPath = `${configs.fileServer.filePath}/projects/${
        newProject.projectName
      }/coverPhoto${path.extname(projectCoverPhoto.name)}`;

      const cardPhotoPath = `${configs.fileServer.filePath}/projects/${
        newProject.projectName
      }/cardPhoto${path.extname(projectCardPhoto.name)}`;

      const pitchProposalPath = `${configs.fileServer.filePath}/projects/${
        newProject.projectName
      }/pitchProposal${path.extname(projectProposal.name)}`;

      const milestonesPath = `${configs.fileServer.filePath}/projects/${
        newProject.projectName
      }/milestones${path.extname(projectMilestones.name)}`;

      newProject.coverPhoto = coverPhotoPath;
      newProject.cardPhoto = cardPhotoPath;
      newProject.pitchProposal = pitchProposalPath;
      newProject.milestonesFile = milestonesPath;

      fastify.log.info('[Project Service] :: Saving project:', newProject);

      const savedProject = await projectDao.saveProject(newProject);
      fastify.log.info('[Project Service] :: Project created:', savedProject);

      // creates the directory where this project's files will be saved if not exists
      await mkdirp(
        `${configs.fileServer.filePath}/projects/${newProject.projectName}`
      );

      // saves the project's pictures and proposal
      fastify.log.info(
        '[Project Service] :: Saving Project cover photo to:',
        coverPhotoPath
      );
      await projectCoverPhoto.mv(coverPhotoPath);

      fastify.log.info(
        '[Project Service] :: Saving Project card photo to:',
        cardPhotoPath
      );
      await projectCardPhoto.mv(cardPhotoPath);

      fastify.log.info(
        '[Project Service] :: Saving pitch proposal to:',
        pitchProposalPath
      );
      await projectProposal.mv(pitchProposalPath);

      fastify.log.info(
        '[Milestone Service] :: Saving Milestone excel to:',
        milestonesPath
      );

      // saves the milestones excel file and reads it
      await projectMilestones.mv(milestonesPath);

      fastify.log.info(
        '[Project Service] :: All files saved to:',
        `${configs.fileServer.filePath}/projects/${newProject.projectName}`
      );

      fastify.log.info(
        '[Project Service] :: Creating Milestones for Project ID:',
        savedProject.id
      );

      await milestoneService.createMilestones(milestonesPath, savedProject.id);

      return savedProject;
    } catch (err) {
      fastify.log.error('[Project Service] :: Error creating Project:', err);
      throw Error('Error creating Project');
    }
  },

  /**
   * **Not used**
   *
   * Saves the project excel file and the project images.
   * Reads the project excel file and creates a project with its information.
   *
   * Returns the created project.
   *
   * @param {*} projectXls project excel file
   * @param {*} projectCoverPhoto project's image file
   * @param {*} projectCardPhoto project's image file
   * @param {*} projectMilestones project's milestones and activities excel file
   */
  async createProjectWithFile(
    projectXls,
    projectCoverPhoto,
    projectCardPhoto,
    projectMilestones
  ) {
    try {
      fastify.log.info(
        '[Project Service] :: Saving Project excel to:',
        `${configs.fileServer.filePath}/${projectXls.name}`
      );

      // saves the project excel file and reads it
      await projectXls.mv(`${filePath}/${projectXls.name}`);
      const project = await this.readProject(`${filePath}/${projectXls.name}`);

      project.ownerId = 1; // <-- TODO: Replace this line with the actual user id (owner) when the login is implemented
      project.status = 0;

      fastify.log.info(
        '[Project Service] :: Saving Project cover photo to:',
        `${configs.fileServer.filePath}/${projectCoverPhoto.name}`
      );

      // saves the project pictures
      await projectCoverPhoto.mv(`${filePath}/${projectCoverPhoto.name}`);
      project.coverPhoto = `${filePath}/${projectCoverPhoto.name}`;

      fastify.log.info(
        '[Project Service] :: Saving Project card photo to:',
        `${configs.fileServer.filePath}/${projectCardPhoto.name}`
      );

      await projectCardPhoto.mv(`${filePath}/${projectCardPhoto.name}`);
      project.cardPhoto = `${filePath}/${projectCardPhoto.name}`;

      const savedProject = await projectDao.saveProject(project);

      fastify.log.info('[Project Service] :: Project created:', savedProject);

      await milestoneService.createMilestones(
        projectMilestones,
        savedProject.id
      );

      return savedProject;
    } catch (err) {
      fastify.log.error('[Project Service] :: Error creating Project:', err);
      throw Error('Error creating Project from file');
    }
  },

  /**
   * **Not used**
   *
   * Reads the excel file with the Project's information.
   *
   * Returns an object with the information retrieved.
   * @param {string} file path
   */
  async readProject(file) {
    const XLSX = require('xlsx');

    let workbook = null;

    try {
      fastify.log.info('[Project Service] :: Reading Project excel:', file);
      workbook = XLSX.readFile(file);
    } catch (err) {
      fastify.log.error('[Project Service] Error reading excel ::', err);
      throw Error('Error reading excel file');
    }

    if (workbook == null) {
      fastify.log.error(
        '[Project Service] :: Error reading Project excel file'
      );
      throw Error('Error reading excel file');
    }

    const sheetNameList = workbook.SheetNames;

    // get first worksheet
    const worksheet = workbook.Sheets[sheetNameList[0]];

    const projectJSON = XLSX.utils.sheet_to_json(worksheet).slice(1)[0];

    const project = {
      projectName: projectJSON['Project Name'],
      mission: projectJSON.Mission,
      problemAddressed: projectJSON['Problem Addressed'],
      location: projectJSON['Enterprise Location'],
      timeframe: projectJSON.Timeframe
    };

    fastify.log.info(
      '[Project Service] :: Project data retrieved from file:',
      project
    );
    return project;
  },

  async getProjectList() {
    return projectDao.getProjecListWithStatusFrom({ status: -1 });
  },

  /**
   * Returns a list of active projects, with status == 1
   */
  async getActiveProjectList() {
    return projectDao.getProjecListWithStatusFrom({ status: 1 });
  },

  async getProjectWithId({ projectId }) {
    return projectDao.getProjectById({ projectId });
  },

  async updateProjectStatus({ projectId, status }) {
    const existsStatus = await projectStatusDao.existStatus({ status });
    if (existsStatus) {
      return projectDao.updateProjectStatus({ projectId, status });
    }
  },

  async deleteProject({ projectId }) {
    const projectDeleted = await projectDao.deleteProject({ projectId });
    return projectDeleted;
  },

  async getProjectMilestones({ projectId }) {
    const projectMilestones = await projectDao.getProjectMilestones({
      projectId
    });
    return projectMilestones;
  },

  async getProjectMilestonesPath(projectId) {
    const milestonesFilePath = await projectDao.getProjectMilestonesFilePath(
      projectId
    );
    return milestonesFilePath.milestonesFile;
  },
  /**
   * Uploads the project's agreement file to the server
   *
   * @param {*} projectAgreement project's agreement file
   * @param {number} projectId project ID
   */
  async uploadAgreement(projectAgreement, projectId) {
    try {
      // check if project exists in database
      const project = await projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      // creates the directory where this project's agreement will be saved if not exists
      // (it should've been created during the project creation though)
      mkdirp(`${configs.fileServer.filePath}/projects/${project.projectName}`);

      const filename = `agreement${path.extname(projectAgreement.name)}`;

      // saves the project's agreement
      fastify.log.info(
        '[Project Service] :: Saving Project agreement to:',
        `${configs.fileServer.filePath}/projects/${
          project.projectName
        }/${filename}`
      );
      await projectAgreement.mv(
        `${configs.fileServer.filePath}/projects/${
          project.projectName
        }/${filename}`
      );

      // update database
      const projectAgreementPath = `${configs.fileServer.filePath}/projects/${
        project.projectName
      }/${filename}`;

      const updatedProject = await projectDao.updateProjectAgreement({
        projectAgreement: projectAgreementPath,
        projectId: project.id
      });

      fastify.log.info(
        '[Project Service] :: Project successfully updated:',
        updatedProject
      );

      return updatedProject;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error uploading agreement:',
        error
      );
      throw Error('Error uploading agreement');
    }
  },

  /**
   * Downloads the project's agreement. Returns a File Stream.
   *
   * @param {number} projectId project ID
   */
  async downloadAgreement(projectId) {
    try {
      // check if project exists in database
      const project = await projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      if (
        !project.projectAgreement ||
        project.projectAgreement == null ||
        isEmpty(project.projectAgreement)
      ) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} doesn't have an agreement uploaded`
        );
        return {
          // eslint-disable-next-line prettier/prettier
          error: 'ERROR: Project doesn\'t have an agreement uploaded',
          status: 409
        };
      }

      const filepath = project.projectAgreement;

      // read file and return stream
      const filestream = fs.createReadStream(filepath);

      filestream.on('error', error => {
        fastify.log.error(
          `[Project Service] :: Agreement file not found for Project ID ${projectId}:`,
          error
        );
        return {
          error: 'ERROR: Agreement file not found',
          status: 404
        };
      });

      return filestream;
    } catch (error) {
      fastify.log.error('[Project Service] :: Error getting agreement:', error);
      throw Error('Error getting agreement');
    }
  },
   /**
   * Downloads the project's pitch proposal. Returns a File Stream.
   *
   * @param {number} projectId project ID
   */
  async downloadProposal(projectId) {
    try {
      // check if project exists in database
      const project = await projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      if (
        !project.pitchProposal ||
        project.pitchProposal == null ||
        isEmpty(project.pitchProposal)
      ) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} doesn't have a pitch proposal uploaded`
        );
        return {
          // eslint-disable-next-line prettier/prettier
          error: 'ERROR: Project doesn\'t have a pitch proposal uploaded',
          status: 409
        };
      }
      const filepath = project.pitchProposal;

      // read file and return stream
      const filestream = fs.createReadStream(filepath);

      filestream.on('error', error => {
        fastify.log.error(
          `[Project Service] :: Pitch proposal file not found for Project ID ${projectId}:`,
          error
        );
        return {
          error: 'ERROR: Pitch proposal file not found',
          status: 404
        };
      });

      return filestream;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error getting pitch proposal:',
        error
      );
      throw Error('Error getting pitch proposal');
    }
  }
});

module.exports = projectService;
