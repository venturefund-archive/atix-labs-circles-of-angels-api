/**
 * @description Represents the current status of the budget of a milestone
 * @attribute `id`: numerical representation of the state
 * @attribute `name`: name of the state
 */
module.exports = {
  identity: 'milestone_budget_status',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
