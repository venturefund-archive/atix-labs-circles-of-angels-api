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
  }
});

module.exports = questionnaireService;
