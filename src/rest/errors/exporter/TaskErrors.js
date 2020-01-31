module.exports = {
  UpdateWithInvalidProjectStatus: status => ({
    message: `Task of project with status ${status} can't be updated`,
    statusCode: 403
  }),
  ProjectNotFound: taskId => ({
    message: `Project of task id ${taskId} not found`,
    statusCode: 404
  }),
  MilestoneNotFound: taskId => ({
    message: `Milestone of task id ${taskId} not found`,
    statusCode: 404
  }),
  OracleNotAssigned: ({ userId, taskId }) => ({
    message: `User ${userId} is not the oracle assigned for task ${taskId}`,
    statusCode: 403
  }),
  DeleteWithInvalidProjectStatus: status => ({
    message: `Task of project with status ${status} can't be deleted`,
    statusCode: 403
  }),
  CreateWithInvalidProjectStatus: status => ({
    message: `Can't create new task in project with status ${status}`,
    statusCode: 403
  }),
  AssignOracleWithInvalidProjectStatus: status => ({
    message: `Can't assign an oracle to a task in a project with status ${status}`,
    statusCode: 403
  }),
  NotOracleCandidate: {
    message: 'The user has not applied as an oracle for the project',
    statusCode: 403
  }
};
