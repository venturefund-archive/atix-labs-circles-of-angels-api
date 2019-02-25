const coaAccountKey = "coa_bank_account";

const ConfigsDao = () => {
  return {
    configsModel: require("../server").fastify.models.configs,
    getCoaBankAccount: async function(){
      return this.configsModel.findByKey({ key: coaAccountKey });
    }
  };
};

module.exports = ConfigsDao;
