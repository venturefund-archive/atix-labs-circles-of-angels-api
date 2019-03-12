const modelsPath = "../rest/models";

module.exports = {
  user: require(`${modelsPath}/User`),
  transaction: require(`${modelsPath}/Transaction`),
  project: require(`${modelsPath}/Project`),
  configs: require(`${modelsPath}/Configs`),
  milestone: require(`${modelsPath}/Milestone`),
  activity: require(`${modelsPath}/Activity`)
};
