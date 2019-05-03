/**
 * @description Represents the current status of a user registration
 * @attribute `id`: numerical representation of the state
 * @attribute `name`: name of the state
 */
module.exports = {
  identity: 'user_registration_status',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
