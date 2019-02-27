const UserDao = () => {
  return {
   userModel : require("../server").fastify.models.user,
   getUserById: async function({id}){
    return this.userModel.findById(id);
  }
};
};

module.exports = UserDao;