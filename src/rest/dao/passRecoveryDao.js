/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
