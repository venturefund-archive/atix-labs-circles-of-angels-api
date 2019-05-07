const findByQuestionId = answerModel => async questionId => {
  return answerModel.find({ question: questionId });
};

module.exports = answerModel => ({
  findByQuestionId: findByQuestionId(answerModel)
});
