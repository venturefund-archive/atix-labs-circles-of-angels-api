module.exports = {
  identity: "configs",
  primaryKey: "key",
  attributes: {
    key: { type: "string", required: true },
    value: { type: "string", required: true }
  },
  findByKey: async function({key}) {
    return this.findOne(key);
  }
};
