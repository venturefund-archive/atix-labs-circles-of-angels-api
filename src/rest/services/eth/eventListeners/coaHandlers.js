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
    const dao = await coa.getDao(address);
    registerHandlers(dao, daoHandlers);
  },
  ProjectCreated: async (id, address) => {
    const projectId = id.toNumber();
    logger.info('[COA] :: Incoming event ProjectCreated - address:', address);
    await projectService.updateProject(projectId, {
      status: projectStatuses.EXECUTING,
      address
    });

    const project = await projectService.getProjectById(projectId);
    await projectService.notifyProjectStatusChange(
      project,
      projectStatuses.EXECUTING
    );
    const milestones = await milestoneService.getAllMilestonesByProject(
      projectId
    );
    // set first milestone as claimable
    if (milestones && milestones.length && milestones[0]) {
      await milestoneService.setClaimable(milestones[0].id);
    }
    logger.info(
      `[COA] :: Project ${projectId} status updated to ${
        projectStatuses.EXECUTING
      }`
    );
  }
};
