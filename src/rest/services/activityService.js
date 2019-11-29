/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { values, isEmpty } = require('lodash');
const mkdirp = require('mkdirp-promise');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const sha256 = require('sha256');
const { promisify } = require('util');
const { forEachPromise } = require('../util/promises');
const { evidenceFileTypes, userRoles } = require('../util/constants');
const {
  activityStatus,
  blockchainStatus,
  projectStatus
} = require('../util/constants');
const apiHelper = require('./helper');

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
  readFile: promisify(fs.readFile),
  /**
   * Creates an Activity for an existing Milestone
   *
   * @param {object} activity
   * @param {number} milestoneId
   * @returns new activity | error message
   */
  async createActivity(activity, milestoneId) {
    try {
      logger.info(
        `[Activity Service] :: Creating a new Activity for Milestone ID ${milestoneId}: `,
        activity
      );
      // TODO: should verify milestone existence and project status ????

      if (this.verifyActivity(activity)) {
        const savedActivity = await this.activityDao.saveActivity(
          activity,
          milestoneId
        );

        logger.info('[Activity Service] :: Activity created:', savedActivity);

        return savedActivity;
      }

      logger.error('[Activity Service] :: Activity not valid', activity);
      return {
        status: 409,
        error: 'Activity is missing mandatory fields'
      };
    } catch (error) {
      logger.error('[Activity Service] :: Error creating Activity:', error);
      return { status: 500, error: 'Error creating Activity' };
    }
  },

  /**
   * Creates new Activities and associates them to the Milestone passed by parameter.
   *
   * Returns an array with all the Activities created.
   * @param {array} activities
   * @param {number} milestoneId
   */
  async createActivities(activities, milestoneId) {
    logger.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!values(activity).every(isEmpty)) {
            console.log('activity', activity);
            const savedActivity = await this.activityDao.saveActivity(
              activity,
              milestoneId
            );
            logger.info(
              '[Activity Service] :: Activity created:',
              savedActivity
            );
            context.push(savedActivity);
          }
          resolve();
        });
      });

    await forEachPromise(activities, createActivity, savedActivities);
    return savedActivities;
  },

  /**
   * Updates an Activity
   *
   * @param {object} activity
   * @param {number} id
   */
  async updateActivity(newActivity, id) {
    try {
      const activity = await this.activityDao.getActivityById(id);
      if (!activity) {
        logger.error(`[Activity Service] Activity ${id} doesn't exist`);
        return { error: "Activity doesn't exist", status: 404 };
      }

      const project = await this.getProjectByActivity(activity);

      if (project.error) {
        return project;
      }

      if (
        project.status === projectStatus.IN_PROGRESS ||
        project.startBlockchainStatus !== blockchainStatus.PENDING
      ) {
        logger.error(
          `[Activity Service] :: Project ${
            project.id
          } is IN PROGRESS or sent to the blockchain`
        );
        return {
          error:
            'Activity cannot be updated. Project has already started or sent to the blockchain.',
          status: 409
        };
      }

      if (this.canActivityUpdate(newActivity)) {
        logger.info('[Activity Service] :: Updating activity:', newActivity);

        const savedActivity = await this.activityDao.updateActivity(
          newActivity,
          id
        );

        if (!savedActivity || savedActivity == null) {
          logger.error(
            `[Activity Service] :: Could not update Activity ID ${id}`,
            savedActivity
          );
          return {
            status: 409,
            error: ' Could not update Activity'
          };
        }

        logger.info('[Activity Service] :: Activity updated:', savedActivity);

        return savedActivity;
      }

      logger.error('[Activity Service] :: Activity not valid', newActivity);
      return {
        status: 409,
        error: 'Activity has empty mandatory fields'
      };
    } catch (error) {
      logger.error('[Activity Service] :: Error updating Activity:', error);
      return { status: 500, error: 'Error updating Activity' };
    }
  },

  /**
   * Updates the status of an activity
   *
   * @param {integer} status activity status
   * @param {integer} id activity id
   * @returns updated activity | error
   */
  async updateStatus(status, id) {
    try {
      logger.info('[Activity Service] :: Updating activity status');
      const activity = await this.activityDao.getActivityById(id);
      if (!activity) {
        logger.error(`[Activity Service] :: Activity ${id} doesn't exist`);
        return { error: "Activity doesn't exist", status: 404 };
      }

      const project = await this.getProjectByActivity(activity);

      if (project.error) {
        return project;
      }

      if (project.status !== projectStatus.IN_PROGRESS) {
        logger.error(
          `[Activity Service] :: Project ${project.id} is not IN PROGRESS`
        );
        return {
          error: 'Activity status cannot be updated. Project is not started.',
          status: 409
        };
      }

      if (status === activityStatus.COMPLETED) {
        const completedActivity = await this.completeActivity(activity);
        return completedActivity;
      }

      const savedActivity = await this.activityDao.updateStatus(id, status);

      if (!savedActivity || savedActivity == null) {
        logger.error(
          `[Activity Service] :: Could not update Activity ID ${id}`,
          savedActivity
        );
        return {
          status: 409,
          error: ' Could not update Activity status'
        };
      }

      logger.info(
        '[Activity Service] :: Activity status updated:',
        savedActivity
      );

      return savedActivity;
    } catch (error) {
      logger.error(
        '[Activity Service] :: Error updating Activity status:',
        error
      );
      throw Error('Error updating Activity status');
    }
  },

  // /**
  //  * Sends the activity to be validated on the blockchain
  //  *
  //  * @param {object} activity
  //  * @returns activity | error
  //  */
  // async completeActivity(activity) {
  //   try {
  //     logger.error(
  //       `[Activity Service] Completing Activity ID ${activity.id}`
  //     );

  //     if (activity.blockchainStatus !== blockchainStatus.CONFIRMED) {
  //       logger.error(
  //         `[Activity Service] Activity ${
  //           activity.id
  //         } is not confirmed on the blockchain`
  //       );
  //       return {
  //         error:
  //           'Activity must be confirmed on the blockchain to mark as completed',
  //         status: 409
  //       };
  //     }

  //     const oracle = await oraclethis.activityDao.getOracleFromActivity(activity.id);
  //     const validatedTransactionHash = await fastify.eth.validateActivity(
  //       oracle.user.address,
  //       oracle.user.pwd,
  //       { activityId: activity.id }
  //     );

  //     if (!validatedTransactionHash) {
  //       logger.error(
  //         `[Activity Service] Activity ${
  //           activity.id
  //         } could not be validated on the blockchain`
  //       );
  //       return {
  //         error: 'Activity could not be validated on the blockchain',
  //         status: 409
  //       };
  //     }

  //     const validatedActivity = await this.activityDao.updateActivity({
  //       validatedTransactionHash
  //     });

  //     return validatedActivity;
  //   } catch (error) {
  //     logger.error(
  //       '[Activity Service] :: Activity could not be validated on the blockchain:',
  //       error
  //     );
  //     throw Error('Error validating activity');
  //   }
  // },

  async getProjectByActivity(activity) {
    const { projectService, milestoneService } = apiHelper.helper.services;
    const milestone = await milestoneService.getMilestoneById(
      activity.milestone
    );
    if (!milestone) {
      logger.error(
        `[Activity Service] :: Milestone ${milestone.id} doesn't exist`
      );
      return { error: "Milestone doesn't exist", status: 404 };
    }

    const project = await projectService.getProjectWithId({
      projectId: milestone.project
    });
    if (!project) {
      logger.error(`[Activity Service] :: Project ${project.id} doesn't exist`);
      return { error: "Project doesn't exist", status: 404 };
    }

    return project;
  },

  /**
   * Uploads a list of evidence files for an activity
   *
   * @param {number} activityId
   * @param {array} files
   * @returns success | errors
   */
  async addEvidenceFiles(activityId, files, user) {
    const errors = [];
    logger.info(
      '[Activity Service] :: Uploading evidence files for activity ID',
      activityId
    );
    try {
      const activity = await this.activityDao.getActivityById(activityId);
      if (!activity) {
        logger.error(
          `[Activity Service] :: Activity ${activityId} doesn't exist`
        );
        return { error: "Activity doesn't exist", status: 404 };
      }

      const project = await this.getProjectByActivity(activity);

      if (project.error) {
        return project;
      }

      if (project.status !== projectStatus.IN_PROGRESS) {
        logger.error(
          `[Activity Service] :: Project ${project.id} is not IN PROGRESS`
        );
        return {
          error:
            'Activity evidence cannot be uploaded. Project is not started.',
          status: 409
        };
      }

      // creates the directory where this activities' evidence files will be saved if not exists
      await mkdirp(
        `${
          fastify.configs.fileServer.filePath
        }/activities/${activityId}/evidence`
      );
      const hashes = [];
      if (files.length && files.length > 0) {
        await Promise.all(
          files.map(async file => {
            const addedEvidence = await this.addEvidence(activityId, file);
            if (addedEvidence.error) {
              errors.push({
                error: addedEvidence.error,
                file: file.name
              });
            } else {
              hashes.push(addedEvidence.fileHash);
            }
          })
        );
      } else {
        const addedEvidence = await this.addEvidence(activityId, files);
        if (addedEvidence.error) {
          errors.push({
            error: addedEvidence.error,
            file: files.name
          });
        } else {
          hashes.push(addedEvidence.fileHash);
        }
      }
      const userInfo = await this.userService.getUserById(user.id);
      await fastify.eth.uploadHashEvidenceToActivity({
        sender: userInfo.address,
        privKey: userInfo.privKey,
        activityId,
        hashes
      });
    } catch (error) {
      logger.error(
        '[Activity Service] :: There was an error uploading the evidence:',
        error
      );
      return {
        error: 'There was an error uploading the evidence',
        status: 500
      };
    }

    if (errors.length > 0) {
      return { errors };
    }
    return { success: 'The evidence was successfully uploaded!' };
  },

  /**
   * Uploads an activity's evidence file and creates the record in the database
   *
   * @param {number} activityId
   * @param {*} file
   * @returns saved evidence | error message
   */
  async addEvidence(activityId, file) {
    logger.info(
      '[Activity Service] :: Adding evidence to Activity ID',
      activityId
    );
    // verify activity exists
    try {
      const activity = await this.activityDao.getActivityById(activityId);
      if (!activity || activity == null) {
        logger.error(
          `[Activity Service] :: Activity ID ${activityId} could not be found`
        );
        return { error: 'Activity could not be found', status: 404 };
      }

      logger.info('[Activity Service] :: Checking evidences file types');
      if (
        !file ||
        (!this.fileService.checkEvidenceFileType(file) &&
          !this.photoService.checkEvidencePhotoType(file))
      ) {
        logger.error('[Project Service] :: Wrong file type for Evidence', file);
        return {
          error: 'Invalid file type for the uploaded Evidence'
        };
      }

      // creates the directory where this activities' evidence files will be saved if not exists
      await mkdirp(
        `${
          fastify.configs.fileServer.filePath
        }/activities/${activityId}/evidence`
      );

      // uploading file
      const filepath = `${fastify.configs.fileServer.filePath}/activities/${
        activity.id
      }/evidence/${file.name}`;
      await file.mv(filepath);

      // getting file hash
      const fileBuffer = await this.readFile(filepath);
      const fileHash = sha256(fileBuffer);

      // check file type
      const filetype = mime.lookup(filepath);
      if (!filetype) {
        logger.error(
          '[Activity Service] :: Error getting mime type of file:',
          filepath
        );
        return { error: 'Error uploading evidence', status: 409 };
      }

      if (filetype.includes('image/')) {
        // save photo
        const savedPhoto = await this.photoService.savePhoto(filepath);
        if (!savedPhoto || savedPhoto == null) {
          logger.error(
            '[Activity Service] :: Error saving photo to database:',
            filepath
          );
          return { error: 'Error uploading evidence', status: 409 };
        }

        const savedActivityPhoto = await this.activityPhotoDao.saveActivityPhoto(
          activity.id,
          savedPhoto.id,
          fileHash
        );

        if (!savedActivityPhoto || savedActivityPhoto == null) {
          logger.error(
            `[Activity Service] :: Error associating photo ${filepath} to Activity ID ${
              activity.id
            }`
          );

          logger.info('[Activity Service] :: Rolling back Operation');
          const deletedPhoto = await this.photoService.deletePhoto(
            savedPhoto.id
          );

          if (deletedPhoto && deletedPhoto.error) {
            logger.error(
              `[Activity Service] :: Photo ID ${
                savedPhoto.id
              } could not be deleted`
            );
          }
        }

        logger.info(
          '[Activity Service] :: Evidence added to activity:',
          savedActivityPhoto
        );
        return savedActivityPhoto;
      }
      // if not a photo
      // save file
      const savedFile = await this.fileService.saveFile(filepath);
      if (!savedFile || savedFile == null) {
        logger.error(
          '[Activity Service] :: Error saving file to database:',
          filepath
        );
        return { error: 'Error uploading evidence', status: 409 };
      }

      const savedActivityFile = await this.activityFileDao.saveActivityFile(
        activity.id,
        savedFile.id,
        fileHash
      );

      if (!savedActivityFile || savedActivityFile == null) {
        logger.error(
          `[Activity Service] :: Error associating file ${filepath} to Activity ID ${
            activity.id
          }`
        );

        logger.info('[Activity Service] :: Rolling back Operation');
        const deletedFile = await this.fileService.deleteFile(savedFile.id);

        if (deletedFile && deletedFile.error) {
          logger.error(
            `[Activity Service] :: File ID ${savedFile.id} could not be deleted`
          );
        }
      }

      logger.info(
        '[Activity Service] :: Evidence added to activity:',
        savedActivityFile
      );
      return savedActivityFile;
    } catch (error) {
      logger.error(
        `[Activity Service] :: There was an error uploading the evidence to Activity ID  ${activityId}:`,
        error
      );
      throw Error('Error uploading evidence');
    }
  },

  /**
   * Deletes an evidence of an activity
   *
   * @param {number} activityId
   * @param {number} evidenceId
   * @param {string} fileType 'Photo' | 'File'
   * @returns success | error message
   */
  async deleteEvidence(activityId, evidenceId, fileType) {
    try {
      // need type to know if it's a photo or another type of file
      if (fileType === evidenceFileTypes.PHOTO) {
        logger.info(
          `[Activity Service] :: Getting relation for Activity ${activityId} and Photo ${evidenceId}`
        );
        const activityPhoto = await this.activityPhotoDao.getActivityPhotoByActivityAndPhoto(
          activityId,
          evidenceId
        );

        if (!activityPhoto || activityPhoto == null) {
          logger.error(
            `[Activity Service] :: Relation could not be found for Activity ${activityId} and Photo ${evidenceId}`
          );
          return {
            error: 'Evidence for this activity could not be found',
            status: 404
          };
        }

        logger.info(
          `[Activity Service] :: Deleting Activity-Photo relation: ${activityPhoto}`
        );

        // deletes relation activity-photo
        const deletedActivityPhoto = await this.activityPhotoDao.deleteActivityPhoto(
          activityPhoto.id
        );
        if (!deletedActivityPhoto || deletedActivityPhoto == null) {
          logger.error(
            `[Activity Service] :: Activity-Photo ID ${
              activityPhoto.id
            } could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }

        logger.info(`[Activity Service] :: Deleting Photo ID: ${evidenceId}`);

        // deletes photo from Photo table and file in server
        const deletedPhoto = await this.photoService.deletePhoto(evidenceId);
        if (deletedPhoto && deletedPhoto.error) {
          logger.error(
            `[Activity Service] :: Photo ID ${evidenceId} could not be deleted`
          );
          return deletedPhoto;
        }
      } else if (fileType === evidenceFileTypes.FILE) {
        logger.info(
          `[Activity Service] :: Getting relation for Activity ${activityId} and File ${evidenceId}`
        );
        const activityFile = await this.activityFileDao.getActivityFileByActivityAndFile(
          activityId,
          evidenceId
        );

        if (!activityFile || activityFile == null) {
          logger.error(
            `[Activity Service] :: Relation could not be found for Activity ${activityId} and File ${evidenceId}`
          );
          return {
            error: 'Evidence for this activity could not be found',
            status: 404
          };
        }

        logger.info(
          `[Activity Service] :: Deleting Activity-File relation: ${activityFile}`
        );

        // deletes db relation
        const deletedActivityFile = await this.activityFileDao.deleteActivityFile(
          activityFile.id
        );
        if (!deletedActivityFile || deletedActivityFile == null) {
          logger.error(
            `[Activity Service] :: Activity-File ID ${
              activityFile.id
            } could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }

        logger.info(`[Activity Service] :: Deleting File ID: ${evidenceId}`);

        // deletes record in File table and file in server
        const deletedFile = await this.fileService.deleteFile(evidenceId);
        if (deletedFile && deletedFile.error) {
          logger.error(
            `[Activity Service] :: File ID ${evidenceId} could not be deleted`
          );
          return deletedFile;
        }
      } else {
        logger.error(
          `[Activity Service] :: Wrong file type received: ${fileType}`
        );
        return {
          error: 'Wrong file type',
          status: 400
        };
      }

      return { success: 'Evidence deleted successfully!' };
    } catch (error) {
      logger.error('[Activity Service] :: Error deleting evidence:', error);
      throw Error('There was an error when trying to delete the evidence');
    }
  },

  /**
   * Downloads an evidence
   *
   * @param {number} activityId
   * @param {number} evidenceId
   * @param {string} fileType 'Photo' | 'File'
   * @returns file object | error
   */
  async downloadEvidence(activityId, evidenceId, fileType) {
    try {
      // check if activity exists in database
      const activity = await this.activityDao.getActivityById(activityId);

      if (!activity || activity == null) {
        logger.error(
          `[Activity Service] :: Activity ID ${activityId} not found`
        );
        return { error: 'Activity not found', status: 404 };
      }

      let evidencePath = '';

      // check if activity and evidence are associated
      if (fileType === evidenceFileTypes.PHOTO) {
        const activityPhoto = await this.activityPhotoDao.getActivityPhotoByActivityAndPhoto(
          activityId,
          evidenceId
        );

        if (!activityPhoto || activityPhoto == null) {
          logger.error(
            `[Activity Service] :: Activity ${activityId} - Photo ${evidenceId} relation not found`
          );
          return { error: 'Evidence not found for this activity', status: 404 };
        }

        const photo = await this.photoService.getPhotoById(evidenceId);

        if (photo && photo.error) {
          logger.error(`[Activity Service] :: Photo ${evidenceId} not found`);
          return photo;
        }

        evidencePath = photo.path;
      } else if (fileType === evidenceFileTypes.FILE) {
        const activityFile = await this.activityFileDao.getActivityFileByActivityAndFile(
          activityId,
          evidenceId
        );

        if (!activityFile || activityFile == null) {
          logger.error(
            `[Activity Service] :: Activity ${activityId} - File ${evidenceId} relation not found`
          );
          return { error: 'Evidence not found for this activity', status: 404 };
        }

        const file = await this.fileService.getFileById(evidenceId);

        if (file && file.error) {
          logger.error(`[Activity Service] :: File ${evidenceId} not found`);
          return file;
        }

        evidencePath = file.path;
      } else {
        logger.error(
          `[Activity Service] :: Wrong file type received: ${fileType}`
        );
        return {
          error: 'Wrong file type',
          status: 400
        };
      }
      // read file
      if (evidencePath === '') {
        return { error: 'Evidence not found for this activity', status: 404 };
      }
      const filestream = fs.createReadStream(evidencePath);

      filestream.on('error', error => {
        logger.error(
          `[Activity Service] :: Evidence file ${evidencePath} not found:`,
          error
        );
        return {
          error: 'Evidence file not found',
          status: 404
        };
      });

      const response = {
        filename: path.basename(evidencePath),
        filestream
      };

      return response;
    } catch (error) {
      logger.error('[Activity Service] :: Error downloading evidence:', error);
      throw Error('Error downloading evidence');
    }
  },

  canActivityUpdate(activity) {
    if (
      activity.tasks === '' ||
      activity.impact === '' ||
      activity.impactCriterion === '' ||
      activity.signsOfSuccess === '' ||
      activity.signsOfSuccessCriterion === '' ||
      activity.category === '' ||
      activity.keyPersonnel === '' ||
      activity.budget === ''
    ) {
      return false;
    }
    return true;
  },

  verifyActivity(activity) {
    let valid = true;

    if (
      !activity.tasks ||
      !activity.impact ||
      !activity.impactCriterion ||
      !activity.signsOfSuccess ||
      !activity.signsOfSuccessCriterion ||
      !activity.category ||
      !activity.keyPersonnel ||
      !activity.budget
    ) {
      valid = false;
    }

    return valid;
  },

  /**
   * Delete an activity with id
   * @param {number} activityId
   */
  async deleteActivity(activityId) {
    const { milestoneService } = apiHelper.helper.services;
    const deleted = await this.activityDao.deleteActivity(activityId);
    const milestoneEmpty =
      deleted &&
      !(await milestoneService.milestoneHasActivities(deleted.milestone));
    if (milestoneEmpty)
      await milestoneService.deleteMilestone(deleted.milestone);
    return deleted;
  },

  /**
   * Assigns an oracle to an activity, overwriting existing relation if there is one
   *
   * @param {number} userId
   * @param {number} activityId
   * @returns created record | error
   */
  async assignOracleToActivity(userId, activityId) {
    logger.info(
      `[Activity Service] :: Assigning User ID ${userId} to Activity ID ${activityId}`
    );

    try {
      // check if user is oracle
      const user = await this.userService.getUserById(userId);

      if (!user || user == null) {
        logger.error(`[Activity Service] :: User ID ${userId} not found`);
        return { error: 'User not found', status: 404 };
      }

      if (user.role && user.role.id !== userRoles.ORACLE) {
        logger.error(
          `[Activity Service] :: User ID ${userId} is not an oracle`
        );
        return { error: 'User is not an oracle', status: 409 };
      }

      // check if activity has oracle assigned
      const oracleActivity = await oraclethis.activityDao.getOracleFromActivity(
        activityId
      );

      if (oracleActivity) {
        // if user already assigned then return
        if (oracleActivity.user.id === userId) {
          logger.info(
            '[Activity Service] :: This oracle is already assigned to this Activity',
            oracleActivity
          );
          return oracleActivity;
        }
        // unassign if user is different
        const unassignOracleActivty = await this.unassignOracleToActivity(
          activityId
        );

        if (unassignOracleActivty.error) {
          logger.error(
            `[Activity Service] :: Could not unassign Oracles from Activity ID ${activityId}`
          );
          return unassignOracleActivty;
        }
      }
      // assign user
      const assignedOracle = await oraclethis.activityDao.assignOracleToActivity(
        userId,
        activityId
      );

      if (!assignedOracle || assignedOracle == null) {
        logger.error(
          `[Activity Service] :: Could not assign User ID ${userId} to Activity ID ${activityId}`
        );
        return { error: 'Error assigning user to activity', status: 500 };
      }

      return assignedOracle;
    } catch (error) {
      logger.error(
        '[Activity Service] :: Error assigning user to activity:',
        error
      );
      throw Error('Error assigning user to activity');
    }
  },

  /**
   * Unassigns oracles from an activity
   *
   * @param {number} activityId
   * @returns deleted record | errors
   */
  async unassignOracleToActivity(activityId) {
    logger.info(
      `[Activity Service] :: Unassigning Oracles from Activity ID ${activityId}`
    );

    try {
      const oracleActivity = await oraclethis.activityDao.unassignOracleToActivity(
        activityId
      );

      if (!oracleActivity || oracleActivity == null) {
        logger.error(
          `[Activity Service] :: Could not unassign Oracles from Activity ID ${activityId}`
        );
        return {
          error: 'Could not unassign Oracles from Activity',
          status: 500
        };
      }

      return oracleActivity;
    } catch (error) {
      logger.error(
        '[Activity Service] :: Error unassigning oracles from activity',
        error
      );
      throw Error('Error unassigning oracles from activity');
    }
  },

  /**
   * Get users with oracle role of an activity
   * @param {number} activityId
   */
  getOracleFromActivity(activityId) {
    return oraclethis.activityDao.getOracleFromActivity(activityId);
  },

  async getActivityDetails(activityId) {
    logger.info('[Activity Service] :: Getting activity ID', activityId);
    try {
      // find activity
      const activity = await this.activityDao.getActivityById(activityId);

      if (!activity || activity == null) {
        logger.error(
          `[Activity Service] :: Activity ID: ${activityId} could not be found`
        );
        return {
          error: 'Activity could not be found',
          status: 404
        };
      }
      // find all evidence from
      // activity_file
      logger.info(
        '[Activity Service] :: Getting file evidences for Activity ID',
        activityId
      );

      const activityFiles = await this.activityFileDao.getActivityFileByActivity(
        activityId
      );

      const fileEvidence = [];
      if (activityFiles && activityFiles != null) {
        // add type to each
        activityFiles.map(activityFile =>
          fileEvidence.push({
            ...activityFile,
            fileType: 'File',
            file: activityFile.file.id,
            fileName: path.basename(activityFile.file.path)
          })
        );
      } else {
        logger.info(
          `[Activity Service] :: Activity ID: ${activityId} does not have file evidence`
        );
      }

      // activity_photo
      logger.info(
        '[Activity Service] :: Getting photo evidences for Activity ID',
        activityId
      );

      const activityPhotos = await this.activityPhotoDao.getActivityPhotoByActivity(
        activityId
      );

      const photoEvidence = [];
      if (activityPhotos && activityPhotos != null) {
        // add type to each
        activityPhotos.map(activityPhoto =>
          photoEvidence.push({
            ...activityPhoto,
            fileType: 'Photo',
            photo: activityPhoto.photo.id,
            fileName: path.basename(activityPhoto.photo.path)
          })
        );
      } else {
        logger.info(
          `[Activity Service] :: Activity ID: ${activityId} does not have photo evidence`
        );
      }

      const evidence = [...fileEvidence, ...photoEvidence];

      const oracle = await this.getOracleFromActivity(activityId);

      const activityDetail = { ...activity, evidence, oracle };

      return activityDetail;
    } catch (error) {
      logger.error(
        '[Activity Service] :: Error getting Activity details:',
        error
      );
      throw Error('Error getting Activity details');
    }
  },

  /**
   * Sends the activity to be validated on the blockchain
   *
   * @param {number} activityId
   * @returns activity | error
   */
  async completeActivity(activityId) {
    try {
      const activity = await this.activityDao.getActivityById(activityId);
      if (!activity) {
        logger.error(`[Activity Service] Activity ${activityId} doesnt exists`);
        return { error: 'Activity doesnt exists', status: 404 };
      }
      if (activity.blockchainStatus !== blockchainStatus.CONFIRMED) {
        logger.error(
          `[Activity Service] Activity ${activityId} must be confirmed on blockchain`
        );
        return {
          error: 'Activity must be confirmed on blockchain',
          status: 409
        };
      }
      const oracle = await oraclethis.activityDao.getOracleFromActivity(
        activityId
      );
      await fastify.eth.validateActivity({
        sender: oracle.user.address,
        privKey: oracle.user.privKey,
        activityId
      });
      return activity;
    } catch (error) {
      logger.error('[Activity Service] :: Error completing activity:', error);
      throw Error('Error completing activity');
    }
  },

  /**
   * Returns an array of the milestones' id that an oracle
   * has any of its activities assigned
   *
   * @param {number} oracleId
   * @returns array of milestone ids | error
   */
  async getMilestonesAsOracle(oracleId) {
    logger.info(
      '[Activity Service] :: Getting Activities for Oracle ID',
      oracleId
    );
    try {
      const milestones = [];
      const oracleActivities = await oraclethis.activityDao.getActivitiesByOracle(
        oracleId
      );

      if (!oracleActivities || oracleActivities == null) {
        logger.error(
          `[Activity Service] :: Oracle ID ${oracleId} doesn't have any activities assigned`
        );
        return {
          error: 'Oracle does not have any activities assigned',
          status: 404
        };
      }

      await oracleActivities.forEach(oracleActivity => {
        if (milestones.indexOf(oracleActivity.activity.milestone) === -1) {
          milestones.push(oracleActivity.activity.milestone);
        }
      });

      return milestones;
    } catch (error) {
      logger.error('[Activity Service] :: Error getting Activities:', error);
      throw Error('Error getting Activities');
    }
  },

  async updateBlockchainStatus(activityId, status) {
    if (!Object.values(blockchainStatus).includes(status)) {
      return { error: 'Invalid Blockchain status' };
    }
    return this.activityDao.updateBlockchainStatus(activityId, status);
  }
};
