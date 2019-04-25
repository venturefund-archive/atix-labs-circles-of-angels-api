/**
 * @description Represents the relationship between an activity and its photo evidences
 * @attribute `activity`: activity id
 * @attribute `photo`: photo evidence id
 */
module.exports = {
  identity: 'activity_photo',
  primaryKey: 'id',
  attributes: {
    activity: {
      columnName: 'activityId',
      model: 'activity'
    },
    photo: {
      columnName: 'photoId',
      model: 'photo'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    transactionHash: { type: 'string', required: false }
  }
};
