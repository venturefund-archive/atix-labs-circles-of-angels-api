/**
 * @description Represent a user_funder, specific information for users with Funder role
 * @attribute `id`: user_funder id in the business domain
 * @attribute `user`: reference to user owner of this information
 * @attribute `identifier`: identification of the person account owner, i.e: passport, DNI, etc.
 * @attribute `address`: user domicile
 * @attribute `tel`: user telephone number
 */
module.exports = {
  identity: 'user_funder',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    user: {
      columnName: 'userId',
      model: 'user'
    },
    identifier: { type: 'number', required: true },
    address: { type: 'string', required: true },
    tel: { type: 'string', allowNull: true }
  }
};
