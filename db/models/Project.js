module.exports = {
  identity: "project",
  primaryKey: "id",
  attributes: {
    projectId: { type: "string", required: true },
    name: { type: "string", required: true },
    owner: { type: "number", required: true },
    description: { type: "string", required: true },
    createdAt: { type: "string", autoCreatedAt: true, required: false },
    updatedAt: { type: "string", autoUpdatedAt: true, required: false },
    id: { type: "number", autoMigrations: { autoIncrement: true } }
  }
};
