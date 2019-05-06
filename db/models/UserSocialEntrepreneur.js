/**
 * @description Represent a user social entrepreneur, specific information for users with Funder role
 * @attribute `id`: user_social_entrepreneur id in the business domain
 * @attribute `user`: reference to user owner of this information
 * @attribute `company`: company name
 * @attribute `address`: company domicile
 * @attribute `registrationNumber`: identification number of company
 * @attribute `industry`: wich industry is the company
 * @attribute `bank_account`: bank account of company
 * @attribute `phoneNumber`: phone number
 */
module.exports = {
  identity: 'user_social_entrepreneur',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    user: {
      columnName: 'userId',
      model: 'user'
    },
    company: { type: 'string', required: true },
    registrationNumber: { type: 'string', required: true },
    industry: { type: 'string', required: true },
    address: { type: 'string', required: true },
    bank_account: { type: 'string', required: true },
    phoneNumber: { type: 'string', allowNull: true }
  }
};
