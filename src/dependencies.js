import dao from './dao';

const userServiceDependencies = {
  userDao,
  userFunderDao: undefined,
  userSocialEntrepreneurDao: undefined,
  userRegistrationStatusDao: undefined,
  roleDao: undefined,
  questionnaireService: undefined
};

const dependencies = {
  emailClient: createEmailClient()
};

module.exports = {};
