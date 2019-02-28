const UserDao = () => {
  const userModel = require("../server").fastify.models.user;

  const getUserById = async function({id}){
    return userModel.findById(id);
  }
}

module.exports.UserDao = UserDao;