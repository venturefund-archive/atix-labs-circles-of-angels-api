/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { unlink } = require('fs');
const { promisify } = require('util');

const unlinkPromise = promisify(unlink);

const fileService = ({ fastify, fileDao }) => ({
  /**
   * Returns a record from the File table
   *
   * @param {number} fileId
   * @returns file object | error
   */
  async getFileById(fileId) {
    fastify.log.info('[File Service] :: Getting file ID:', fileId);

    try {
      const file = await fileDao.getFileById(fileId);

      if (!file || file == null) {
        fastify.log.error(
          `[File Service] :: File ID ${fileId} could not be found in database`
        );
        return {
          error: 'File could not be found',
          status: 404
        };
      }

      fastify.log.info('[File Service] :: File found:', file);
      return file;
    } catch (error) {
      fastify.log.error('[File Service] :: Error getting file:', error);
      throw Error('Error getting file');
    }
  },

  /**
   * Creates a new record in the Files table
   *
   * @param {string} path file path
   * @returns saved file
   */
  async saveFile(path) {
    fastify.log.info('[File Service] :: Saving file in database:', path);

    try {
      const file = await fileDao.saveFile(path);

      fastify.log.info('[File Service] :: File saved:', file);
      return file;
    } catch (error) {
      fastify.log.error(
        '[File Service] :: Error saving file to database:',
        error
      );
      throw Error('Error saving file');
    }
  },

  /**
   * Deletes a record in the Files table
   *
   * @param {number} fileId file to delete
   * @returns deleted file
   */
  async deleteFile(fileId) {
    fastify.log.info(`[File Service] :: Deleting file ID ${fileId}`);

    try {
      const deletedFile = await fileDao.deleteFile(fileId);

      await unlinkPromise(deletedFile.path);

      if (!deletedFile || deletedFile == null) {
        fastify.log.error(
          `[File Service] :: File ID ${fileId} not found in database:`
        );
        return {
          error: 'File not found in database',
          status: 404
        };
      }

      fastify.log.info('[File Service] :: File deleted:', deletedFile);
      return deletedFile;
    } catch (error) {
      fastify.log.error('[File Service] :: Error deleting file:', error);
      throw Error('Error deleting file');
    }
  },

  checkEvidenceFileType(file) {
    const fileType = file.mimetype;
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    return validTypes.includes(fileType);
  }
});

module.exports = fileService;
