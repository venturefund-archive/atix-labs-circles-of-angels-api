const findAll = milestoneBudgetStatusModel => async () => {
  const budgetStatus = await milestoneBudgetStatusModel.find();
  return budgetStatus || [];
};

module.exports = milestoneBudgetStatusModel => ({
  findAll: findAll(milestoneBudgetStatusModel)
});
