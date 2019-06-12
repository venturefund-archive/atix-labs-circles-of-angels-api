/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { unlink } = require('fs');
const { promisify } = require('util');
const { getBase64htmlFromPath } = require('../util/images');

const unlinkPromise = promisify(unlink);

const photoService = ({ fastify, photoDao }) => ({
  /**
   * Returns a record from the Photo table
   *
   * @param {number} photoId
   * @returns photo object | error
   */
  async getPhotoById(photoId) {
    fastify.log.info('[Photo Service] :: Getting photo ID:', photoId);

    try {
      const photo = await photoDao.getPhotoById(photoId);

      if (!photo || photo == null) {
        fastify.log.error(
          `[Photo Service] :: Photo ID ${photoId} could not be found in database`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      fastify.log.info('[Photo Service] :: Photo found:', photo);
      return photo;
    } catch (error) {
      fastify.log.error('[Photo Service] :: Error getting photo:', error);
      throw Error('Error getting photo');
    }
  },

  /**
   * Looks up the photo in the database and encodes it to base64
   *
   * @param {number} photoId photo's id
   * @returns base64 encoded photo | error message
   */
  async getBase64Photo(photoId) {
    fastify.log.info('[Photo Service] :: Getting photo ID:', photoId);

    try {
      const photo = await photoDao.getPhotoById(photoId);

      if (!photo || photo == null) {
        fastify.log.error(
          `[Photo Service] :: Photo ID ${photoId} could not be found in database`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      fastify.log.info('[Photo Service] :: Photo found:', photo);
      const encodedPhoto = getBase64htmlFromPath(photo.path);

      if (!encodedPhoto || encodedPhoto == null || encodedPhoto === '') {
        fastify.log.error(
          `[Photo Service] :: There was an error encoding the photo ID ${
            photo.id
          }`
        );
        return {
          error: 'There was an error encoding the photo',
          status: 409
        };
      }

      fastify.log.info(`[Photo Service] :: Photo ID ${photo.id} encoded`);
      return encodedPhoto;
    } catch (error) {
      fastify.log.error('[Photo Service] :: Error getting photo:', error);
      throw Error('Error getting photo');
    }
  },

  /**
   * Creates a new record in the Photos table
   *
   * @param {string} path photo file path
   * @returns saved photo
   */
  async savePhoto(path, projectExperienceId) {
    fastify.log.info('[Photo Service] :: Saving photo in database:', path);

    try {
      const newPhoto = { path };
      if (projectExperienceId) {
        newPhoto.projectExperience = projectExperienceId;
      }
      const photo = await photoDao.savePhoto(newPhoto);

      fastify.log.info('[Photo Service] :: Photo saved:', photo);
      return photo;
    } catch (error) {
      fastify.log.error(
        '[Photo Service] :: Error saving photo to database:',
        error
      );
      throw Error('Error saving photo');
    }
  },

  /**
   * Updates a record in the Photos table
   *
   * @param {number} photoId photo to update
   * @param {string} path new path
   * @returns updated photo
   */
  async updatePhoto(photoId, path) {
    fastify.log.info(`[Photo Service] :: Updating photo ID ${photoId}:`, path);

    try {
      const updatedPhoto = await photoDao.updatePhoto(photoId, path);

      if (!updatedPhoto || updatedPhoto == null) {
        fastify.log.error(
          `[Photo Service] :: Photo ID ${photoId} not found in database:`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      fastify.log.info('[Photo Service] :: Photo updated:', updatedPhoto);
      return updatedPhoto;
    } catch (error) {
      fastify.log.error('[Photo Service] :: Error updating photo:', error);
      throw Error('Error updating photo');
    }
  },

  /**
   * Deletes a record in the Photo table
   *
   * @param {number} photoId photo to delete
   * @returns deleted photo
   */
  async deletePhoto(photoId) {
    fastify.log.info(`[Photo Service] :: Deleting photo ID ${photoId}`);

    try {
      const deletedPhoto = await photoDao.deletePhoto(photoId);

      await unlinkPromise(deletedPhoto.path);

      if (!deletedPhoto || deletedPhoto == null) {
        fastify.log.error(
          `[Photo Service] :: Photo ID ${photoId} not found in database:`
        );
        return {
          error: 'Photo not found in database',
          status: 404
        };
      }

      fastify.log.info('[Photo Service] :: Photo deleted:', deletedPhoto);
      return deletedPhoto;
    } catch (error) {
      fastify.log.error('[Photo Service] :: Error deleting photo:', error);
      throw Error('Error deleting photo');
    }
  },

  checkEvidencePhotoType(photo) {
    const fileType = photo.mimetype;
    return fileType.includes('image/');
  }
});

module.exports = photoService;
