module.exports = {
  identity: 'user',
  primaryKey: 'id',
  attributes: {
    username: { type: 'string', required: true },
    email: { type: 'string', required: true },
    pwd: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  },
  async findById(id) {
    return this.findOne(id);
  }
};
