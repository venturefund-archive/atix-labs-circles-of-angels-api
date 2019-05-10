/**
 * @description Represents a COA user experience with a project,
 * requires a comment and may have an attached file
 * @attribute `id`: unique identifier
 * @attribute `project`: reference to the related project
 * @attribute `user`: reference to the related user
<<<<<<< HEAD
 * @attribute `photos`: reference to the attached files
=======
 * @attribute `file`: reference to the attached file
>>>>>>> COA-598 create project_experience table and model
 * @attribute `comment`: comments from the user
 */
module.exports = {
  identity: 'project_experience',
  primaryKey: 'id',
  attributes: {
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    user: {
      columnName: 'userId',
      model: 'user'
    },
<<<<<<< HEAD
    photos: {
      collection: 'photo',
      via: 'projectExperience'
    },
    comment: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },
=======
    file: {
      columnName: 'fileId',
      model: 'file'
    },
    comment: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: true },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
>>>>>>> COA-598 create project_experience table and model
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
