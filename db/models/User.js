module.exports = {
  identity: "user",
  primaryKey: "id",
  attributes: {
    userId: { type: "number", required: true },
    username: { type: "string", required: true },
    email: { type: "string", required: true },
    pwd: { type: "string", required: true },
    createdAt: { type: "string", autoCreatedAt: true, required: false },
    updatedAt: { type: "string", autoUpdatedAt: true, required: false },
    id: { type: "number", autoMigrations: { autoIncrement: true } }
  },
  findById: async function(id) {
    return this.findOne(id);
  }
};
