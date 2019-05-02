const create = userFunderModel => async userFunder => {
  return userFunderModel.create(userFunder);
};

const getById = userFunderModel => async userId => {
  const userFunder = userFunderModel.findOne({
    id: userId
  });
  return userFunder;
};

module.exports = userFunderModel => ({
  create: create(userFunderModel),
  getById: getById(userFunderModel)
});
