const mkdirp = require('mkdirp-promise');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const { isEmpty, uniq } = require('lodash');
const { forEachPromise } = require('../util/promises');
const {
  addPathToFilesProperties,
  addTimestampToFilename
} = require('../util/files');
const { projectStatus, blockchainStatus } = require('../util/constants');

const unlinkPromise = promisify(fs.unlink);

const projectService = ({
  fastify,
  projectDao,
  milestoneService,
  projectStatusDao,
  photoService,
  transferService,
  userDao,
  projectExperienceDao
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
    projectAgreement,
    ownerId
  ) {
    try {
      const newProject = Object.assign({}, JSON.parse(project));
      const response = {};

      newProject.ownerId = ownerId;
      newProject.status = projectStatus.PENDING_APPROVAL;
      newProject.blockchainStatus = blockchainStatus.PENDING;

      fastify.log.info('[Project Service] :: Saving project:', newProject);

      fastify.log.info('[Project Service] :: Checking file types');

      if (!projectAgreement || !this.checkAgreementType(projectAgreement)) {
        fastify.log.error(
          '[Project Service] :: Wrong file type for Project Agreement',
          projectAgreement
        );
        return {
          status: 409,
          error: 'Invalid file type for the uploaded Agreement'
        };
      }

      if (!projectProposal || !this.checkProposalType(projectProposal)) {
        fastify.log.error(
          '[Project Service] :: Wrong file type for Project Proposal',
          projectProposal
        );
        return {
          status: 409,
          error: 'Invalid file type for the uploaded Proposal'
        };
      }

      if (!projectCardPhoto || !this.checkCardPhotoType(projectCardPhoto)) {
        fastify.log.error(
          '[Project Service] :: Wrong file type for Project Card Photo',
          projectCardPhoto
        );
        return {
          status: 409,
          error: 'Invalid file type for the uploaded card photo'
        };
      }

      if (!projectCoverPhoto || !this.checkCoverPhotoType(projectCoverPhoto)) {
        fastify.log.error(
          '[Project Service] :: Wrong file type for Project Cover Photo',
          projectCoverPhoto
        );
        return {
          status: 409,
          error: 'Invalid file type for the uploaded cover photo'
        };
      }

      if (
        !projectMilestones ||
        !this.checkMilestonesFileType(projectMilestones)
      ) {
        fastify.log.error(
          '[Project Service] :: Wrong file type for Project Milestones file',
          projectMilestones
        );
        return {
          status: 409,
          error: 'Invalid file type for the uploaded Milestones file'
        };
      }

      const savedProject = await projectDao.saveProject(newProject);

      fastify.log.info('[Project Service] :: Project created:', savedProject);

      addPathToFilesProperties({
        projectId: savedProject.id,
        coverPhoto: projectCoverPhoto,
        cardPhoto: projectCardPhoto,
        pitchProposal: projectProposal,
        projectAgreement,
        milestones: projectMilestones
      });

      const coverPhotoPath = projectCoverPhoto.path;
      const cardPhotoPath = projectCardPhoto.path;
      const pitchProposalPath = projectProposal.path;
      const projectAgreementPath = projectAgreement
        ? projectAgreement.path
        : '';
      const milestonesPath = projectMilestones.path;

      fastify.log.info('[Project Service] :: Saving project files');

      // creates the directory where this project's files will be saved if not exists
      await mkdirp(
        `${fastify.configs.fileServer.filePath}/projects/${savedProject.id}`
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

      if (projectAgreementPath) {
        fastify.log.info(
          '[Project Service] :: Saving project agreement to:',
          projectAgreementPath
        );
        await projectAgreement.mv(projectAgreementPath);
      }

      fastify.log.info(
        '[Milestone Service] :: Saving Milestone excel to:',
        milestonesPath
      );

      // saves the milestones excel file and reads it
      await projectMilestones.mv(milestonesPath);

      fastify.log.info(
        '[Project Service] :: All files saved to:',
        `${fastify.configs.fileServer.filePath}/projects/${savedProject.id}`
      );

      const savedCoverPhoto = await photoService.savePhoto(coverPhotoPath);
      if (savedCoverPhoto && savedCoverPhoto != null) {
        savedProject.coverPhoto = savedCoverPhoto.id;
      }

      const savedCardPhoto = await photoService.savePhoto(cardPhotoPath);
      if (savedCardPhoto && savedCardPhoto != null) {
        savedProject.cardPhoto = savedCardPhoto.id;
      }

      savedProject.pitchProposal = pitchProposalPath;
      savedProject.projectAgreement = projectAgreementPath;
      savedProject.milestonesFile = milestonesPath;

      // updates project to include its files' path

      fastify.log.info(
        '[Project Service] :: Creating Milestones for Project ID:',
        savedProject.id
      );

      const milestones = await milestoneService.createMilestones(
        milestonesPath,
        savedProject.id
      );

      const userOwner = await userDao.getUserById(ownerId);

      const transactionHash = await fastify.eth.createProject(
        userOwner.address,
        userOwner.pwd,
        {
          projectId: savedProject.id,
          seAddress: userOwner.address,
          projectName: savedProject.projectName
        }
      );
      fastify.log.info(
        '[Project Service] :: transaction hash of project creation: ',
        transactionHash
      );

      savedProject.creationTransactionHash = transactionHash;
      savedProject.blockchainStatus = blockchainStatus.SENT;

      fastify.log.info('[Project Service] :: Updating project:', savedProject);
      const updatedProject = await projectDao.updateProject(
        savedProject,
        savedProject.id
      );
      fastify.log.info('[Project Service] :: Project Updated:', updatedProject);

      response.project = updatedProject;
      response.milestones = milestones;

      return response;
    } catch (err) {
      fastify.log.error('[Project Service] :: Error creating Project:', err);
      throw Error('Error creating Project');
    }
  },

  checkProposalType(file) {
    const fileType = mime.lookup(file.name);
    return (
      fileType === 'application/msword' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/pdf' ||
      fileType === 'application/vnd.ms-powerpoint' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
  },

  checkAgreementType(file) {
    const fileType = mime.lookup(file.name);
    return (
      fileType === 'application/msword' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/pdf'
    );
  },

  checkCoverPhotoType(file) {
    const fileType = mime.lookup(file.name);
    return fileType.includes('image/');
  },

  checkCardPhotoType(file) {
    const fileType = mime.lookup(file.name);
    return fileType.includes('image/');
  },

  checkMilestonesFileType(file) {
    const fileType = mime.lookup(file.name);
    return (
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  },

  /**
   * Updates an existing project
   *
   * @param {object} project
   * @param {file} projectCoverPhoto
   * @param {file} projectCardPhoto
   * @param {number} id
   * @returns updated project | error message
   */
  async updateProject(project, projectCoverPhoto, projectCardPhoto, id) {
    try {
      const newProject = Object.assign({}, JSON.parse(project));
      fastify.log.info('[Project Service] :: Updating project:', newProject);

      // remove fields that shouldn't be updated
      delete newProject.pitchProposal;
      delete newProject.projectAgreement;
      delete newProject.milestonesFile;
      delete newProject.transactionHash;
      delete newProject.creationTransactionHash;

      const currentProject = await projectDao.getProjectById({ projectId: id });
      if (!currentProject) {
        fastify.log.error(
          `[Project Service] :: Project ID ${id} does not exist`
        );
        return {
          status: 404,
          error: 'Project does not exist'
        };
      }

      if (projectCardPhoto || projectCoverPhoto) {
        // get current photos
        const projectPhotos = await projectDao.getProjectPhotos(id);
        // create files' path
        addPathToFilesProperties({
          projectId: id,
          coverPhoto: projectCoverPhoto,
          cardPhoto: projectCardPhoto
        });

        // creates the directory where this project's files will be saved if not exists
        await mkdirp(`${fastify.configs.fileServer.filePath}/projects/${id}`);

        // saves the project's pictures
        if (projectCoverPhoto) {
          const currentCoverPhoto = await photoService.getPhotoById(
            projectPhotos.coverPhoto
          );
          const coverPhotoPath = projectCoverPhoto.path;
          fastify.log.info(
            '[Project Service] :: Saving Project cover photo to:',
            coverPhotoPath
          );
          // delete current cover photo
          if (fs.existsSync(currentCoverPhoto.path)) {
            await unlinkPromise(currentCoverPhoto.path);
          }
          // save new cover photo
          await projectCoverPhoto.mv(coverPhotoPath);

          // update cover photo path in database
          const updatedCoverPhoto = await photoService.updatePhoto(
            projectPhotos.coverPhoto,
            coverPhotoPath
          );
          if (updatedCoverPhoto && updatedCoverPhoto != null) {
            newProject.coverPhoto = updatedCoverPhoto.id;
          }
        }

        if (projectCardPhoto) {
          const currentCardPhoto = await photoService.getPhotoById(
            projectPhotos.cardPhoto
          );
          const cardPhotoPath = projectCardPhoto.path;
          fastify.log.info(
            '[Project Service] :: Saving Project card photo to:',
            cardPhotoPath
          );
          // delete current card photo
          if (fs.existsSync(currentCardPhoto.path)) {
            await unlinkPromise(currentCardPhoto.path);
          }
          // save current card photo
          await projectCardPhoto.mv(cardPhotoPath);

          // update card photo path in database
          const updatedCardPhoto = await photoService.updatePhoto(
            projectPhotos.cardPhoto,
            cardPhotoPath
          );
          if (updatedCardPhoto && updatedCardPhoto != null) {
            newProject.cardPhoto = updatedCardPhoto.id;
          }
        }

        fastify.log.info(
          '[Project Service] :: All files saved to:',
          `${fastify.configs.fileServer.filePath}/projects/${id}`
        );
      }

      fastify.log.info('[Project Service] :: Updating project:', newProject);
      const savedProject = await projectDao.updateProject(newProject, id);
      fastify.log.info('[Project Service] :: Project Updated:', savedProject);

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
      throw Error('Error updating Project');
    }
  },

  async getProjectList() {
    const projects = await projectDao.getProjecListWithStatusFrom({
      status: projectStatus.PENDING_APPROVAL
    });
    return projects;
  },

  /**
   * Returns a list of active projects, with status == 1
   */
  async getActiveProjectList() {
    const projects = await projectDao.getProjecListWithStatusFrom({
      status: projectStatus.PUBLISHED
    });
    return projects;
  },

  async getProjectWithId({ projectId }) {
    const project = await projectDao.getProjectById({ projectId });
    return project;
  },

  async updateProjectStatus({ projectId, status }) {
    const project = await this.getProjectWithId({ projectId });
    const existsStatus = Object.values(projectStatus).includes(status);
    if (status === projectStatus.IN_PROGRESS) {
      const isConfirmedOnBlockchain =
        project.blockchainStatus === blockchainStatus.CONFIRMED;
      if (!isConfirmedOnBlockchain)
        return {
          error: `Project ${
            project.projectName
          } is not confirmed on blockchain yet`
        };
    }
    if (existsStatus) {
      return projectDao.updateProjectStatus({ projectId, status });
    }
  },

  async deleteProject({ projectId }) {
    const projectDeleted = await projectDao.deleteProject({ projectId });
    return projectDeleted;
  },

  async getProjectMilestones(projectId) {
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
    const filepath = require('path').join(
      __dirname,
      '../../../assets/templates/milestones.xlsx'
    );

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

  /**
   * Downloads the project proposal template to be used in Project Creation
   *
   * @returns project proposal file | error
   */
  async downloadProposalTemplate() {
    const filepath = require('path').join(
      __dirname,
      '../../../assets/templates/PitchProposal.docx'
    );

    try {
      if (fs.existsSync(filepath)) {
        // read file and return stream
        const filestream = fs.createReadStream(filepath);

        filestream.on('error', error => {
          fastify.log.error(
            '[Project Service] :: Error reading project proposal template file',
            error
          );
          return {
            error: 'ERROR: Error reading project proposal template file',
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
        `[Project Service] :: Project proposal template file could not be found in ${filepath}`
      );
      return {
        error: 'ERROR: Project proposal template file could not be found',
        status: 404
      };
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error reading project proposal template file',
        error
      );
      return {
        error: 'ERROR: Error reading project proposal template file',
        status: 404
      };
    }
  },

  async getProjectMilestonesPath(projectId) {
    const milestonesFilePath = await projectDao.getProjectMilestonesFilePath(
      projectId
    );

    if (!milestonesFilePath || milestonesFilePath == null) {
      throw Error('Error getting milestones file');
    }

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
      mkdirp(`${fastify.configs.fileServer.filePath}/projects/${project.id}`);

      const filename = `agreement${path.extname(projectAgreement.name)}`;

      // saves the project's agreement
      fastify.log.info(
        '[Project Service] :: Saving Project agreement to:',
        `${fastify.configs.fileServer.filePath}/projects/${
          project.id
        }/${filename}`
      );
      await projectAgreement.mv(
        `${fastify.configs.fileServer.filePath}/projects/${
          project.id
        }/${filename}`
      );

      // update database
      const projectAgreementPath = `${
        fastify.configs.fileServer.filePath
      }/projects/${project.id}/${filename}`;

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
          error: "ERROR: Project doesn't have an agreement uploaded",
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
          error: "ERROR: Project doesn't have a pitch proposal uploaded",
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
  },

  /**
   * Returns the total amount funded for an existing project
   *
   * @param {number} projectId
   * @returns total funded amount || error
   */
  async getTotalFunded(projectId) {
    fastify.log.info(
      '[Project Service] :: Getting already funded amount for Project ID',
      projectId
    );

    try {
      // verify if project exists
      const project = await projectDao.getProjectById({ projectId });
      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      const totalAmount = await transferService.getTotalFundedByProject(
        projectId
      );

      fastify.log.info(
        `[Project Service] :: Total funded amount for Project ID ${projectId} is ${totalAmount}`
      );
      return totalAmount;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error getting funded amount:',
        error
      );
      throw Error('Error getting funded amount');
    }
  },

  /**
   * Changes the status of a PUBLISHED project to IN_PROGRESS
   *
   * @param {number} projectId
   * @returns updated project || error
   */
  async startProject(projectId) {
    fastify.log.info(
      `[Project Service] :: Updating Project ID ${projectId} status to In Progress`
    );

    try {
      // verify if project exists
      const project = await projectDao.getProjectById({ projectId });
      if (!project || project == null) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }
      if (
        project.status !== projectStatus.PUBLISHED &&
        project.status !== projectStatus.IN_PROGRESS
      ) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} is not published`
        );
        return { error: 'Project needs to be published', status: 409 };
      }

      if (project.status === projectStatus.IN_PROGRESS) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} already in progress`
        );
        return { error: 'Project has already started', status: 409 };
      }

      const projectWithOracles = await this.isFullyAssigned(projectId);
      if (!projectWithOracles) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} has activities with no oracles assigned`
        );
        return {
          error: 'Project has activities with no oracles assigned',
          status: 409
        };
      }

      const userOwner = await projectDao.getUserOwnerOfProject(projectId);

      fastify.log.info(
        `[Project Service] :: Starting milestones on blockchain of project Project ID ${projectId}`
      );
      await milestoneService.startMilestonesOfProject(
        project,
        userOwner
      );

      return project;
    } catch (error) {
      fastify.log.error('[Project Service] :: Error starting project:', error);
      throw Error('Error starting project');
    }
  },

  async isFullyAssigned(projectId) {
    let isFullyAssigned = true;
    const milestones = await milestoneService.getMilestonesByProject(projectId);

    if (!milestones || milestones == null) {
      return false;
    }

    await milestones.forEach(async milestone => {
      await milestone.activities.forEach(activity => {
        if (!activity.oracle || isEmpty(activity.oracle)) {
          isFullyAssigned = false;
        }
      });
    });

    return isFullyAssigned;
  },

  /**
   * Returns an array of the projects' id that an oracle
   * has any of its activities assigned without duplicates
   *
   * @param {number} oracleId
   * @return object with the oracle and its projects } | error
   */
  async getProjectsAsOracle(oracleId) {
    fastify.log.info(
      '[Project Service] :: Getting Projects for Oracle ID',
      oracleId
    );
    try {
      const projects = await milestoneService.getProjectsAsOracle(oracleId);
      if (projects.error) {
        return projects;
      }

      const uniqueProjects = uniq(projects);
      fastify.log.info(
        `[Project Service] :: Projects found for Oracle ID ${oracleId}: ${uniqueProjects}`
      );
      return { projects: uniqueProjects, oracle: oracleId };
    } catch (error) {
      fastify.log.error('[Project Service] :: Error getting Projects:', error);
      throw Error('Error getting Projects');
    }
  },

  async getProjectOwner(projectId) {
    try {
      const project = await projectDao.getProjectById({ projectId });
      const user = await userDao.getUserById(project.ownerId);
      return user;
    } catch (error) {
      throw Error('Error getting project owner');
    }
  },

  async isProjectTransactionConfirmed(projectId) {
    try {
      const project = await projectDao.getProjectById({ projectId });
      return fastify.eth.isTransactionConfirmed(project.transactionHash);
    } catch (error) {
      throw Error('Error getting confirmation of transaction');
    }
  },

  async getProjectsOfOwner(ownerId) {
    try {
      const projects = await projectDao.getProjectsByOwner(ownerId);
      return projects;
    } catch (error) {
      return {
        status: 500,
        error: `Error getting Projects of owner: ${ownerId}`
      };
    }
  },

  async getAllProjectsById(projectsId) {
    return projectDao.getAllProjectsById(projectsId);
  },

  /**
   * Uploads a COA user's experience about a project
   *
   * @param {number} projectId
   * @param {object} experience {user, comment}
   * @param {file} file
   * @returns saved experience | error msg
   */
  async uploadExperience(projectId, experience, files) {
    fastify.log.info(
      `[Project Service] :: Uploading experience to Project ID ${projectId}:`,
      experience,
      files
    );

    try {
      const project = await projectDao.getProjectById({ projectId });

      if (!project) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return {
          status: 404,
          error: 'Project not found'
        };
      }

      const user = await userDao.getUserById(experience.user);

      if (!user) {
        fastify.log.error(
          `[Project Service] :: User ID ${experience.user} not found`
        );
        return {
          status: 404,
          error: 'User not found'
        };
      }

      const newExperience = { ...experience, project: projectId };

      const savedExperience = await projectExperienceDao.saveProjectExperience(
        newExperience
      );

      if (!savedExperience) {
        fastify.log.error(
          '[Project Service] :: Error saving experience in database:',
          newExperience
        );

        return {
          status: 500,
          error: 'There was an error uploading the experience'
        };
      }

      const errors = [];

      if (files && files.length > 0) {
        const savedFiles = await Promise.all(
          files.map(async (file, index) => {
            const savedFile = await this.saveExperienceFile(
              file,
              projectId,
              savedExperience.id,
              index
            );
            if (savedFile.error) {
              errors.push({
                error: savedFile.error,
                file: file.name
              });
            }
            return savedFile;
          })
        );
        savedExperience.photos = savedFiles;
      }

      if (errors.length > 0) {
        savedExperience.errors = errors;
      }

      return savedExperience;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error uploading experience:',
        error
      );
      throw Error('Error uploading experience');
    }
  },

  async saveExperienceFile(file, projectId, projectExperienceId, index) {
    const filetype = mime.lookup(file.name);

    if (!filetype) {
      fastify.log.error(
        '[Project Service] :: Error getting mime type of file:',
        file
      );
      return { error: 'Error uploading file', status: 409 };
    }

    if (!filetype.includes('image/')) {
      fastify.log.error('[Project Service] :: File type is invalid:', file);
      return { error: 'File type is invalid', status: 409 };
    }

    fastify.log.info('[Project Service] :: Saving file:', file);

    const filename = addTimestampToFilename(file.name);

    const filepath = `${
      fastify.configs.fileServer.filePath
    }/projects/${projectId}/experiences/${filename}`;

    if (fs.existsSync(filepath)) {
      filepath.concat(`-${index}`);
    }

    await mkdirp(
      `${fastify.configs.fileServer.filePath}/projects/${projectId}/experiences`
    );
    await file.mv(filepath);

    try {
      const savedFile = await photoService.savePhoto(
        filepath,
        projectExperienceId
      );
      fastify.log.info('[Project Service] :: File saved in', filepath);
      return savedFile;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error saving file in database:',
        error
      );
      if (fs.existsSync(filepath)) {
        await unlinkPromise(filepath);
      }
      return {
        status: 409,
        error: 'Error saving file'
      };
    }
  },

  /**
   * Returns all the experiences uploaded to a project
   *
   * @param {number} projectId
   * @returns list of experiences | error
   */
  async getExperiences(projectId) {
    fastify.log.info(
      `[Project Service] :: Getting experiences of Project ID ${projectId}`
    );

    try {
      const project = await projectDao.getProjectById({ projectId });

      if (!project) {
        fastify.log.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return {
          status: 404,
          error: 'Project not found'
        };
      }

      const experiences = await projectExperienceDao.getExperiencesByProject(
        projectId
      );

      if (!experiences) {
        fastify.log.error(
          `[Project Service] :: Error getting the experiences for project ID ${projectId}`
        );
        return {
          status: 500,
          error: 'There was an error getting the project experiences'
        };
      }

      if (isEmpty(experiences)) {
        fastify.log.info(
          `[Project Service] :: Project ID ${projectId} does not have any experiences uploaded`
        );
      }

      return experiences;
    } catch (error) {
      fastify.log.error(
        '[Project Service] :: Error getting experiences:',
        error
      );
      throw Error('Error getting experiences');
    }
  },

  async updateBlockchainStatus(projectId, status) {
    if (!Object.values(blockchainStatus).includes(status)) {
      return { error: 'Invalid Blockchain status' };
    }
    return projectDao.updateBlockchainStatus(projectId, status);
  }
});

module.exports = projectService;
