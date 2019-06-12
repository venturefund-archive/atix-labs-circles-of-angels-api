/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const findAll = milestoneBudgetStatusModel => async () => {
  const budgetStatus = await milestoneBudgetStatusModel.find();
  return budgetStatus || [];
};

module.exports = milestoneBudgetStatusModel => ({
  findAll: findAll(milestoneBudgetStatusModel)
});
