const questionnaireService = ({ answerQuestionDao }) => ({
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
    answerQuestionDao.createQuestionnaireEntry(proccessedQuestionnaire);
  },

  async getAnswersOfUser(user) {
    return answerQuestionDao.getByUserId(user.id);
  }
});

module.exports = questionnaireService;
