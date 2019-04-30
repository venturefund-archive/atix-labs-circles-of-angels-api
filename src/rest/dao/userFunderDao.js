const create = userFunderModel => async userFunder => {
  return userFunderModel.create(userFunder);
};

module.exports = userFunderModel => ({
  create: create(userFunderModel)
});
