const createRecovery = passRecoveryModel => async (email, token) => {
  const recover = await passRecoveryModel.find({ email });
  if (recover) await passRecoveryModel.destroyOne({ email });
  return passRecoveryModel.create({ email, token });
};

module.exports = passRecoveryModel => ({
  createRecovery: createRecovery(passRecoveryModel)
});
