const createRecovery = passRecoveryModel => async (email, token) => {
  const recover = await passRecoveryModel.find({ email });
  if (recover) await passRecoveryModel.destroyOne({ email });
  return passRecoveryModel.create({ email, token });
};

const findRecoverBytoken = passRecoveryModel => async token =>
  passRecoveryModel.findOne({ where: { token } });

const deleteRecoverByToken = passRecoveryModel => async token =>
  passRecoveryModel.destroyOne({ where: { token } });

module.exports = passRecoveryModel => ({
  createRecovery: createRecovery(passRecoveryModel),
  findRecoverBytoken: findRecoverBytoken(passRecoveryModel),
  deleteRecoverByToken: deleteRecoverByToken(passRecoveryModel)
});
