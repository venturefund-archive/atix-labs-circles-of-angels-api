const { values, isEmpty } = require('lodash');
const mkdirp = require('mkdirp-promise');
const mime = require('mime-types');
const { forEachPromise } = require('../util/promises');
const configs = require('../../../config/configs');

const activityService = ({
  fastify,
  activityDao,
  fileService,
  photoService,
  activityFileDao,
  activityPhotoDao,
  oracleActivityDao
}) => ({
  /**
   * Creates an Activity for an existing Milestone
   *
   * @param {object} activity
   * @param {number} milestoneId
   * @returns new activity | error message
   */
  async createActivity(activity, milestoneId) {
    try {
      fastify.log.info(
        `[Activity Service] :: Creating a new Activity for Milestone ID ${milestoneId}: `,
        activity
      );
      // TODO: should verify milestone existence and project status ????

      if (this.verifyActivity(activity)) {
        const savedActivity = await activityDao.saveActivity(
          activity,
          milestoneId
        );

        fastify.log.info(
          '[Activity Service] :: Activity created:',
          savedActivity
        );

        return savedActivity;
      }

      fastify.log.error('[Activity Service] :: Activity not valid', activity);
      return {
        status: 409,
        error: 'Activity is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: Error creating Activity:',
        error
      );
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
    fastify.log.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!values(activity).every(isEmpty)) {
            const savedActivity = await activityDao.saveActivity(
              activity,
              milestoneId
            );
            fastify.log.info(
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
  async updateActivity(activity, id) {
    try {
      fastify.log.info('[Activity Service] :: Updating activity:', activity);

      if (this.verifyActivity(activity)) {
        const savedActivity = await activityDao.updateActivity(activity, id);

        if (!savedActivity || savedActivity == null) {
          fastify.log.error(
            `[Activity Service] :: Activity ID ${id} does not exist`,
            savedActivity
          );
          return {
            status: 404,
            error: 'Activity does not exist'
          };
        }

        fastify.log.info(
          '[Activity Service] :: Activity updated:',
          savedActivity
        );

        return savedActivity;
      }

      fastify.log.error('[Activity Service] :: Activity not valid', activity);
      return {
        status: 409,
        error: 'Activity is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: Error updating Activity:',
        error
      );
      return { status: 500, error: 'Error updating Activity' };
    }
  },

  /**
   * Uploads a list of evidence files for an activity
   *
   * @param {number} activityId
   * @param {array} files
   * @returns success | errors
   */
  async addEvidenceFiles(activityId, files) {
    const errors = [];
    try {
      // creates the directory where this activities' evidence files will be saved if not exists
      await mkdirp(
        `${configs.fileServer.filePath}/activities/${activityId}/evidence`
      );
      if (files.length && files.length > 0) {
        await Promise.all(
          files.map(async file => {
            const addedEvidence = await this.addEvidence(activityId, file);
            if (addedEvidence.error) {
              errors.push({
                error: addedEvidence.error,
                file: file.name
              });
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
        }
      }
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: There was an error uploading the evidence:',
        error
      );
      return {
        error: 'There was an error uploading the evidence',
        status: 500
      };
    }

    if (errors.length > 0) {
      return errors;
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
    fastify.log.info(
      '[Activity Service] :: Adding evidence to Activity ID',
      activityId
    );
    // verify activity exists
    try {
      const activity = await activityDao.getActivityById(activityId);
      if (!activity || activity == null) {
        fastify.log.error(
          `[Activity Service] :: Activity ID ${activityId} could not be found`
        );
        return { error: 'Activity could not be found', status: 404 };
      }

      // creates the directory where this activities' evidence files will be saved if not exists
      await mkdirp(
        `${configs.fileServer.filePath}/activities/${activityId}/evidence`
      );

      // uploading file
      const path = `${configs.fileServer.filePath}/activities/${
        activity.id
      }/evidence/${file.name}`;
      await file.mv(path);

      // check file type
      const filetype = mime.lookup(path);

      if (!filetype) {
        fastify.log.error(
          '[Activity Service] :: Error getting mime type of file:',
          path
        );
        return { error: 'Error uploading evidence', status: 409 };
      }

      if (filetype.includes('image/')) {
        // save photo
        const savedPhoto = await photoService.savePhoto(path);
        if (!savedPhoto || savedPhoto == null) {
          fastify.log.error(
            '[Activity Service] :: Error saving photo to database:',
            path
          );
          return { error: 'Error uploading evidence', status: 409 };
        }

        const savedActivityPhoto = await activityPhotoDao.saveActivityPhoto(
          activity.id,
          savedPhoto.id
        );

        if (!savedActivityPhoto || savedActivityPhoto == null) {
          fastify.log.error(
            `[Activity Service] :: Error associating photo ${path} to Activity ID ${
              activity.id
            }`
          );

          fastify.log.info('[Activity Service] :: Rolling back Operation');
          const deletedPhoto = await photoService.deletePhoto(savedPhoto.id);

          if (!deletedPhoto || deletedPhoto == null) {
            fastify.log.error(
              `[Activity Service] :: Photo ID ${
                savedPhoto.id
              } could not be deleted`
            );
          }
        }

        fastify.log.info(
          '[Activity Service] :: Evidence added to activity:',
          savedActivityPhoto
        );
        return savedActivityPhoto;
      }
      // if not a photo
      // save file
      const savedFile = await fileService.saveFile(path);
      if (!savedFile || savedFile == null) {
        fastify.log.error(
          '[Activity Service] :: Error saving file to database:',
          path
        );
        return { error: 'Error uploading evidence', status: 409 };
      }

      const savedActivityFile = await activityFileDao.saveActivityFile(
        activity.id,
        savedFile.id
      );

      if (!savedActivityFile || savedActivityFile == null) {
        fastify.log.error(
          `[Activity Service] :: Error associating file ${path} to Activity ID ${
            activity.id
          }`
        );

        fastify.log.info('[Activity Service] :: Rolling back Operation');
        const deletedFile = await fileService.deleteFile(savedFile.id);

        if (!deletedFile || deletedFile == null) {
          fastify.log.error(
            `[Activity Service] :: File ID ${savedFile.id} could not be deleted`
          );
        }
      }

      fastify.log.info(
        '[Activity Service] :: Evidence added to activity:',
        savedActivityFile
      );
      return savedActivityFile;
    } catch (error) {
      fastify.log.error(
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
   * @param {string} fileType 'Photo' or 'File'
   * @returns success | error message
   */
  async deleteEvidence(activityId, evidenceId, fileType) {
    try {
      // need type to know if it's a photo or another type of file
      if (fileType === 'Photo') {
        fastify.log.info(
          `[Activity Service] :: Getting relation for Activity ${activityId} and Photo ${evidenceId}`
        );
        const activityPhoto = await activityPhotoDao.getActivityPhotoByActivityAndPhoto(
          activityId,
          evidenceId
        );

        if (!activityPhoto || activityPhoto == null) {
          fastify.log.error(
            `[Activity Service] :: Relation could not be found for Activity ${activityId} and Photo ${evidenceId}`
          );
          return {
            error: 'Evidence for this activity could not be found',
            status: 404
          };
        }

        fastify.log.info(
          `[Activity Service] :: Deleting Activity-Photo relation: ${activityPhoto}`
        );

        // deletes relation activity-photo
        const deletedActivityPhoto = await activityPhotoDao.deleteActivityPhoto(
          activityPhoto.id
        );
        if (!deletedActivityPhoto || deletedActivityPhoto == null) {
          fastify.log.error(
            `[Activity Service] :: Activity-Photo ID ${
              activityPhoto.id
            } could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }

        fastify.log.info(
          `[Activity Service] :: Deleting Photo ID: ${evidenceId}`
        );

        // deletes photo from Photo table and file in server
        const deletedPhoto = await photoService.deletePhoto(evidenceId);
        if (!deletedPhoto || deletedPhoto == null) {
          fastify.log.error(
            `[Activity Service] :: Photo ID ${evidenceId} could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }
      } else if (fileType === 'File') {
        fastify.log.info(
          `[Activity Service] :: Getting relation for Activity ${activityId} and File ${evidenceId}`
        );
        const activityFile = await activityFileDao.getActivityFileByActivityAndFile(
          activityId,
          evidenceId
        );

        if (!activityFile || activityFile == null) {
          fastify.log.error(
            `[Activity Service] :: Relation could not be found for Activity ${activityId} and File ${evidenceId}`
          );
          return {
            error: 'Evidence for this activity could not be found',
            status: 404
          };
        }

        fastify.log.info(
          `[Activity Service] :: Deleting Activity-File relation: ${activityFile}`
        );

        // deletes db relation
        const deletedActivityFile = await activityFileDao.deleteActivityFile(
          activityFile.id
        );
        if (!deletedActivityFile || deletedActivityFile == null) {
          fastify.log.error(
            `[Activity Service] :: Activity-File ID ${
              activityFile.id
            } could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }

        fastify.log.info(
          `[Activity Service] :: Deleting File ID: ${evidenceId}`
        );

        // deletes record in File table and file in server
        const deletedFile = await fileService.deleteFile(evidenceId);
        if (!deletedFile || deletedFile == null) {
          fastify.log.error(
            `[Activity Service] :: File ID ${evidenceId} could not be deleted`
          );
          return {
            error: 'Evidence for this activity could not be deleted',
            status: 409
          };
        }
      } else {
        fastify.log.error(
          `[Activity Service] :: Wrong file type received: ${fileType}`
        );
        return {
          error: 'Wrong file type',
          status: 400
        };
      }

      return { success: 'Evidence deleted successfully!' };
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: Error deleting evidence:',
        error
      );
      throw Error('There was an error when trying to delete the evidence');
    }
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
  deleteActivity(activityId) {
    return activityDao.deleteActivity(activityId);
  },

  /**
   * Create a oracle reference between a user and activity
   * @param {number} userId
   * @param {number} activityId
   */
  assignOracleToActivity(userId, activityId) {
    return oracleActivityDao.assignOracleToActivity(userId, activityId);
  },

  /**
   * Destroy referencie between a user and activity
   * @param {number} userId
   * @param {number} activityId
   */
  unassignOracleToActivity(activityId) {
    return oracleActivityDao.unassignOracleToActivity(activityId);
  },

  /**
   * Get users with oracle role of an activity
   * @param {number} activityId
   */
  getOracleFromActivity(activityId) {
    return oracleActivityDao.getOracleFromActivity(activityId);
  }
});

module.exports = activityService;
