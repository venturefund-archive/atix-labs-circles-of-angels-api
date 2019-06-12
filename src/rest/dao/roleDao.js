/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
