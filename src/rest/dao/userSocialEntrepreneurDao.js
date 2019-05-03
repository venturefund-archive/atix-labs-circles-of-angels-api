const create = userSocialEntrepreneurModel => async userFunder => {
  return userSocialEntrepreneurModel.create(userFunder);
};

module.exports = userSocialEntrepreneurModel => ({
  create: create(userSocialEntrepreneurModel)
});
