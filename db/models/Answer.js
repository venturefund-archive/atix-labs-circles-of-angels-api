module.exports = {
  identity: 'answer',
  primaryKey: 'id',
  attributes: {
    answer: { type: 'string', required: true },
    question: { columnName: 'questionId', model: 'question' },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
