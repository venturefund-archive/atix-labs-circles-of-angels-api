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
  milestoneBudgetStatus,
  activityStatus
} = require('../../util/constants');

const INTERVAL = 5000;
const BLOCK_STEP = 50;

const eventListener = async (
  ethService,
  { COAProjectAdmin, COAOracle },
  { logger }
) => {
  const { helper } = require('../helper');
  const { projectService, milestoneService, activityService } = helper.services;
  const { transactionDao } = helper.daos;

  const {
    blockchainBlockDao,
    projectDao,
    milestoneDao,
    activityDao
  } = helper.daos;

  const updateLastBlock = async event => {
    const { blockNumber, transactionHash } = event;
    if (!blockNumber || !transactionHash) {
      return false;
    }
    await transactionDao.confirmTransaction(transactionHash);
    return blockchainBlockDao.updateLastBlock(blockNumber, transactionHash);
  };

  const onProjectStarted = async event => {
    try {
      logger.info('[Event listener] :: received Project started event', event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      await updateLastBlock(event);
      await projectDao.updateStartBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );
      await projectService.updateProjectStatus({
        projectId: id,
        status: projectStatus.IN_PROGRESS
      });
      logger.info('[Event listener] :: Project started:', id);
    } catch (error) {
      logger.error(error);
    }
  };

  const onMilestoneClaimableEvent = async event => {
    try {
      logger.info(
        '[Event listener] :: received Milestone Claimable event',
        event
      );
      await updateLastBlock(event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      await milestoneDao.updateBudgetStatus(
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
      await updateLastBlock(event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      await milestoneDao.updateBudgetStatus(id, milestoneBudgetStatus.CLAIMED);
    } catch (error) {
      logger.error(error);
    }
  };

  const onMilestoneFundedEvent = async event => {
    try {
      logger.info('[Event listener] :: received Milestone Funded event', event);
      await updateLastBlock(event);
      let { id } = event.returnValues;

      id = parseInt(id._hex, 16);
      await milestoneDao.updateBudgetStatus(id, milestoneBudgetStatus.FUNDED);
    } catch (error) {
      logger.error(error);
    }
  };

  const onMilestoneCompletedEvent = async event => {
    try {
      logger.info(
        '[Event listener] :: received Milestone Completed event',
        event
      );
      await updateLastBlock(event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      await milestoneService.tryCompleteMilestone(id);
    } catch (error) {
      logger.error(error);
    }
  };

  const onProjectCompletedEvent = async event => {
    try {
      logger.info(
        '[Event listener] :: received Project Completed event',
        event
      );
      await updateLastBlock(event);
    } catch (error) {
      logger.error(error);
    }
  };

  const onNewProjectEvent = async event => {
    logger.info('[Event listener] :: received New Project event', event);
    try {
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);
      await updateLastBlock(event);
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
      await updateLastBlock(event);
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
      ethService.createActivities({ activities });

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
      await updateLastBlock(event);
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
          ethService.startProject({ projectId });

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

  const onActivityValidatedEvent = async event => {
    try {
      await updateLastBlock(event);
      let { id } = event.returnValues;
      id = parseInt(id._hex, 16);

      await activityDao.updateStatus(id, activityStatus.COMPLETED);
      logger.info(
        '[Event listener] :: successfully updated blockchain status of activity ',
        id
      );
    } catch (error) {
      logger.error(
        '[Event listener] :: unexpected error handleing Activity Validated Event: ',
        error
      );
    }
  };

  const eventMethodMap = {
    NewProject: onNewProjectEvent,
    NewMilestone: onNewMilestoneEvent,
    NewActivity: onNewActivityEvent,
    MilestoneClaimable: onMilestoneClaimableEvent,
    MilestoneClaimed: onMilestoneClaimedEvent,
    MilestoneFunded: onMilestoneFundedEvent,
    MilestoneCompleted: onMilestoneCompletedEvent,
    ProjectCompleted: onProjectCompletedEvent,
    ProjectStarted: onProjectStarted,
    ActivityValidated: onActivityValidatedEvent
  };

  const readEvents = async (lastBlock, lastMinedBlock, options) => {
    const events = await getAllPastEvents(options);
    const filteredEvents = events.filter(event => eventMethodMap[event.event]);
    if (isEmpty(filteredEvents)) {
      if (lastBlock !== lastMinedBlock.number) {
        await updateLastBlock({
          blockNumber: lastMinedBlock.number,
          transactionHash: lastMinedBlock.hash
        });
      }
    } else {
      logger.info('[event listener] - recovering past events...');
      for (const eventKey in filteredEvents) {
        event = filteredEvents[eventKey];
        await eventMethodMap[event.event](event);
      }
    }
  };

  return {
    async recoverPastEvents() {
      try {
        let running = true;
        const lastMinedBlock = await ethService.getLastBlock();
        const lastMinedBlockNumber = lastMinedBlock.number;
        const lastBlock = await blockchainBlockDao.getLastBlock();
        let fromBlock = lastBlock ? lastBlock.blockNumber + 1 : 0;
        let toBlock =
          fromBlock + BLOCK_STEP < lastMinedBlockNumber
            ? fromBlock + BLOCK_STEP
            : lastMinedBlockNumber;

        while (running) {
          await readEvents(lastBlock, lastMinedBlock, { fromBlock, toBlock });
          if (toBlock === lastMinedBlockNumber) running = false;
          fromBlock = toBlock + 1;
          toBlock =
            fromBlock + BLOCK_STEP < lastMinedBlockNumber
              ? fromBlock + BLOCK_STEP
              : lastMinedBlockNumber;
        }
        setTimeout(() => this.recoverPastEvents(), INTERVAL);
      } catch (error) {
        logger.error(error);
      }
    },

    async startListen() {
      this.recoverPastEvents();
    }
  };
};

module.exports = eventListener;
