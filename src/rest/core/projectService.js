const mkdirp = require('mkdirp-promise');
const fs = require('fs');
const path = require('path');
const { isEmpty } = require('lodash');
const configs = require('../../../config/configs');
const { getBase64htmlFromPath } = require('../util/images');
const { forEachPromise } = require('../util/promises');
const { addPathToFilesProperties } = require('../util/files');

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
    projectMilestones,
    ownerId
  ) {
    try {
      const newProject = Object.assign({}, JSON.parse(project));
      const response = {};

      newProject.ownerId = ownerId;
      newProject.status = 0;

      fastify.log.info('[Project Service] :: Saving project:', newProject);

      const savedProject = await projectDao.saveProject(newProject);
      fastify.log.info('[Project Service] :: Project created:', savedProject);

      addPathToFilesProperties(
        savedProject.id,
        projectProposal,
        projectCoverPhoto,
        projectCardPhoto,
        projectMilestones
      );

      const coverPhotoPath = projectCoverPhoto.path;
      const cardPhotoPath = projectCardPhoto.path;
      const pitchProposalPath = projectProposal.path;
      const milestonesPath = projectMilestones.path;

      savedProject.coverPhoto = coverPhotoPath;
      savedProject.cardPhoto = cardPhotoPath;
      savedProject.pitchProposal = pitchProposalPath;
      savedProject.milestonesFile = milestonesPath;

      // creates the directory where this project's files will be saved if not exists
      await mkdirp(
        `${configs.fileServer.filePath}/projects/${savedProject.id}`
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
        `${configs.fileServer.filePath}/projects/${savedProject.id}`
      );

      // updates project to include its files' path
      fastify.log.info('[Project Service] :: Updating project:', savedProject);
      const updatedProject = await projectDao.updateProject(
        savedProject,
        savedProject.id
      );
      fastify.log.info('[Project Service] :: Project Updated:', updatedProject);

      fastify.log.info(
        '[Project Service] :: Creating Milestones for Project ID:',
        updatedProject.id
      );

      const milestones = await milestoneService.createMilestones(
        milestonesPath,
        updatedProject.id
      );

      response.project = updatedProject;
      response.milestones = milestones;

      return response;
    } catch (err) {
      fastify.log.error('[Project Service] :: Error creating Project:', err);
      throw Error('Error creating Project');
    }
  },

  /**
   * Updates an existing project
   *
   * @param {object} project
   * @param {number} id
   * @returns updated project | error message
   */
  async updateProject(
    project,
    projectProposal,
    projectCoverPhoto,
    projectCardPhoto,
    id
  ) {
    try {
      fastify.log.info('[Project Service] :: Updating project:', project);

      // save files

      const savedProject = await projectDao.updateProject(project, id);

      if (!savedProject || savedProject == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${id} does not exist`,
          savedProject
        );
        return {
          status: 404,
          error: 'Project does not exist'
        };
      }

      fastify.log.info('[Project Service] :: Project updated:', savedProject);

      return savedProject;
    } catch (error) {
      fastify.log.error('[Project Service] :: Error updating Project:', error);
      return { status: 500, error: 'Error updating Project' };
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

    const milestones = [];

    await forEachPromise(
      projectMilestones,
      (milestone, context) =>
        new Promise(resolve => {
          process.nextTick(async () => {
            const milestoneActivities = await milestoneService.getMilestoneActivities(
              milestone
            );

            const milestoneWithType = {
              ...milestoneActivities,
              type: 'Milestone'
            };

            context.push(milestoneWithType);
            resolve();
          });
        }),
      milestones
    );

    return milestones;
  },

  /**
   * Downloads the Milestones template to be used in Project Creation
   *
   * @returns milestone template file stream
   */
  async downloadMilestonesTemplate() {
    const filepath = `${configs.fileServer.filePath}/templates/milestones.xlsx`;

    try {
      if (fs.existsSync(filepath)) {
        // read file and return stream
        const filestream = fs.createReadStream(filepath);

        filestream.on('error', error => {
          fastify.log.error(
            '[Project Service] :: Error reading milestones template file',
            error
          );
          return {
            error: 'ERROR: Error reading milestones template file',
            status: 404
          };
        });

        const response = {
          filename: path.basename(filepath),
          filestream
        };

        return response;
      }

      fastify.log.error(
        `[Project Service] :: Milestones template file could not be found in ${filepath}`
      );
      return {
        error: 'ERROR: Milestones template file could not be found',
        status: 404
      };
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error reading milestones template file',
        error
      );
      return {
        error: 'ERROR: Error reading milestones template file',
        status: 404
      };
    }
  },

  async getProjectMilestonesPath(projectId) {
    const milestonesFilePath = await projectDao.getProjectMilestonesFilePath(
      projectId
    );

    const response = {
      filename: path.basename(milestonesFilePath.milestonesFile),
      filepath: milestonesFilePath.milestonesFile
    };

    return response;
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
      mkdirp(`${configs.fileServer.filePath}/projects/${project.id}`);

      const filename = `agreement${path.extname(projectAgreement.name)}`;

      // saves the project's agreement
      fastify.log.info(
        '[Project Service] :: Saving Project agreement to:',
        `${configs.fileServer.filePath}/projects/${project.id}/${filename}`
      );
      await projectAgreement.mv(
        `${configs.fileServer.filePath}/projects/${project.id}/${filename}`
      );

      // update database
      const projectAgreementPath = `${configs.fileServer.filePath}/projects/${
        project.id
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

      const response = {
        filename: path.basename(filepath),
        filestream
      };

      return response;
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

      const response = {
        filename: path.basename(filepath),
        filestream
      };

      return response;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error getting pitch proposal:',
        error
      );
      throw Error('Error getting pitch proposal');
    }
  }
});

const projectImagesToBase64 = project => {
  if (!project) return;
  project.coverPhoto = getBase64htmlFromPath(project.coverPhoto);
  project.cardPhoto = getBase64htmlFromPath(project.cardPhoto);
};
module.exports = projectService;
