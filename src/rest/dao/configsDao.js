const coaAccountKey = 'coa_bank_account';

const ConfigsDao = ({ configsModel }) => ({
  async getCoaBankAccount() {
    return configsModel.findByKey({ key: coaAccountKey });
  }
});

module.exports = ConfigsDao;
