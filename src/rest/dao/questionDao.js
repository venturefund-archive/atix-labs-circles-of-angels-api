const findByRoleId = questionModel => async roleId =>
  questionModel.find({ role: roleId });

module.exports = questionModel => ({
  findByRoleId: findByRoleId(questionModel)
});
