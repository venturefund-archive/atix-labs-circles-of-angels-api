const basePath = '/questionnaire';
const routes = async (fastify, options) => {
  const answerQuestionDao = require('../dao/answerQuestionDao')({
    answerQuestionModel: fastify.models.answer_question
  });
  const answerDao = require('../dao/answerDao')(fastify.models.answer);
  const questionDao = require('../dao/questionDao')(fastify.models.question);
  const questionnaireService = require('../core/questionnaireService')({
    answerQuestionDao,
    answerDao,
    questionDao
  });

  fastify.get(
    `${basePath}/:roleId`,
    {
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
