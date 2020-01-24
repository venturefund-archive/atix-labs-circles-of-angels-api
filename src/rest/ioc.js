/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones
 * agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const nodemailer = require('nodemailer');
const mailService = require('./services/mailService');
const userService = require('./services/userService');
const projectService = require('./services/projectService');
const countryService = require('./services/countryService');
const photoService = require('./services/photoService');
const fileService = require('./services/fileService');
const activityService = require('./services/activityService');
const projectExperienceService = require('./services/projectExperienceService');
const userProjectService = require('./services/userProjectService');
const transferService = require('./services/transferService');
const milestoneService = require('./services/milestoneService');

const milestoneBudgetStatusDao = require('./dao/milestoneBudgetStatusDao');
const projectDao = require('./dao/projectDao');
const followerDao = require('./dao/followerDao');
const oracleDao = require('./dao/oracleDao');
const funderDao = require('./dao/funderDao');
const countryDao = require('./dao/countryDao');
const photoDao = require('./dao/photoDao');
const fileDao = require('./dao/fileDao');
const projectExperienceDao = require('./dao/projectExperienceDao');
const activityDao = require('./dao/activityDao');
const userProjectDao = require('./dao/userProjectDao');
const transferDao = require('./dao/transferDao');
const milestoneDao = require('./dao/milestoneDao');
const userDao = require('./dao/userDao');
const passRecoveryService = require('./services/passRecoveryService');
const passRecoveryDao = require('./dao/passRecoveryDao');
const projectExperiencePhotoDao = require('./dao/projectExperiencePhotoDao');

const { injectDependencies } = require('./util/injection');

module.exports = fastify => {
  // Injects a model into a dao instance as the property `model`
  const injectModel = (daoInstance, model) => {
    injectDependencies(daoInstance, { model });
  };

  function createEmailClient() {
    const { service, email, password } = fastify.configs.support;
    return nodemailer.createTransport({
      service,
      auth: {
        user: email,
        pass: password
      }
    });
  }

  function configureFileService(service) {
    const dependencies = {
      fileDao
    };

    injectDependencies(service, dependencies);
  }

  // Configure the mail service.
  function configureMailService(service) {
    const dependencies = {
      emailClient: createEmailClient()
    };

    injectDependencies(service, dependencies);
  }

  function configureUserService(service) {
    const dependencies = {
      userDao,
      mailService,
      projectService,
      userFunderDao: undefined,
      userSocialEntrepreneurDao: undefined,
      questionnaireService: undefined
    };

    injectDependencies(service, dependencies);
  }

  function configureCountryService(service) {
    const dependencies = {
      countryDao
    };

    injectDependencies(service, dependencies);
  }

  function configureProjectService(service) {
    const dependencies = {
      fileServer: fastify.configs.fileServer,
      projectDao,
      followerDao,
      oracleDao,
      funderDao,
      milestoneService,
      userDao, // TODO: remove this dao and create needed methods in userService
      activityService,
      transferService
    };

    injectDependencies(service, dependencies);
  }

  function configureActivityService(service) {
    const dependencies = {
      activityDao,
      fileService: undefined,
      photoService: undefined,
      activityFileDao: undefined,
      activityPhotoDao: undefined,
      oracleActivityDao: undefined,
      userService,
      milestoneService
    };
    injectDependencies(service, dependencies);
  }

  function configureUserProjectService(service) {
    const dependencies = {
      userProjectDao
    };

    injectDependencies(service, dependencies);
  }

  function configureTransferService(service) {
    const dependencies = {
      transferDao,
      projectDao,
      userDao
    };

    injectDependencies(service, dependencies);
  }

  function configurePhotoService(service) {
    const dependencies = { photoDao };
    injectDependencies(service, dependencies);
  }

  function configurePasssRecoveryService(service) {
    const dependencies = {
      mailService,
      passRecoveryDao,
      userDao
    };
    injectDependencies(service, dependencies);
  }

  function configureMilestoneService(service) {
    const dependencies = {
      milestoneDao,
      activityService,
      milestoneBudgetStatusDao,
      projectService,
      userDao
    };
    injectDependencies(service, dependencies);
  }

  function configureProjectExperienceService(service) {
    const dependencies = {
      projectExperienceDao,
      projectExperiencePhotoDao,
      projectDao,
      userDao
    };
    injectDependencies(service, dependencies);
  }

  function configureDAOs(models) {
    injectModel(userDao, models.user);
    injectModel(photoDao, models.photo);
    injectModel(fileDao, models.file);
    injectModel(milestoneDao, models.milestone);
    injectModel(projectDao, models.project);
    injectModel(followerDao, models.project_follower);
    injectModel(oracleDao, models.project_oracle);
    injectModel(funderDao, models.project_funder);
    injectModel(countryDao, models.country);
    injectModel(milestoneBudgetStatusDao, models.milestoneBudgetStatus);
    injectModel(passRecoveryDao, models.passRecovery);
    injectModel(activityDao, models.task);
    injectModel(projectExperienceDao, models.project_experience);
    injectModel(projectExperiencePhotoDao, models.project_experience_photo);
    injectModel(transferDao, models.fund_transfer);
  }

  function configureServices() {
    configureMailService(mailService);
    configureUserService(userService);
    configureCountryService(countryService);
    configureMilestoneService(milestoneService);
    configureProjectService(projectService);
    configurePhotoService(photoService);
    configureFileService(fileService);
    configureActivityService(activityService);
    configureUserProjectService(userProjectService);
    configureTransferService(transferService);
    configurePasssRecoveryService(passRecoveryService);
    configureProjectExperienceService(projectExperienceService);
  }

  function init({ models }) {
    configureDAOs(models);
    configureServices();
  }

  init(fastify);
};
