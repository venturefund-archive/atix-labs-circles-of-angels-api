module.exports = {
  identity: 'question',
  primaryKey: 'id',
  attributes: {
    question: { type: 'string', required: true },
    role: { type: 'number', autoCreatedAt: true, required: false },
    answerLimit: { type: 'number', required: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
