const files = require('../util/files');
const {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize
} = require('../services/helpers/projectServiceHelper');

module.exports = {
  validatePhotos(photos) {
    photos.forEach(photo => validateMtype(photo) && validatePhotoSize(photo));
  },
  async savePhotos(photos) {
    return photos.map(photo => files.saveFile('projectExperiencePhoto', photo));
  },
  async addExperience({ comment, projectId, userId, photos }) {
    validateParams(comment, projectId, userId, photos);
    await validateExistence(this.projectDao, projectId, 'project');
    await validateExistence(this.userDao, userId, 'user');

    this.validatePhotos(photos);

    const { id } = await this.projectExperienceDao.saveProjectExperience({
      comment,
      project: projectId,
      user: userId
    });

    const photosPath = await this.savePhotos(photos);

    photosPath.forEach(async photoPath =>
      this.projectExperiencePhotoDao.saveProjectExperiencePhoto({
        path: await photoPath,
        projectExperience: id
      })
    );

    return ' salio increiblemente todo piola ';
  },
  async getExperiencesOnProject({ projectId }) {
    validateParams(projectId);
    validateExistence(this.projectDao, projectId, 'project');
    return this.projectExperienceDao.getExperiencesByProject({
      project: projectId
    });
  }
};
