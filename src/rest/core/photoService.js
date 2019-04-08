const { getBase64htmlFromPath } = require('../util/images');

const photoService = ({ fastify, photoDao }) => ({
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
  async savePhoto(path) {
    fastify.log.info('[Photo Service] :: Saving photo in database:', path);

    try {
      const photo = await photoDao.savePhoto(path);

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
  }
});

module.exports = photoService;
