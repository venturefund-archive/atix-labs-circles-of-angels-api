const create = userSocialEntrepreneurModel => async userFunder =>
  userSocialEntrepreneurModel.create(userFunder);

const getById = userSocialEntrepreneurModel => async id => {
  const userSocialEntrepreneur = userSocialEntrepreneurModel.findOne({
    id
  });
  return userSocialEntrepreneur;
};

const getByUserId = userSocialEntrepreneurModel => async userId => {
  const userSocialEntrepreneur = userSocialEntrepreneurModel.findOne({
    user: userId
  });
  return userSocialEntrepreneur;
};

module.exports = userSocialEntrepreneurModel => ({
  create: create(userSocialEntrepreneurModel),
  getById: getById(userSocialEntrepreneurModel),
  getByUserId: getByUserId(userSocialEntrepreneurModel)
});
