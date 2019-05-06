const createQuestionnaireEntry = answerQuestionModel => async questionnaire => {
  const createdEntry = await answerQuestionModel.createEach(questionnaire);
  return createdEntry;
};

module.exports = answerQuestionModel => ({
  createQuestionnaireEntry: createQuestionnaireEntry(answerQuestionModel)
});
