/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const {
  blockchainStatus,
  projectStatus,
  milestoneBudgetStatus
} = require('../../util/constants');

const eventListener = async fastify => {
  const { helper } = require('../helper');
  const { projectService, milestoneService, activityService } = helper.services;

  const {
    blockchainBlockDao,
    projectDao,
    milestoneDao,
    activityDao
  } = helper.daos;

  const updateLastBlock = async event => {
    const { blockNumber, transactionHash } = event;
    return blockchainBlockDao.updateLastBlock(blockNumber, transactionHash);
  };

  const onProjectStarted = async event => {
    fastify.log.info(
      '[Event listener] :: received Project started event',
      event
    );
    let { id } = event.returnValues;
    id = parseInt(id._hex, 10);

    projectDao.updateStartBlockchainStatus(id, blockchainStatus.CONFIRMED);
  };

  const onMilestoneClaimableEvent = async event => {
    try {
      fastify.log.info(
        '[Event listener] :: received Milestone Claimable event',
        event
      );
      let { id } = event.returnValues;
      id = parseInt(id._hex, 10);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.CLAIMABLE
      );
      updatedMilestone && (await updateLastBlock(event));
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const onMilestoneClaimedEvent = async event => {
    try {
      fastify.log.info(
        '[Event listener] :: received Milestone Claimed event',
        event
      );
      let { id } = event.returnValues;
      id = parseInt(id._hex, 10);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.CLAIMED
      );
      updatedMilestone && (await updateLastBlock(event));
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const onMilestoneFundedEvent = async event => {
    try {
      fastify.log.info(
        '[Event listener] :: received Milestone Funded event',
        event
      );
      let { id } = event.returnValues;
      id = parseInt(id._hex, 10);
      const updatedMilestone = await milestoneDao.updateBudgetStatus(
        id,
        milestoneBudgetStatus.FUNDED
      );
      updatedMilestone && (await updateLastBlock(event));
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const onNewProjectEvent = async event => {
    fastify.log.info('[Event listener] :: received New Project event', event);
    try {
      let { id } = event.returnValues;
      id = parseInt(id._hex, 10);
      const modifiedProject = await projectService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (modifiedProject.error) {
        fastify.log.error(
          '[Event listener] :: Error updating status: ',
          modifiedProject.error
        );
        return;
      }
      await updateLastBlock(event);
      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of project ',
        id
      );
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const onNewMilestoneEvent = async event => {
    fastify.log.info('[Event listener] :: received New Milestone event', event);
    try {
      let { id, projectId } = event.returnValues;
      id = parseInt(id._hex, 10);
      projectId = parseInt(projectId._hex, 10);
      const project = await projectService.getProjectWithId({ projectId });
      if (project.blockchainStatus !== blockchainStatus.CONFIRMED) {
        fastify.log.error(
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
        fastify.log.error(
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
      await fastify.eth.createActivities(activities);
      await updateLastBlock(event);
      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of milestone ',
        id
      );
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const onNewActivityEvent = async event => {
    fastify.log.info('[Event listener] :: received New Activity event', event);
    try {
      let { id, milestoneId, projectId } = event.returnValues;
      id = parseInt(id._hex, 10);
      milestoneId = parseInt(milestoneId._hex, 10);
      projectId = parseInt(projectId._hex, 10);

      const project = await projectService.getProjectWithId({ projectId });
      const milestone = await milestoneService.getMilestoneById(milestoneId);

      if (project.blockchainStatus !== blockchainStatus.CONFIRMED) {
        fastify.log.error(
          '[Event listener] :: Must be confirmed in blockchain first the project ',
          projectId
        );
        return;
      }
      if (milestone.blockchainStatus !== blockchainStatus.CONFIRMED) {
        fastify.log.error(
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
        fastify.log.error('[Event listener] :: Error updating status ');
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
        fastify.log.error(
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
          fastify.log.error(
            '[Event listener] :: Error updating status: ',
            projectComplete.error
          );
          return;
        }

        if (projectComplete) {
          const userOwner = await projectDao.getUserOwnerOfProject(projectId);
          const transactionHash = await fastify.eth.startProject({ projectId });
          await projectDao.updateProjectTransaction({
            projectId,
            status: projectStatus.IN_PROGRESS,
            transactionHash
          });

          await projectService.updateProjectStatus({
            projectId,
            status: projectStatus.IN_PROGRESS
          });

          fastify.log.info('[Event listener] :: Project started:', projectId);

          await updateLastBlock(event);
          fastify.log.info(
            '[Event listener] :: successfully updated blockchain status of activity',
            id
          );
        }
      }
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const eventMethodMap = {
    NewProject: onNewProjectEvent,
    NewMilestone: onNewMilestoneEvent,
    NewActivity: onNewActivityEvent,
    MilestoneClaimable: onMilestoneClaimableEvent,
    MilestoneClaimed: onMilestoneClaimedEvent,
    MilestoneFunded: onMilestoneFundedEvent
  };

  return {
    async recoverPastEvents() {
      try {
        const lastBlock = await blockchainBlockDao.getLastBlock();
        const events = await fastify.eth.getAllPastEvents({
          fromBlock: lastBlock.blockNumber + 1 || 0
        });
        for (const eventKey in events) {
          const event = events[eventKey];
          if (eventMethodMap[event.event]) eventMethodMap[event.event](event);
        }
      } catch (error) {
        fastify.log.error(error);
      }
    },

    async initEventListener() {
      fastify.eth.suscribeNewProjectEvent(onNewProjectEvent);
      fastify.eth.suscribeNewMilestoneEvent(onNewMilestoneEvent);
      fastify.eth.suscribeNewActivityEvent(onNewActivityEvent);
      fastify.eth.suscribeMilestoneClaimableEvent(onMilestoneClaimableEvent);
      fastify.eth.suscribeMilestoneClaimedEvent(onMilestoneClaimedEvent);
      fastify.eth.suscribeMilestoneFundedEvent(onMilestoneFundedEvent);
      fastify.eth.suscribeProjectStartedEvent(onProjectStarted);
    }
  };
};

module.exports = eventListener;
