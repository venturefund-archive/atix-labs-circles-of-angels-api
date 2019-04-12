/**
 * @description Represents the current status of a milestone or activity
 * @attribute `name`: name of the state
 * @attribute `status`: numerical representation of the state
 */
module.exports = {
  identity: 'milestone_activity_status',
  primaryKey: 'status',
  attributes: {
    status: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
