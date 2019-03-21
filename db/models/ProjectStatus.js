module.exports = {
  identity: 'project_status',
  primaryKey: 'status',
  attributes: {
    status: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
