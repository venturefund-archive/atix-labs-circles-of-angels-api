/**
 * @description Represents the relationship between an activity and its file evidences
 * @attribute `activity`: activity id
 * @attribute `file`: file evidence id
 */
module.exports = {
  identity: 'activity_file',
  primaryKey: 'id',
  attributes: {
    activity: {
      columnName: 'activityId',
      model: 'activity'
    },
    file: {
      columnName: 'fileId',
      model: 'file'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    fileHash: { type: 'string', required: false }
  }
};
