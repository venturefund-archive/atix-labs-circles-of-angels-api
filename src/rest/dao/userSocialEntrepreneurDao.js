const create = userSocialEntrepreneurModel => async userFunder => {
  return userSocialEntrepreneurModel.create(userFunder);
};

const getById = userSocialEntrepreneurModel => async userId => {
  const userSocialEntrepreneur = userSocialEntrepreneurModel.findOne({
    id: userId
  });
  return userSocialEntrepreneur;
};

module.exports = userSocialEntrepreneurModel => ({
  create: create(userSocialEntrepreneurModel),
  getById: getById(userSocialEntrepreneurModel)
});
