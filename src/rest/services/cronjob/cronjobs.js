const config = require('config');
const logger = require('../../logger');

const { EVERY_DAY_AT_MIDNIGHT, EVERY_HOUR } = require('./cronExpressions');

module.exports = {
  transitionProjectStatusJob: {
    cronTime: '*/1 * * * *',
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
  },
  checkFailedTransactionsJob: {
    cronTime: config.crons.checkFailedTransactionsJob.cronTime || EVERY_HOUR,
    async onTick() {
      logger.info('[CronJobService] :: Executing checkFailedTransactionsJob');
      await this.transferService.updateFailedTransactions();
      await this.activityService.updateFailedEvidenceTransactions();
      await this.daoService.updateFailedProposalTransactions();
      await this.daoService.updateFailedVoteTransactions();
    },
    onComplete() {
      logger.info('[CronJobService] :: checkFailedTransactionsJob has stopped');
    },
    timezone: config.crons.checkFailedTransactionsJob.timezone || undefined,
    runOnInit: config.crons.checkFailedTransactionsJob.runOnInit || false,
    disabled: config.crons.checkFailedTransactionsJob.disabled || false
  }
};
