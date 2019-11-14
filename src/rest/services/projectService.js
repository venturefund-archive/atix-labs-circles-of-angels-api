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
const path = require('path');
const mime = require('mime');
const { isEmpty, uniq } = require('lodash');
const { forEachPromise } = require('../util/promises');
const {
  addPathToFilesProperties,
  addTimestampToFilename
} = require('../util/files');
const {
  projectStatus,
  blockchainStatus,
  userRoles
} = require('../util/constants');
const MAX_PHOTO_SIZE = 500000;

const { savePhotoJpgFormat } = require('../util/files');

const unlinkPromise = promisify(fs.unlink);

const cardPhotoSize = 700;
const coverPhotoSize = 1400;

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
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

      logger.info('[Project Service] :: Saving project:', newProject);

      logger.info('[Project Service] :: Checking file types');

      if (projectAgreement && !this.checkAgreementType(projectAgreement)) {
        logger.error(
          '[Project Service] :: Wrong file type for Project Agreement',
          projectAgreement
        );
        // return {
        //   status: 409,
        //   error: 'Invalid file type for the uploaded Agreement'
        // };
        throw new FileTypeNotValid('Invalid file type for the uploaded Agreement');
      }

      if (!projectProposal || !this.checkProposalType(projectProposal)) {
        logger.error(
          '[Project Service] :: Wrong file type for Project Proposal',
          projectProposal
        );
        // return {
        //   status: 409,
        //   error: 'Invalid file type for the uploaded Proposal'
        // };
        throw new FileTypeNotValid('Invalid file type for the uploaded Proposal');
      }

      if (!projectCardPhoto || !this.checkCardPhotoType(projectCardPhoto)) {
        logger.error(
          '[Project Service] :: Wrong file type for Project Card Photo',
          projectCardPhoto
        );
        // return {
        //   status: 409,
        //   error: 'Invalid file type for the uploaded card photo'
        // };
        throw new FileTypeNotValid('Invalid file type for the uploaded card photo');
      }

      if (!projectCoverPhoto || !this.checkCoverPhotoType(projectCoverPhoto)) {
        logger.error(
          '[Project Service] :: Wrong file type for Project Cover Photo',
          projectCoverPhoto
        );
        // return {
        //   status: 409,
        //   error: 'Invalid file type for the uploaded cover photo'
        // };
        throw new FileTypeNotValid('Invalid file type for the uploaded cover photo');
      }

      if (!this.checkPhotoSize(projectCardPhoto)) {
        logger.error(
          '[Project Service] :: Size of Project Card Photo too high',
          projectCardPhoto
        );
        // return {
        //   status: 409,
        //   error: `Invalid size for the uploaded card photo, higher than ${MAX_PHOTO_SIZE /
        //     1000} MB`
        // };
        throw new ImageSizeNotValid(`Invalid size for the uploaded cover photo, higher than ${MAX_PHOTO_SIZE} /1000} MB`);
      }

      if (!this.checkPhotoSize(projectCoverPhoto)) {
        logger.error(
          '[Project Service] :: Size of Project Cover Photo too high',
          projectCoverPhoto
        );
        // return {
        //   status: 409,
        //   error: `Invalid size for the uploaded cover photo, higher than ${MAX_PHOTO_SIZE /
        //     1000} MB`
        // };
        throw new ImageSizeNotValid(`Invalid size for the uploaded cover photo, higher than ${MAX_PHOTO_SIZE} /1000} MB`);
      }

      if (
        !projectMilestones ||
        !this.checkMilestonesFileType(projectMilestones)
      ) {
        logger.error(
          '[Project Service] :: Wrong file type for Project Milestones file',
          projectMilestones
        );
        // return {
        //   status: 409,
        //   error: 'Invalid file type for the uploaded Milestones file'
        // };
        throw new FileTypeNotValid('Invalid file type for the uploaded Milestones file');
      }

      const savedProject = await this.projectDao.saveProject(newProject);

      logger.info('[Project Service] :: Project created:', savedProject);

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

      logger.info('[Project Service] :: Saving project files');

      // creates the directory where this project's files will be saved if not exists
      await mkdirp(
        `${this.fileServer.filePath}/projects/${savedProject.id}`
      );

      // saves the project's pictures and proposal
      logger.info(
        '[Project Service] :: Saving Project cover photo to:',
        coverPhotoPath
      );
      await savePhotoJpgFormat(projectCardPhoto, cardPhotoPath, cardPhotoSize);

      logger.info(
        '[Project Service] :: Saving Project card photo to:',
        cardPhotoPath
      );
      await savePhotoJpgFormat(
        projectCoverPhoto,
        coverPhotoPath,
        coverPhotoSize
      );

      logger.info(
        '[Project Service] :: Saving pitch proposal to:',
        pitchProposalPath
      );
      await projectProposal.mv(pitchProposalPath);

      if (projectAgreementPath) {
        logger.info(
          '[Project Service] :: Saving project agreement to:',
          projectAgreementPath
        );
        await projectAgreement.mv(projectAgreementPath);
      }

      logger.info(
        '[Milestone Service] :: Saving Milestone excel to:',
        milestonesPath
      );

      // saves the milestones excel file and reads it
      await projectMilestones.mv(milestonesPath);

      logger.info(
        '[Project Service] :: All files saved to:',
        `${this.fileServer.filePath}/projects/${savedProject.id}`
      );

      const savedCoverPhoto = await this.photoService.savePhoto(coverPhotoPath);
      if (savedCoverPhoto && savedCoverPhoto != null) {
        savedProject.coverPhoto = savedCoverPhoto.id;
      }

      const savedCardPhoto = await this.photoService.savePhoto(cardPhotoPath);
      if (savedCardPhoto && savedCardPhoto != null) {
        savedProject.cardPhoto = savedCardPhoto.id;
      }

      savedProject.pitchProposal = pitchProposalPath;
      savedProject.projectAgreement = projectAgreementPath;
      savedProject.milestonesFile = milestonesPath;

      // updates project to include its files' path

      logger.info(
        '[Project Service] :: Creating Milestones for Project ID:',
        savedProject.id
      );

      const milestones = await this.milestoneService.createMilestones(
        milestonesPath,
        savedProject.id
      );

      if (isEmpty(milestones.errors)) {
        const userOwner = await this.userDao.getUserById(ownerId);
        fastify.eth.createProject({
          projectId: savedProject.id,
          seAddress: userOwner.address,
          projectName: savedProject.projectName,
          milestonesCount: milestones.length
        });
      }

      logger.info('[Project Service] :: Updating project:', savedProject);
      const updatedProject = await this.projectDao.updateProject(
        savedProject,
        savedProject.id
      );
      logger.info('[Project Service] :: Project Updated:', updatedProject);

      response.project = updatedProject;
      response.milestones = milestones;

      return response;
    } catch (err) {
      logger.error('[Project Service] :: Error creating Project:', err);
      // throw Error('Error creating Project');
      throw new ProjectNotCreated('Error creating Project');
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

  checkPhotoSize(photo) {
    return photo.size < MAX_PHOTO_SIZE;
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
  async updateProject(project, projectCoverPhoto, projectCardPhoto, id, user) {
    try {
      const newProject = Object.assign({}, JSON.parse(project));
      logger.info('[Project Service] :: Updating project:', newProject);

      // remove fields that shouldn't be updated
      delete newProject.pitchProposal;
      delete newProject.projectAgreement;
      delete newProject.milestonesFile;
      delete newProject.transactionHash;
      delete newProject.creationTransactionHash;

      const currentProject = await this.projectDao.getProjectById({ projectId: id });
      if (!currentProject) {
        logger.error(
          `[Project Service] :: Project ID ${id} does not exist`
        );
        return {
          status: 404,
          error: 'Project does not exist'
        };
      }

      if (newProject.status) {
        if (newProject.status === projectStatus.IN_PROGRESS) {
          const startedProject = await this.startProject(currentProject);
          if (startedProject.error) {
            return startedProject;
          }
          logger.info(
            '[Project Service] :: Project started:',
            startedProject
          );
          delete newProject.status;
        } else if (user.role.id !== userRoles.BO_ADMIN) {
          logger.error(
            '[Project Service] :: Could not change project status. User is not an admin'
          );
          return {
            status: 403,
            error: 'User needs admin privileges to perform this action'
          };
        }
      }

      if (
        currentProject.status === projectStatus.IN_PROGRESS ||
        currentProject.startBlockchainStatus !== blockchainStatus.PENDING
      ) {
        logger.error(
          "[Project Service] :: Can't update project IN PROGRESS or SENT to the blockchain",
          id
        );
        return {
          status: 409,
          error:
            'Project cannot be updated. It has already started or sent to the blockchain.'
        };
      }

      if (projectCardPhoto || projectCoverPhoto) {
        // get current photos
        const projectPhotos = await this.projectDao.getProjectPhotos(id);
        // create files' path
        addPathToFilesProperties({
          projectId: id,
          coverPhoto: projectCoverPhoto,
          cardPhoto: projectCardPhoto
        });

        // creates the directory where this project's files will be saved if not exists
        await mkdirp(`${this.fileServer.filePath}/projects/${id}`);

        // saves the project's pictures
        if (projectCoverPhoto) {
          const currentCoverPhoto = await this.photoService.getPhotoById(
            projectPhotos.coverPhoto
          );
          const coverPhotoPath = projectCoverPhoto.path;
          logger.info(
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
          if (!currentCoverPhoto.error) {
            const updatedCoverPhoto = await this.photoService.updatePhoto(
              projectPhotos.coverPhoto,
              coverPhotoPath
            );
            if (updatedCoverPhoto && updatedCoverPhoto != null) {
              newProject.coverPhoto = updatedCoverPhoto.id;
            }
          } else {
            const savedCoverPhoto = await this.photoService.savePhoto(
              coverPhotoPath
            );
            if (savedCoverPhoto && savedCoverPhoto != null) {
              newProject.coverPhoto = savedCoverPhoto.id;
            }
          }
        }

        if (projectCardPhoto) {
          const currentCardPhoto = await this.photoService.getPhotoById(
            projectPhotos.cardPhoto
          );
          const cardPhotoPath = projectCardPhoto.path;
          logger.info(
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
          if (!currentCardPhoto.error) {
            const updatedCardPhoto = await this.photoService.updatePhoto(
              projectPhotos.cardPhoto,
              cardPhotoPath
            );
            if (updatedCardPhoto && updatedCardPhoto != null) {
              newProject.cardPhoto = updatedCardPhoto.id;
            }
          } else {
            const savedCardPhoto = await this.photoService.savePhoto(cardPhotoPath);
            if (savedCardPhoto && savedCardPhoto != null) {
              newProject.cardPhoto = savedCardPhoto.id;
            }
          }
        }

        logger.info(
          '[Project Service] :: All files saved to:',
          `${this.fileServer.filePath}/projects/${id}`
        );
      }

      logger.info('[Project Service] :: Updating project:', newProject);
      const savedProject = await this.projectDao.updateProject(newProject, id);
      logger.info('[Project Service] :: Project Updated:', savedProject);

      if (!savedProject || savedProject == null) {
        logger.error(
          `[Project Service] :: Project ID ${id} does not exist`,
          savedProject
        );
        return {
          status: 404,
          error: 'Project does not exist'
        };
      }

      logger.info('[Project Service] :: Project updated:', savedProject);

      return savedProject;
    } catch (error) {
      logger.error('[Project Service] :: Error updating Project:', error);
      throw Error('Error updating Project');
    }
  },

  async getProjectList() {
    const projects = await this.projectDao.getProjecListWithStatusFrom({
      status: projectStatus.PENDING_APPROVAL
    });
    return projects;
  },

  /**
   * Returns a list of active projects, with status == 1
   */
  async getActiveProjectList() {
    const projects = await this.projectDao.getProjecListWithStatusFrom({
      status: projectStatus.PUBLISHED
    });
    return projects;
  },

  /**
   * Returns a list of projects with limited info for preview
   */
  async getProjectsPreview() {
    const projects = await this.projectDao.getProjecListWithStatusFrom({
      status: projectStatus.PUBLISHED
    });

    // TODO : refactor
    projects.map(async project => {
      const {
        milestoneProgress,
        hasOpenMilestones
      } = await this.milestoneService.getMilestonePreviewInfoOfProject(project);
      return {
        ...project,
        milestoneProgress,
        hasOpenMilestones
      };
    });

    return projects;
  },

  async getProjectWithId({ projectId }) {
    try {
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project) {
        logger.error('[Project Service] :: Project not found:', projectId);
        return { error: 'Project not found', status: 404 };
      }

      const totalFunded = await this.getTotalFunded(projectId);
      project.totalFunded = totalFunded;

      return project;
    } catch (error) {
      logger.error('[Project Service] :: Error getting project:', error);
      throw Error('Error getting project');
    }
  },

  async deleteProject({ projectId }) {
    const projectDeleted = await this.projectDao.deleteProject({ projectId });
    return projectDeleted;
  },

  async getProjectMilestones(projectId) {
    const projectMilestones = await this.projectDao.getProjectMilestones({
      projectId
    });

    const milestones = [];

    await forEachPromise(
      projectMilestones,
      (milestone, context) =>
        new Promise(resolve => {
          process.nextTick(async () => {
            const milestoneActivities = await this.milestoneService.getMilestoneActivities(
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
          logger.error(
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

      logger.error(
        `[Project Service] :: Milestones template file could not be found in ${filepath}`
      );
      return {
        error: 'ERROR: Milestones template file could not be found',
        status: 404
      };
    } catch (error) {
      logger.error(
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
          logger.error(
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

      logger.error(
        `[Project Service] :: Project proposal template file could not be found in ${filepath}`
      );
      return {
        error: 'ERROR: Project proposal template file could not be found',
        status: 404
      };
    } catch (error) {
      logger.error(
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
    const milestonesFilePath = await this.projectDao.getProjectMilestonesFilePath(
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
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        logger.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      // creates the directory where this project's agreement will be saved if not exists
      // (it should've been created during the project creation though)
      mkdirp(`${this.fileServer.filePath}/projects/${project.id}`);

      const filename = `agreement${path.extname(projectAgreement.name)}`;

      // saves the project's agreement
      logger.info(
        '[Project Service] :: Saving Project agreement to:',
        `${this.fileServer.filePath}/projects/${
          project.id
        }/${filename}`
      );
      await projectAgreement.mv(
        `${this.fileServer.filePath}/projects/${
          project.id
        }/${filename}`
      );

      // update database
      const projectAgreementPath = `${
        this.fileServer.filePath
      }/projects/${project.id}/${filename}`;

      const updatedProject = await this.projectDao.updateProjectAgreement({
        projectAgreement: projectAgreementPath,
        projectId: project.id
      });

      logger.info(
        '[Project Service] :: Project successfully updated:',
        updatedProject
      );

      return updatedProject;
    } catch (error) {
      logger.error(
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
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        logger.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      if (
        !project.projectAgreement ||
        project.projectAgreement == null ||
        isEmpty(project.projectAgreement)
      ) {
        logger.error(
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
        logger.error(
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
      logger.error('[Project Service] :: Error getting agreement:', error);
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
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project || project == null) {
        logger.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return { error: 'ERROR: Project not found', status: 404 };
      }

      if (
        !project.pitchProposal ||
        project.pitchProposal == null ||
        isEmpty(project.pitchProposal)
      ) {
        logger.error(
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
        logger.error(
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
      logger.error(
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
    logger.info(
      '[Project Service] :: Getting already funded amount for Project ID',
      projectId
    );

    try {
      const totalAmount = await this.transferService.getTotalFundedByProject(
        projectId
      );

      logger.info(
        `[Project Service] :: Total funded amount for Project ID ${projectId} is ${totalAmount}`
      );
      return totalAmount;
    } catch (error) {
      logger.error(
        '[Project Service] :: Error getting funded amount:',
        error
      );
      throw Error('Error getting funded amount');
    }
  },

  /**
   * Changes the status of a PUBLISHED project to IN_PROGRESS
   *
   * @param {object} project
   * @returns updated project || error
   */
  async startProject(project) {
    logger.info(
      `[Project Service] :: Updating Project ID ${
        project.id
      } status to In Progress`
    );

    try {
      if (
        project.status !== projectStatus.PUBLISHED &&
        project.status !== projectStatus.IN_PROGRESS
      ) {
        logger.error(
          `[Project Service] :: Project ID ${project.id} is not published`
        );
        return { error: 'Project needs to be published', status: 409 };
      }

      if (
        project.status === projectStatus.IN_PROGRESS ||
        project.startBlockchainStatus !== blockchainStatus.PENDING
      ) {
        logger.error(
          `[Project Service] :: Project ID ${
            project.id
          } already in progress or sent to the blockchain`
        );
        return {
          error: 'Project has already started or sent to the blockchain',
          status: 409
        };
      }

      const projectWithOracles = await this.isFullyAssigned(project.id);
      if (!projectWithOracles) {
        logger.error(
          `[Project Service] :: Project ID ${
            project.id
          } has activities with no oracles assigned`
        );
        return {
          error: 'Project has activities with no oracles assigned',
          status: 409
        };
      }

      logger.info(
        `[Project Service] :: Starting milestones on blockchain of project Project ID ${
          project.id
        }`
      );
      await this.milestoneService.startMilestonesOfProject(project);
      const startPendingProject = await this.projectDao.updateStartBlockchainStatus(
        project.id,
        blockchainStatus.SENT
      );
      return startPendingProject;
    } catch (error) {
      logger.error('[Project Service] :: Error starting project:', error);
      throw Error('Error starting project');
    }
  },

  /**
   * Receive a project id and return a boolean if all activities of that project
   * has an oracle assigned
   * @param {number} projectId
   */
  async isFullyAssigned(projectId) {
    let isFullyAssigned = true;
    const milestones = await this.milestoneService.getMilestonesByProject(projectId);

    if (!milestones || milestones == null || isEmpty(milestones)) {
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
    logger.info(
      '[Project Service] :: Getting Projects for Oracle ID',
      oracleId
    );
    try {
      const projects = await this.milestoneService.getProjectsAsOracle(oracleId);
      if (projects.error) {
        return projects;
      }

      const uniqueProjects = uniq(projects);
      logger.info(
        `[Project Service] :: Projects found for Oracle ID ${oracleId}: ${uniqueProjects}`
      );
      return { projects: uniqueProjects, oracle: oracleId };
    } catch (error) {
      logger.error('[Project Service] :: Error getting Projects:', error);
      throw Error('Error getting Projects');
    }
  },

  /**
   * Receive a project id and return a user object who is owner of
   * that project
   * @param {number} projectId
   */
  async getProjectOwner(projectId) {
    try {
      // TODO : this can be done with a single query.
      const project = await this.projectDao.getProjectById({ projectId });
      const user = await this.userDao.getUserById(project.ownerId);
      return user;
    } catch (error) {
      throw Error('Error getting project owner');
    }
  },

  /**
   * Receive id of a project and return a boolean if project is already
   * confirmed on blockchain
   * [Only for project creation transaction]
   * @param {number} projectId
   */
  async isProjectTransactionConfirmed(projectId) {
    try {
      const project = await this.projectDao.getProjectById({ projectId });
      return fastify.eth.isTransactionConfirmed(project.transactionHash);
    } catch (error) {
      throw Error('Error getting confirmation of transaction');
    }
  },

  /**
   * Receive id of a user and return an array of project objects
   * created by that user
   * @param {number} ownerId
   */
  async getProjectsOfOwner(ownerId) {
    try {
      const projects = await this.projectDao.getProjectsByOwner(ownerId);
      return projects;
    } catch (error) {
      return {
        status: 500,
        error: `Error getting Projects of owner: ${ownerId}`
      };
    }
  },

  /**
   * Receive an array of project ids and return an array of project
   * objects corresponding to these ids
   * @param {array} projectsId
   */
  async getAllProjectsById(projectsId) {
    return this.projectDao.getAllProjectsById(projectsId);
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
    logger.info(
      `[Project Service] :: Uploading experience to Project ID ${projectId}:`,
      experience,
      files
    );

    try {
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project) {
        logger.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return {
          status: 404,
          error: 'Project not found'
        };
      }

      const user = await this.userDao.getUserById(experience.user);

      if (!user) {
        logger.error(
          `[Project Service] :: User ID ${experience.user} not found`
        );
        return {
          status: 404,
          error: 'User not found'
        };
      }

      const newExperience = { ...experience, project: projectId };

      const savedExperience = await this.projectExperienceDao.saveProjectExperience(
        newExperience
      );

      if (!savedExperience) {
        logger.error(
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
      logger.error(
        '[Project Service] :: Error uploading experience:',
        error
      );
      throw Error('Error uploading experience');
    }
  },

  async saveExperienceFile(file, projectId, projectExperienceId, index) {
    const filetype = mime.lookup(file.name);

    if (!filetype) {
      logger.error(
        '[Project Service] :: Error getting mime type of file:',
        file
      );
      return { error: 'Error uploading file', status: 409 };
    }

    if (!filetype.includes('image/')) {
      logger.error('[Project Service] :: File type is invalid:', file);
      return { error: 'File type is invalid', status: 409 };
    }

    logger.info('[Project Service] :: Saving file:', file);

    const filename = addTimestampToFilename(file.name);

    const filepath = `${
      this.fileServer.filePath
    }/projects/${projectId}/experiences/${filename}`;

    if (fs.existsSync(filepath)) {
      filepath.concat(`-${index}`);
    }

    await mkdirp(
      `${this.fileServer.filePath}/projects/${projectId}/experiences`
    );
    await file.mv(filepath);

    try {
      const savedFile = await this.photoService.savePhoto(
        filepath,
        projectExperienceId
      );
      logger.info('[Project Service] :: File saved in', filepath);
      return savedFile;
    } catch (error) {
      logger.error(
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
    logger.info(
      `[Project Service] :: Getting experiences of Project ID ${projectId}`
    );

    try {
      const project = await this.projectDao.getProjectById({ projectId });

      if (!project) {
        logger.error(
          `[Project Service] :: Project ID ${projectId} not found`
        );
        return {
          status: 404,
          error: 'Project not found'
        };
      }

      const experiences = await this.projectExperienceDao.getExperiencesByProject(
        projectId
      );

      if (!experiences) {
        logger.error(
          `[Project Service] :: Error getting the experiences for project ID ${projectId}`
        );
        return {
          status: 500,
          error: 'There was an error getting the project experiences'
        };
      }

      if (isEmpty(experiences)) {
        logger.info(
          `[Project Service] :: Project ID ${projectId} does not have any experiences uploaded`
        );
      }

      return experiences;
    } catch (error) {
      logger.error(
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
    return this.projectDao.updateBlockchainStatus(projectId, status);
  },

  async allActivitiesAreConfirmed(projectId, activityDao) {
    try {
      const milestones = await this.getProjectMilestones(projectId);
      const activitiesIds = [];
      milestones.forEach(milestone => {
        milestone.activities.forEach(activity => {
          activitiesIds.push(activity.id);
        });
      });
      const activities = await activityDao.whichUnconfirmedActivities(
        activitiesIds
      );
      return isEmpty(activities);
    } catch (error) {
      return { error };
    }
  }
};
