module.exports = {
  identity: 'answer_question',
  primaryKey: 'id',
  attributes: {
    customAnswer: { type: 'string', required: false },
    question: { columnName: 'questionId', model: 'question' },
    answer: { columnName: 'answerId', model: 'answer' },
    user: { columnName: 'userId', model: 'user' },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
