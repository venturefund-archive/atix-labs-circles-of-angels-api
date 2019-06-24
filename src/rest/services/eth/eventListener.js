/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const { isEmpty } = require('lodash');
const {
  blockchainStatus,
  projectStatus,
  milestoneBudgetStatus
} = require('../../util/constants');

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const eventListener = async (
  ethService,
  { COAProjectAdmin, COAOracle },
  { logger }
) => {
  const { helper } = require('../helper');
  const { projectService, milestoneService, activityService } = helper.services;

  const {
    blockchainBlockDao,
    projectDao,
    milestoneDao,
    activityDao
  } = helper.daos;

  const updateLastBlock = async event => {
    logger.info('leoooooooooooo', event);
    const { blockNumber, transactionHash } = event;
    if (!blockNumber || !transactionHash) {
      return false;
    }
    return blockchainBlockDao.updateLastBlock(blockNumber, transactionHash);
  };

  const onProjectStarted = async event => {
    logger.info('[Event listener] :: received Project started event', event);
    let { id } = event.returnValues;
    id = parseInt(id._hex, 16);

    projectDao.updateStartBlockchainStatus(id, blockchainStatus.CONFIRMED);
  };

  const suscribeToEvent = async (event, callback) => {
    event({}, (error, event) => {
      if (error) return { error };
      callback(event);
    });
  };

  const onMilestoneClaimableEvent = async event => {
    try {
      logger.info(
        '[Event listener] :: received Milestone Claimable event',
        event
      );
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.CLAIMABLE
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const onMilestoneClaimedEvent = async event => {
    try {
      logger.info(
        '[Event listener] :: received Milestone Claimed event',
        event
      );
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.CLAIMED
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const onMilestoneFundedEvent = async event => {
    try {
      logger.info('[Event listener] :: received Milestone Funded event', event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.FUNDED
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const onNewProjectEvent = async event => {
    logger.info('[Event listener] :: received New Project event', event);
    try {
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      const modifiedProject = await projectService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (modifiedProject.error) {
        logger.error(
          '[Event listener] :: Error updating status: ',
          modifiedProject.error
        );
        return;
      }
      logger.info(
        '[Event listener] :: successfully updated blockchain status of project ',
        id
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const onNewMilestoneEvent = async event => {
    logger.info('[Event listener] :: received New Milestone event', event);
    try {
      let { id, projectId } = event.returnValues;
      id = parseInt(id._hex, 16);
      projectId = parseInt(projectId._hex, 16);
      const project = await projectService.getProjectWithId({ projectId });
      if (project.blockchainStatus !== blockchainStatus.CONFIRMED) {
        logger.error(
          '[Event listener] :: Must be confirmed in blockchain first the project ',
          projectId
        );
        return;
      }
      const milestone = await milestoneService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (milestone.error) {
        logger.error(
          '[Event listener] :: Error updating status: ',
          milestone.error
        );
        return;
      }

      const { activities } = await milestoneService.getMilestoneActivities(
        milestone
      );

      for (let j = 0; j < activities.length; j++) {
        const activity = activities[j];
        const oracle = await activityService.getOracleFromActivity(activity.id);
        activities[j].oracle = oracle.user;
        activities[j].projectId = projectId;
        activities[j].milestoneId = id;
      }
      await ethService.createActivities(activities);
      logger.info(
        '[Event listener] :: successfully updated blockchain status of milestone ',
        id
      );
    } catch (error) {
      logger.error(error);
    }
  };

  const onNewActivityEvent = async event => {
    logger.info('[Event listener] :: received New Activity event', event);
    try {
      let { id, milestoneId, projectId } = event.returnValues;
      id = parseInt(id._hex, 16);
      milestoneId = parseInt(milestoneId._hex, 16);
      projectId = parseInt(projectId._hex, 16);

      const project = await projectService.getProjectWithId({ projectId });
      const milestone = await milestoneService.getMilestoneById(milestoneId);

      if (project.blockchainStatus !== blockchainStatus.CONFIRMED) {
        logger.error(
          '[Event listener] :: Must be confirmed in blockchain first the project ',
          projectId
        );
        return;
      }
      if (milestone.blockchainStatus !== blockchainStatus.CONFIRMED) {
        logger.error(
          '[Event listener] :: Must be confirmed in blockchain first the milestone ',
          milestoneId
        );
        return;
      }
      const response = await activityService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (!response) {
        logger.error('[Event listener] :: Error updating status ');
        return;
      }
      const { activities } = await milestoneService.getMilestoneActivities(
        milestone
      );

      for (const activityIndex in activities) {
        const activity = activities[activityIndex];
        if (activity.blockchainStatus !== blockchainStatus.CONFIRMED) {
          projectComplete = false;
          break;
        }
      }

      if (response.error) {
        logger.error(
          '[Event listener] :: Error updating status: ',
          response.error
        );
        return;
      }

      const startedProject = project.status === projectStatus.IN_PROGRESS;

      if (!startedProject) {
        const projectComplete = await projectService.allActivitiesAreConfirmed(
          projectId,
          activityDao
        );

        if (projectComplete.error) {
          logger.error(
            '[Event listener] :: Error updating status: ',
            projectComplete.error
          );
          return;
        }

        if (projectComplete) {
          const userOwner = await projectDao.getUserOwnerOfProject(projectId);
          const transactionHash = await ethService.startProject({ projectId });
          await projectDao.updateProjectTransaction({
            projectId,
            status: projectStatus.IN_PROGRESS,
            transactionHash
          });

          await projectService.updateProjectStatus({
            projectId,
            status: projectStatus.IN_PROGRESS
          });

          logger.info('[Event listener] :: Project started:', projectId);

          logger.info(
            '[Event listener] :: successfully updated blockchain status of activity',
            id
          );
        }
      }
    } catch (error) {
      logger.error(error);
    }
  };

  const getAllPastEvents = async options => {
    const CoaProjectAdminEvents = await COAProjectAdmin.getPastEvents(
      'allEvents',
      options
    );
    const CoaOracleEvents = await COAOracle.getPastEvents('allEvents', options);

    const events = CoaProjectAdminEvents.concat(CoaOracleEvents);
    events.sort((event1, event2) => event1.blockNumber - event2.blockNumber);

    return events;
  };

  const eventMethodMap = {
    NewProject: onNewProjectEvent,
    NewMilestone: onNewMilestoneEvent,
    NewActivity: onNewActivityEvent,
    MilestoneClaimable: onMilestoneClaimableEvent,
    MilestoneClaimed: onMilestoneClaimedEvent,
    MilestoneFunded: onMilestoneFundedEvent,
    ProjectStarted: onProjectStarted
  };

  return {
    async recoverPastEvents() {
      try {
        const lastBlock = await blockchainBlockDao.getLastBlock();
        const fromBlock = lastBlock ? lastBlock.blockNumber + 1 : 0;

        const events = await getAllPastEvents({ fromBlock });
        const filteredEvents = events.filter(
          event => eventMethodMap[event.event]
        );
        if (isEmpty(filteredEvents)) return;
        logger.info('[event listener] - recovering past events...');
        let event;
        for (const eventKey in filteredEvents) {
          event = filteredEvents[eventKey];
          await eventMethodMap[event.event](event);
        }
        await updateLastBlock(event);
      } catch (error) {
        logger.error(error);
      }
    },

    async startListen() {
      setInterval(this.recoverPastEvents, 5000);
    }
  };
};

module.exports = eventListener;
