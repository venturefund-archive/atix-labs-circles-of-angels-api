const { CronJob } = require('cron');
const jobs = require('./cronjobs');

const logger = require('../../logger');

module.exports = {
  crons: [],
  cronInit() {
    logger.info('[cronInit] :: Initializing cronJobs');
    this.crons = Object.entries(jobs).map(([jobName, job]) => {
      const {
        cronTime,
        onTick,
        onComplete,
        timezone,
        runOnInit,
        disabled
      } = job;

      const cron = new CronJob(
        cronTime,
        onTick,
        onComplete,
        false,
        timezone,
        this,
        runOnInit
      );

      return { disabled, jobName, cron };
    });
    this.startAll();
  },
  startAll() {
    // TODO: use config variable to enable/disable all jobs
    this.crons.forEach(({ disabled, jobName, cron }) => {
      if (!disabled) {
        logger.info('[cronInit] :: Starting job', jobName);
        cron.start();
      }
    });
  },
  start(job) {
    // TODO: use config variable to enable/disable all jobs
    const foundCron = this.crons.find(({ jobName }) => jobName === job);
    if (foundCron && !foundCron.disabled) {
      logger.info('[cronInit] :: Starting job', job);
      foundCron.cron.start();
    }
  },
  stopAll() {
    this.crons.forEach(({ jobName, cron }) => {
      logger.info('[cronInit] :: Stopping job', jobName);
      cron.stop();
    });
  },
  stop(job) {
    const foundCron = this.crons.find(({ jobName }) => jobName === job);
    if (foundCron) {
      logger.info('[cronInit] :: Stopping job', job);
      foundCron.cron.stop();
    }
  }
};
