const apiHelper = require('../../services/helper');

module.exports = {
  getQuestionnaire: fastify => async (request, reply) => {
    const { questionnaireService } = apiHelper.helper.services;
    try {
      const { roleId } = request.params;
      fastify.log.info(
        `[Questionnaire Routes] :: Getting questionnaire for role ${roleId}`
      );
      const questions = await questionnaireService.getQuestionnaireOfRole(
        roleId
      );

      reply.status(200).send({ questions });
    } catch (error) {
      reply.status(500).send({ error });
    }
  }
};
