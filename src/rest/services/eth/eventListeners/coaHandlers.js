const { coa } = require('@nomiclabs/buidler');
const logger = require('../../../logger');
const daoHandlers = require('./daoHandlers');
const { registerHandlers } = require('../../../util/listener');
// TODO: see if we can inject these services
const projectService = require('../../../services/projectService');
const milestoneService = require('../../../services/milestoneService');
const { projectStatuses } = require('../../../util/constants');

module.exports = {
  DAOCreated: async address => {
    logger.info('[COA] :: Incoming event DAOCreated', address);
    const dao = await coa.getDaoContract(address);
    registerHandlers(dao, daoHandlers);
  },
  ProjectCreated: async (id, address) => {
    const projectId = id.toNumber();
    logger.info('[COA] :: Incoming event ProjectCreated - address:', address);
    await projectService.updateProject(projectId, {
      status: projectStatuses.FUNDING,
      address
    });

    const project = await projectService.getProjectById(projectId);
    await projectService.notifyProjectStatusChange(
      project,
      projectStatuses.FUNDING
    );
    logger.info(
      `[COA] :: Project ${projectId} status updated to ${
        projectStatuses.FUNDING
      }`
    );
  }
};
