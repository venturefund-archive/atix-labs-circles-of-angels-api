const mkdirp = require('mkdirp');
const path = require('path');
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

      newProject.coverPhoto = `coverPhoto${path.extname(
        projectCoverPhoto.name
      )}`;
      newProject.cardPhoto = `cardPhoto${path.extname(projectCardPhoto.name)}`;
      newProject.pitchProposal = `pitchProposal${path.extname(
        projectProposal.name
      )}`;

      fastify.log.info('[Project Service] :: Saving project:', newProject);

      const savedProject = await projectDao.saveProject(newProject);
      fastify.log.info('[Project Service] :: Project created:', savedProject);

      // creates the directory where this project's files will be saved if not exists
      mkdirp(`${configs.fileServer.filePath}/projects/${savedProject.id}`);

      // saves the project's pictures and proposal
      fastify.log.info(
        '[Project Service] :: Saving Project cover photo to:',
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/coverPhoto${path.extname(projectCoverPhoto.name)}`
      );
      await projectCoverPhoto.mv(
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/coverPhoto${path.extname(projectCoverPhoto.name)}`
      );

      fastify.log.info(
        '[Project Service] :: Saving Project card photo to:',
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/cardPhoto${path.extname(projectCardPhoto.name)}`
      );
      await projectCardPhoto.mv(
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/cardPhoto${path.extname(projectCardPhoto.name)}`
      );

      fastify.log.info(
        '[Project Service] :: Saving pitch proposal to:',
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/projectProposal${path.extname(projectProposal.name)}`
      );
      await projectProposal.mv(
        `${configs.fileServer.filePath}/projects/${
          savedProject.id
        }/pitchProposal${path.extname(projectProposal.name)}`
      );

      fastify.log.info(
        '[Project Service] :: All files saved to:',
        `${configs.fileServer.filePath}/projects/${savedProject.id}`
      );

      fastify.log.info(
        '[Project Service] :: Creating Milestones for Project ID:',
        savedProject.id
      );

      await milestoneService.createMilestones(
        projectMilestones,
        savedProject.id
      );

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
  }
});

module.exports = projectService;
