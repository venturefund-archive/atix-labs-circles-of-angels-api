const { coa } = require('@nomiclabs/buidler');
const logger = require('../../../logger');
const daoHandlers = require('./daoHandlers');
const { registerHandlers } = require('../../../util/listener');
const projectService = require('../../../services/projectService');
const { projectStatuses } = require('../../../util/constants');

module.exports = {
  DAOCreated: async address => {
    logger.info('Incoming event :: [COA] DAOCreated', address);
    const dao = await coa.getDao(address);
    registerHandlers(dao, daoHandlers);
  },
  ProjectCreated: async (id, address) => {
    const projectId = id.toNumber();
    logger.info('Incoming event :: [COA] ProjectCreated - address:', address);
    await projectService.updateProject(projectId, {
      status: projectStatuses.EXECUTING,
      address
    });
    logger.info(
      `[COA] :: Project ${projectId} status updated to ${
        projectStatuses.EXECUTING
      }`
    );
  }
};
