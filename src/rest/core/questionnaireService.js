/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { forEachPromise } = require('../util/promises');

const questionnaireService = ({
  answerQuestionDao,
  questionDao,
  answerDao
}) => ({
  async saveQuestionnaireOfUser(userId, questionnaire) {
    const proccessedQuestionnaire = [];
    questionnaire.forEach(entry => {
      entry.answers.forEach(({ answer, customAnswer }) => {
        proccessedQuestionnaire.push({
          question: entry.question,
          user: userId,
          answer,
          customAnswer
        });
      });
    });
    await answerQuestionDao.createQuestionnaireEntry(proccessedQuestionnaire);
  },

  async getAnswersOfUser(user) {
    return answerQuestionDao.getByUserId(user.id);
  },

  async getQuestionnaireOfRole(roleId) {
    const questions = await questionDao.findByRoleId(roleId);
    const questionnaire = [];
    const pushAnswers = (question, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          question.answers = await answerDao.findByQuestionId(question.id);
          context.push(question);
          resolve();
        });
      });
    await forEachPromise(questions, pushAnswers, questionnaire);
    return questionnaire;
  }
});

module.exports = questionnaireService;
