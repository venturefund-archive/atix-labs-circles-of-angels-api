/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const nodemailer = require('nodemailer');
const mailService = require('./mailService');
const userService = require('./userService');

const userDao = require('../dao/userDao');

// const injectLocator = instance => {
//   Object.defineProperty(instance, 'serviceLocator', { value: serviceLocator });
// };
//

module.exports = fastify => {

  const injectDependencies = (instance, dependencies) => {
    // map property descriptors
    const descriptors = Object.entries(dependencies).reduce(
      (acc, [depName, dep]) => Object.assign(acc, { [depName]: { value: dep } }),
      {}
    );
  
    Object.defineProperties(instance, descriptors);
  };
  
  // Injects a model into a dao instance as the property `model`
  const injectModel = (daoInstance, model) => {
    injectDependencies(daoInstance, { model });
  };
  
  function createEmailClient() {
    const { service, email, password } = fastify.configs.support;
    return nodemailer.createTransport({
      service: service,
      auth: {
        user: email,
        pass: password
      }
    });
  }
  
  // Configure the mail service.
  function configureMailService(mailService) {
    const dependencies = {
      emailClient: createEmailClient()
    };
  
    injectDependencies(mailService, dependencies);
  }
  
  function configureUserService(userService) {
    const dependencies = {
      userDao,
      userFunderDao: undefined,
      userSocialEntrepreneurDao: undefined,
      userRegistrationStatusDao: undefined,
      roleDao: undefined,
      questionnaireService: undefined
    };
  
    injectDependencies(userService, dependencies);
  }
  
  function configureDAOs(models) {
    injectModel(userDao, models.user);
  }
  function configureServices() {
    configureMailService(mailService);
    configureUserService(userService);
  
  }
  function init(fastify) {
    configureDAOs(fastify.models);
    configureServices()
  }
  
  init(fastify);
};
