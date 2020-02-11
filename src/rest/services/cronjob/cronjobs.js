const cronExpressions = require('./cronExpressions');
const logger = require('../../logger');

module.exports = {
  transitionProjectStatusJob: {
    cronTime: cronExpressions.EVERYDAY_AT_MIDNIGHT, // TODO: use config variable
    async onTick() {
      logger.info('[CronJobService] :: Executing transitionProjectStatusJob');
      const updatedProjects = await this.projectService.transitionConsensusProjects();
      logger.info('[CronJobService] :: Updated projects:', updatedProjects);
    },
    onComplete() {
      logger.info('[CronJobService] :: transitionProjectStatusJob has stopped');
    },
    timezone: undefined,
    runOnInit: false,
    disabled: false // TODO: use config variable
  }
};
