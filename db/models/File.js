/**
 * @description Represents the files uploaded to the server
 * @attribute `path`: file path
 */
module.exports = {
  identity: 'file',
  primaryKey: 'id',
  attributes: {
    path: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
