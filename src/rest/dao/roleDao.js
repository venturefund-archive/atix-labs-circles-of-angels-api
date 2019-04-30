const getRoleById = roleModel => async id => {
  const role = await roleModel.findOne({
    id
  });
  return role;
};

const getAllRoles = roleModel => async () => {
  const roleList = await roleModel.find();
  return roleList || [];
};

module.exports = roleModel => ({
  getRoleById: getRoleById(roleModel),
  getAllRoles: getAllRoles(roleModel)
});
