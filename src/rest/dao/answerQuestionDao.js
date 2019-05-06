const createQuestionnaireEntry = answerQuestionModel => async questionnaire => {
  const createdEntry = await answerQuestionModel.createEach(questionnaire);
  return createdEntry;
};

const getByUserId = answerQuestionModel => async userId => {
  return answerQuestionModel
    .find({ user: userId })
    .populate('answer')
    .populate('question');
};

module.exports = answerQuestionModel => ({
  createQuestionnaireEntry: createQuestionnaireEntry(answerQuestionModel),
  getByUserId: getByUserId(answerQuestionModel)
});
