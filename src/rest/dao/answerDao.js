const findByQuestionId = answerModel => async questionId =>
  answerModel.find({ question: questionId });

module.exports = answerModel => ({
  findByQuestionId: findByQuestionId(answerModel)
});
