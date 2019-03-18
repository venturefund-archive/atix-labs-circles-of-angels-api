const configs = require('../../../config/configs');

const projectService = ({
  fastify,
  projectDao,
  milestoneService,
  projectStatusDao
}) => ({
  /**
   *
   * Saves the project excel file and the project image.
   * Reads the project excel file and creates a project with its information.
   *
   * Returns the created project.
   * @param {*} projectXls project excel file
   * @param {*} projectPhoto project's image file
   * @param {*} projectMilestones project's milestones and activities excel file
   */
  async createProject(projectXls, projectPhoto, projectMilestones) {
    const { filePath } = configs.fileServer;

    try {
      fastify.log.info(
        '[Project Service] :: Saving Project excel to:',
        `${configs.fileServer.filePath}/${projectXls.name}`
      );

      // saves the project excel file and reads it
      await projectXls.mv(`${filePath}/${projectXls.name}`);
      const project = await this.readProject(`${filePath}/${projectXls.name}`);

      project.ownerId = 1; // <-- TODO: Replace this line for the actual user id (owner) when the login is implemented
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
  }
});

module.exports = projectService;
