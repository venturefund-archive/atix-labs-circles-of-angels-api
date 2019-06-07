/**
 * @description Represents the status of a blockchain transaction
 * @attribute `name`: name of the state
 * @attribute `id`: numerical representation of the state
 */
module.exports = {
  identity: 'blockchain_status',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
