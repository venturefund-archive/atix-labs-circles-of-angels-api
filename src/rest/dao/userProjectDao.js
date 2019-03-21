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

const getUserProjects = userProjectModel => async projectId => {
  const userProjects = await userProjectModel
    .find({ project: projectId })
    .populate('user');

  return userProjects;
};

module.exports = userProjectModel => ({
  findUserProject: findUserProject(userProjectModel),
  updateStatus: updateStatus(userProjectModel),
  getUserProjects: getUserProjects(userProjectModel)
});
