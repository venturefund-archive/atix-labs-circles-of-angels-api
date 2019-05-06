const create = userFunderModel => async userFunder => {
  return userFunderModel.create(userFunder);
};

const getById = userFunderModel => async id => {
  const userFunder = userFunderModel.findOne({
    id
  });
  return userFunder;
};

const getByUserId = userFunderModel => async userId => {
  const userFunder = userFunderModel.findOne({
    user: userId
  });
  return userFunder;
};

module.exports = userFunderModel => ({
  create: create(userFunderModel),
  getById: getById(userFunderModel),
  getByUserId: getByUserId(userFunderModel)
});
