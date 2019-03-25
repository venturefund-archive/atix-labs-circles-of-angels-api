const mkdirp = require('mkdirp-promise');
const configs = require('../../../config/configs');
const { getBase64htmlFromPath } = require('../util/images');

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

      const coverPhotoPath = projectCoverPhoto.path;
      const cardPhotoPath = projectCardPhoto.path;
      const pitchProposalPath = projectProposal.path;
      const milestonesPath = projectMilestones.path;

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

  async getProjectList() {
    const projects = await projectDao.getProjecListWithStatusFrom({
      status: -1
    });
    projects.forEach(project => projectImagesToBase64(project));
    return projects;
  },

  /**
   * Returns a list of active projects, with status == 1
   */
  async getActiveProjectList() {
    const projects = await projectDao.getProjecListWithStatusFrom({
      status: 1
    });
    projects.forEach(project => projectImagesToBase64(project));
    return projects;
  },

  async getProjectWithId({ projectId }) {
    const project = await projectDao.getProjectById({ projectId });
    projectImagesToBase64(project);
    return project;
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
  }
});

const projectImagesToBase64 = project => {
  if (!project) return;
  project.coverPhoto = getBase64htmlFromPath(project.coverPhoto);
  project.cardPhoto = getBase64htmlFromPath(project.cardPhoto);
};
module.exports = projectService;
