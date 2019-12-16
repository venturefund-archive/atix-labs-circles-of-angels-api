const files = require('../util/files');
const {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize
} = require('../services/helpers/projectServiceHelper');

const logger = require('../logger');

module.exports = {
  validatePhotos(photos) {
    photos.forEach(photo => {
      logger.info(
        '[ProjectExperienceService] :: Entering validatePhotos method'
      );
      logger.info(
        '[ProjectExperienceService] ::   About to validate mtypes of project experience photo'
      );
      validateMtype('experiencePhoto')(photo);
      logger.info(
        '[ProjectExperienceService] :: About to validate size of project experience photo'
      );
      validatePhotoSize(photo);
    });
  },
  async savePhotos(photos) {
    logger.info('[ProjectExperienceService] :: Entering savePhotos method');
    logger.info(
      '[ProjectExperienceService] :: About to save all the photo files of project experience'
    );
    return photos.map(photo => files.saveFile('projectExperiencePhoto', photo));
  },
  async addExperience({ comment, projectId, userId, photos }) {
    logger.info('[ProjectExperienceService] :: Entering addExperience method');
    validateParams(comment, projectId, userId, photos);
    logger.info(
      '[ProjectExperienceService] :: About to validate project experience existence'
    );
    await validateExistence(this.projectDao, projectId, 'project');
    logger.info(
      '[ProjectExperienceService] :: About to validate user existence'
    );
    await validateExistence(this.userDao, userId, 'user');

    this.validatePhotos(photos);

    logger.info(
      '[ProjectExperienceService] :: About to save project experience'
    );
    const { id } = await this.projectExperienceDao.saveProjectExperience({
      comment,
      project: projectId,
      user: userId
    });

    const photosPath = await this.savePhotos(photos);

    logger.info(
      '[ProjectExperienceService] :: About to save project experience photo paths'
    );

    photosPath.forEach(async photoPath =>
      this.projectExperiencePhotoDao.saveProjectExperiencePhoto({
        path: await photoPath,
        projectExperience: id
      })
    );

    return { projectExperienceId: id };
  },
  async getExperiencesOnProject({ projectId }) {
    logger.info(
      '[ProjectServiceExperience] :: Entering getExperiencesOnProject'
    );
    logger.info(
      '[ProjectExperienceService] :: About to check that all parameters are not undefined'
    );
    validateParams(projectId);
    logger.info(
      '[ProjectExperienceService] :: About to validate project existence'
    );
    validateExistence(this.projectDao, projectId, 'project');
    logger.info(
      '[ProjectExperienceService] :: About to get all experiences by project'
    );
    return this.projectExperienceDao.getExperiencesByProject({
      // FIXME this shit returns everything LIKE USER PASSWORD because of the way it is made
      project: projectId
    });
  }
};
