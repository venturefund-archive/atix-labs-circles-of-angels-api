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
const fileService = require('./services/fileService');

const userDao = require('./dao/userDao');
const projectDao = require('./dao/projectDao');
const fileDao = require('./dao/fileDao');

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
      userRegistrationStatusDao: undefined,
      roleDao: undefined,
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

  function configureDAOs(models) {
    injectModel(userDao, models.user);
    injectModel(fileDao, models.file);
  }
  function configureServices() {
    configureMailService(mailService);
    configureUserService(userService);
    configureProjectService(projectService);
    configureFileService(fileService);
  }
  function init(fastify) {
    configureDAOs(fastify.models);
    configureServices();
  }

  init(fastify);
};
