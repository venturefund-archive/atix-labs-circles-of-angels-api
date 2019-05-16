const basePath = '/questionnaire';
const apiHelper = require('../services/helper');

const routes = async (fastify, options) => {
  fastify.get(
    `${basePath}/:roleId`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          roleId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
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
  );
};

module.exports = routes;
