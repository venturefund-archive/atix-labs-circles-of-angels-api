const findUserProject = userProjectModel => async ({ userId, projectId }) => {
  const userProject = await userProjectModel.findOne({
    user: userId,
    project: projectId
  });
  return userProject;
};

const updateStatus = userProjectModel => async ({ userProject, newStatus }) => {
  const updatedUserProject = await userProjectModel
    .update({ id: userProject.id })
    .set({ status: newStatus });

  return updatedUserProject;
};

module.exports = userProjectModel => ({
  findUserProject: findUserProject(userProjectModel),
  updateStatus: updateStatus(userProjectModel)
});
