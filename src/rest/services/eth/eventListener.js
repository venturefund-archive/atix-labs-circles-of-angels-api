const { blockchainStatus, projectStatus } = require('../../util/constants');

const eventListener = async fastify => {
  const { helper } = require('../helper');
  const {
    projectService,
    milestoneService,
    activityService,
    userService
  } = helper.services;

  fastify.eth.suscribeNewProjectEvent(async event => {
    fastify.log.info('[Event listener] :: received New Project event', event);
    try {
      let { id } = event.returnValues;
      id = parseInt(id._hex);
      const response = await projectService.updateBlockchainStatus(
        id,
        blockchainStatus.CONFIRMED
      );

      if (response.error) {
        fastify.log.error('[Event listener] :: Error updating status: ', error);
        return;
      }
      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of project ',
        id
      );
    } catch (error) {
      fastify.log.error(error);
    }
  });

  fastify.eth.suscribeNewMilestoneEvent(async event => {
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

      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of milestone ',
        id
      );
    } catch (error) {
      fastify.log.error(error);
    }
  });

  fastify.eth.suscribeNewActivityEvent(async event => {
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
        projectService.updateProjectStatus({
          projectId,
          status: projectStatus.IN_PROGRESS
        });

        fastify.log.info('[Event listener] :: Project started:', projectId);
      }
      fastify.log.info(
        '[Event listener] :: successfully updated blockchain status of activity',
        id
      );
    } catch (error) {
      fastify.log.error(error);
    }
  });
};

module.exports = eventListener;
