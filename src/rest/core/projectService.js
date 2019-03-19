const configs = require('../../../config/configs');

const projectService = ({ fastify, projectDao }) => ({
  /**
   *
   * Saves the project excel file and the project images.
   * Reads the project excel file and creates a project with its information.
   *
   * Returns the created project.
   * @param {*} projectXls project excel file
   * @param {*} projectCoverPhoto project's image file
   * @param {*} projectCardPhoto project's image file
   * @param {*} projectMilestones project's milestones and activities excel file
   */
  async createProject(
    projectXls,
    projectCoverPhoto,
    projectCardPhoto,
    projectMilestones
  ) {
    const milestoneService = require('../core/milestoneService')();
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

  /**
   * Returns a list of active projects
   */
  async getProjectList() {
    return projectDao.getProjectList();
  },

  /**
   * Uploads the project's agreement file to the server
   *
   * @param {*} projectAgreement project's agreement file
   * @param {*} projectId project ID
   */
  async uploadAgreement(projectAgreement, projectId) {
    try {
      // check if project exists in database
      const project = await projectDao.getProjectById(projectId);

      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: `Project ID ${projectId} not found`, status: 404 };
      }

      // creates the directory where this project's agreement will be saved if not exists
      // (it should've been created during the project creation though)
      mkdirp(`${configs.fileServer.filePath}/projects/${projectId}`);

      const filename = `agreement${path.extname(projectAgreement.name)}`;

      // saves the project's agreement
      fastify.log.info(
        '[Project Service] :: Saving Project agreement to:',
        `${configs.fileServer.filePath}/projects/${projectId}/${filename}`
      );
      await projectAgreement.mv(
        `${configs.fileServer.filePath}/projects/${projectId}/${filename}`
      );

      // update database
      const updatedProject = await projectDao.updateProjectAgreement({
        projectAgreement: filename,
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
  }
});

module.exports = projectService;
