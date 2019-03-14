const coaAccountKey = 'coa_bank_account';

const ConfigsDao = ({ configsModel }) => ({
  getCoaBankAccount: async function() {
    return configsModel.findByKey({ key: coaAccountKey });
  }
});

module.exports = ConfigsDao;
