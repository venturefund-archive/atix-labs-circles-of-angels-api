module.exports = {
  identity: 'role',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    name: { type: 'string', required: true }
  }
};
