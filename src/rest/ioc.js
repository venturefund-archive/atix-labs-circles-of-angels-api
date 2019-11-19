/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const nodemailer = require('nodemailer');
const mailService = require('./services/mailService');
const userService = require('./services/userService');
const projectService = require('./services/projectService');
const transferService = require('./services/transferService');
const activityService = require('./services/activityService');
const milestoneService = require('./services/milestoneService');

const milestoneBudgetStatusDao = require('./dao/milestoneBudgetStatusDao');
const projectDao = require('./dao/projectDao');
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
      milestoneService: undefined,
      photoService: undefined,
      transferService: undefined,
      userDao,
      projectExperienceDao: undefined
    };

    injectDependencies(service, dependencies);
  }

  function configureTransferService(service) {
    const dependencies = { transferDao };

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

  function configureMilestoneService(milestoneService) {
    const dependencies = {
      milestoneDao,
      activityService: undefined,
      milestoneBudgetStatusDao,
      projectDao,
      userDao
    };
    injectDependencies(milestoneService, dependencies);
  }

>>>>>>> src/rest/ioc.js
  function configureDAOs(models) {
    injectModel(userDao, models.user);
    injectModel(roleDao, models.role);
    injectModel(milestoneDao, models.milestone);
    injectModel(projectDao, models.project);
    injectModel(milestoneBudgetStatusDao, models.milestoneBudgetStatus);
    injectModel(projectDao, models.project);
    injectModel(passRecoveryDao, models.passRecovery);
  }

  function configureServices() {
    configureMailService(mailService);
    configureUserService(userService);
    configureMilestoneService(milestoneService);
    configureProjectService(projectService);
    configureTransferService(transferService);
    configurePasssRecoveryService(passRecoveryService);
  }

  function init(fastify) {
    configureDAOs(fastify.models);
    configureServices();
  }

  init(fastify);
};
