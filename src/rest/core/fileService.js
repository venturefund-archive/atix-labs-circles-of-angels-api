const { unlink } = require('fs');
const { promisify } = require('util');

const unlinkPromise = promisify(unlink);

const fileService = ({ fastify, fileDao }) => ({
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
  }
});

module.exports = fileService;
