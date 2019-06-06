const {
  blockchainStatus,
  projectStatus,
  milestoneBudgetStatus
} = require('../../util/constants');

const eventListener = async fastify => {
  const { helper } = require('../helper');
  const {
    projectService,
    milestoneService,
    activityService,
    userService
  } = helper.services;

  const { blockchainBlockDao, projectDao, milestoneDao } = helper.daos;

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
    id = parseInt(id._hex);

    projectDao.updateStartBlockchainStatus(id, blockchainStatus.CONFIRMED);
  };

  const onMilestoneClaimableEvent = async event => {
    fastify.log.info(
      '[Event listener] :: received Milestone Claimable event',
      event
    );
    let { id } = event.returnValues;
    id = parseInt(id._hex);
    const updatedMilestone = await milestoneDao.updateBudgetStatus(
      id,
      milestoneBudgetStatus.CLAIMABLE
    );
  };

  const onMilestoneClaimedEvent = async event => {
    fastify.log.info(
      '[Event listener] :: received Milestone Claimed event',
      event
    );
    let { id } = event.returnValues;
    id = parseInt(id._hex);
    const updatedMilestone = await milestoneDao.updateBudgetStatus(
      id,
      milestoneBudgetStatus.CLAIMED
    );
  };

  const onMilestoneFundedEvent = async event => {
    fastify.log.info(
      '[Event listener] :: received Milestone Funded event',
      event
    );
    let { id } = event.returnValues;
    id = parseInt(id._hex);
    const updatedMilestone = await milestoneDao.updateBudgetStatus(
      id,
      milestoneBudgetStatus.FUNDED
    );
  };

  const onNewProjectEvent = async event => {
    fastify.log.info('[Event listener] :: received New Project event', event);
    try {
      let { id } = event.returnValues;
      id = parseInt(id._hex);
      const modifiedProject = await projectService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (modifiedProject.error) {
        fastify.log.error('[Event listener] :: Error updating status: ', error);
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
      id = parseInt(id._hex);
      projectId = parseInt(projectId._hex);
      project = await projectService.getProjectWithId({ projectId });
      owner = await userService.getUserById(project.ownerId);
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
        fastify.log.error('[Event listener] :: Error updating status: ', error);
        return;
      }

      const activities = (await milestoneService.getMilestoneActivities(
        milestone
      )).activities;

      for (let j = 0; j < activities.length; j++) {
        const activity = activities[j];
        const oracle = await activityService.getOracleFromActivity(activity.id);
        await fastify.eth.createActivity(owner.address, owner.pwd, {
          activityId: activity.id,
          milestoneId: id,
          projectId,
          oracleAddress: oracle.user.address,
          description: activity.tasks
        });
      }
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
      id = parseInt(id._hex);
      milestoneId = parseInt(milestoneId._hex);
      projectId = parseInt(projectId._hex);

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

      const activities = (await milestoneService.getMilestoneActivities(
        milestone
      )).activities;

      const projectComplete = true;
      for (activityIndex in activities) {
        const activity = activities[activityIndex];
        if (activity.blockchainStatus !== blockchainStatus.CONFIRMED) {
          projectComplete = false;
          break;
        }
      }

      if (response.error) {
        fastify.log.error('[Event listener] :: Error updating status: ', error);
        return;
      }

      if (projectComplete) {
        const userOwner = await projectDao.getUserOwnerOfProject(projectId);
        const transactionHash = await fastify.eth.startProject(
          userOwner.address,
          userOwner.pwd,
          { projectId }
        );
        const startedProject = await projectDao.updateProjectTransaction({
          projectId,
          status: projectStatus.IN_PROGRESS,
          transactionHash
        });

        await projectService.updateProjectStatus({
          projectId,
          status: projectStatus.IN_PROGRESS
        });

        if (!startedProject || startedProject == null) {
          fastify.log.error(
            `[Project Service] :: Project ID ${projectId} could not be updated`
          );
          return { error: 'ERROR: Project could not be started', status: 500 };
        }

        fastify.log.info('[Event listener] :: Project started:', projectId);
      }
      await updateLastBlock(event);
      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of activity',
        id
      );
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
        for (eventKey in events) {
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
