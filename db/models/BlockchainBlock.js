module.exports = {
    identity: 'blockchain_block',
    primaryKey: 'id',
    attributes: {
      blockNumber: { type: 'number', required: true },
      transactionHash: { type: 'string', required: true },
      id: { type: 'number', autoMigrations: { autoIncrement: true } }
    }
  };
  