const eventListener = async fastify => {
  const { helper } = require('../helper');
  const { projectService, milestoneService, activityService } = helper.services;

  fastify.eth.suscribeNewProjectEvent(async event => {
    fastify.log.info('[Event listener] :: received New Project event', event);
    const { id } = event.returnValues;
  });

  fastify.eth.suscribeNewMilestoneEvent(async event => {
    fastify.log.info('[Event listener] :: received New Milestone event', event);
    const { id, projectId } = event.returnValues;
  });

  fastify.eth.suscribeNewActivityEvent(async event => {
    fastify.log.info('[Event listener] :: received New Activity event', event);
    const { id, milestoneId, projectId } = event.returnValues;
  });
};

module.exports = eventListener;
