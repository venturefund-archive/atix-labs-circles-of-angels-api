module.exports = {
  UpdateWithInvalidProjectStatus: status => ({
    message: `Task of project with status ${status} can't be updated`,
    statusCode: 403
  }),
  ProjectNotFound: taskId => ({
    message: `Project of task id ${taskId} not found`,
    statusCode: 404
  }),
  DeleteWithInvalidProjectStatus: status => ({
    message: `Task of project with status ${status} can't be deleted`,
    statusCode: 403
  })
};
