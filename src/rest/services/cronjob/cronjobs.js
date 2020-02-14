const config = require('config');
const logger = require('../../logger');

const { EVERY_DAY_AT_MIDNIGHT } = require('./cronExpressions');

module.exports = {
  transitionProjectStatusJob: {
    cronTime:
      config.crons.transitionProjectStatusJob.cronTime || EVERY_DAY_AT_MIDNIGHT,
    async onTick() {
      logger.info('[CronJobService] :: Executing transitionProjectStatusJob');
      const updatedConsensusProjects = await this.projectService.transitionConsensusProjects();
      const updatedFundingProjects = await this.projectService.transitionFundingProjects();
      const updatedProjects = [
        ...updatedConsensusProjects,
        ...updatedFundingProjects
      ];
      logger.info('[CronJobService] :: Updated projects:', updatedProjects);
    },
    onComplete() {
      logger.info('[CronJobService] :: transitionProjectStatusJob has stopped');
    },
    timezone: config.crons.transitionProjectStatusJob.timezone || undefined,
    runOnInit: config.crons.transitionProjectStatusJob.runOnInit || false,
    disabled: config.crons.transitionProjectStatusJob.disabled || false
  }
};
