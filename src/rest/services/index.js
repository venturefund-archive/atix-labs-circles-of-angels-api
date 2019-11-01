/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const nodemailer = require('nodemailer');
const mailService = require('./mailService');

const injectLocator = instance => {
  Object.defineProperty(instance, 'serviceLocator', { value: serviceLocator });
};

const injectDependencies = (instance, dependencies) => {
  // map property descriptors
  const descriptors = Object.entries(dependencies).reduce(
    (acc, [depName, dep]) => Object.assign(acc, { [depName]: { value: dep } }),
    {}
  );

  Object.defineProperties(instance, descriptors);
};



module.exports = fastify => {

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

  configureMailService(mailService);
};
