module.exports = {
  identity: 'photo',
  primaryKey: 'id',
  attributes: {
    path: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
