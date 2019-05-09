module.exports = {
  identity: 'pass_recovery',
  primaryKey: 'id',
  attributes: {
    email: { type: 'string', required: true },
    token: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
