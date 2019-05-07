const findByRoleId = questionModel => async roleId => {
  return questionModel.find({ role: roleId });
};

module.exports = questionModel => ({
  findByRoleId: findByRoleId(questionModel)
});
