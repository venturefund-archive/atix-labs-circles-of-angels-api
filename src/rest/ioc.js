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
const photoService = require('./services/photoService');
const fileService = require('./services/fileService');
const activityService = require('./services/activityService');
const projectExperienceService = require('./services/projectExperienceService');
const userProjectService = require('./services/userProjectService');
const transferService = require('./services/transferService');
const milestoneService = require('./services/milestoneService');

const milestoneBudgetStatusDao = require('./dao/milestoneBudgetStatusDao');
const projectDao = require('./dao/projectDao');
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
      userFunderDao: undefined,
      userSocialEntrepreneurDao: undefined,
      questionnaireService: undefined
    };

    injectDependencies(service, dependencies);
  }

  function configureProjectService(service) {
    const dependencies = {
      fileServer: fastify.configs.fileServer,
      projectDao,
      milestoneService,
      userDao,
      activityService,
      milestoneDao
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
      userService
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
    const dependencies = { transferDao };

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
      projectDao,
      userDao
    };
    injectDependencies(service, dependencies);
  }

  function configureProjectExperienceService(service) {
    const dependencies = {};
    injectDependencies(service, dependencies);
  }

  function configureDAOs(models) {
    injectModel(userDao, models.user);
    injectModel(photoDao, models.photo);
    injectModel(fileDao, models.file);
    injectModel(milestoneDao, models.milestone);
    injectModel(projectDao, models.project);
    injectModel(milestoneBudgetStatusDao, models.milestoneBudgetStatus);
    injectModel(passRecoveryDao, models.passRecovery);
    injectModel(activityDao, models.task);
    injectModel(projectExperienceDao, models.project_experience);
  }

  function configureServices() {
    configureMailService(mailService);
    configureUserService(userService);
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
