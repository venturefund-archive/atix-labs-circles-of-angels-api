/**
 *@description Represents a general configuration of the API
 *@attribute `key`: unique key of a configuration
 *@attribute `value`: the value of that configuration
 */
module.exports = {
  identity: 'configs',
  primaryKey: 'key',
  attributes: {
    key: { type: 'string', required: true },
    value: { type: 'string', required: true }
  },
  async findByKey({ key }) {
    return this.findOne(key);
  }
};
