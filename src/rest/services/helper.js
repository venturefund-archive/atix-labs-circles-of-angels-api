const activityServiceBuilder = require('../core/activityService');
const fileServiceBuilder = require('../core/fileService');
const milestoneServiceBuilder = require('../core/milestoneService');
const photoServiceBuilder = require('../core/photoService');
const projectServiceBuilder = require('../core/projectService');
const questionnaireServiceBuilder = require('../core/questionnaireService');
const transferServiceBuilder = require('../core/transferService');
const userProjectServiceBuilder = require('../core/userProjectService');
const userServiceBuilder = require('../core/userService');

const activityDaoBuilder = require('../dao/activityDao');
const activityFileDaoBuilder = require('../dao/activityFileDao');
const activityPhotoDaoBuilder = require('../dao/activityPhotoDao');
const answerDaoBuilder = require('../dao/answerDao');
const answerQuestionDaoBuilder = require('../dao/answerQuestionDao');
const configsDaoBuilder = require('../dao/configsDao');
const fileDaoBuilder = require('../dao/fileDao');
const milestoneBudgetStatusDaoBuilder = require('../dao/milestoneBudgetStatusDao');
const milestoneDaoBuilder = require('../dao/milestoneDao');
const oracleActivityDaoBuilder = require('../dao/oracleActivityDao');
const photoDaoBuilder = require('../dao/photoDao');
const projectDaoBuilder = require('../dao/projectDao');
const projectStatusDaoBuilder = require('../dao/projectStatusDao');
const questionDaoBuilder = require('../dao/questionDao');
const roleDaoBuilder = require('../dao/roleDao');
const transferDaoBuilder = require('../dao/transferDao');
const userDaoBuilder = require('../dao/userDao');
const userFunderDaoBuilder = require('../dao/userFunderDao');
const userProjectDaoBuilder = require('../dao/userProjectDao');
const userRegistrationStatusDaoBuilder = require('../dao/userRegistrationStatusDao');
const userSocialEntrepreneurDaoBuilder = require('../dao/userSocialEntrepreneurDao');

const helperBuilder = async fastify => {
  const { models } = fastify;
  const configsDao = configsDaoBuilder({ configsModel: models.configs });
  const fileDao = fileDaoBuilder(models.file);
  const fileService = fileServiceBuilder({ fastify, fileDao });
  const photoDao = photoDaoBuilder(models.photo);
  const photoService = photoServiceBuilder({ fastify, photoDao });
  const userDao = userDaoBuilder({ userModel: models.user });
  const activityDao = activityDaoBuilder(models.activity);
  const activityFileDao = activityFileDaoBuilder(models.activity_file);
  const activityPhotoDao = activityPhotoDaoBuilder(models.activity_photo);
  const oracleActivityDao = oracleActivityDaoBuilder(models.oracle_activity);
  const answerQuestionDao = answerQuestionDaoBuilder({
    answerQuestionModel: models.answer_question
  });
  const answerDao = answerDaoBuilder(models.answer);
  const questionDao = questionDaoBuilder(models.question);
  const questionnaireService = questionnaireServiceBuilder({
    answerQuestionDao,
    answerDao,
    questionDao
  });
  const userRegistrationStatusDao = userRegistrationStatusDaoBuilder(
    models.user_registration_status
  );
  const roleDao = roleDaoBuilder(models.role);
  const userFunderDao = userFunderDaoBuilder(models.user_funder);
  const userSocialEntrepreneurDao = userSocialEntrepreneurDaoBuilder(
    models.user_social_entrepreneur
  );
  const userService = userServiceBuilder({
    fastify,
    userDao,
    userRegistrationStatusDao,
    roleDao,
    userFunderDao,
    userSocialEntrepreneurDao,
    questionnaireService
  });
  const activityService = activityServiceBuilder({
    fastify,
    activityDao,
    fileService,
    photoService,
    activityFileDao,
    activityPhotoDao,
    oracleActivityDao,
    userService
  });
  const milestoneDao = milestoneDaoBuilder(models.milestone);
  const milestoneBudgetStatusDao = milestoneBudgetStatusDaoBuilder(
    models.milestone_budget_status
  );
  const milestoneService = milestoneServiceBuilder({
    fastify,
    milestoneDao,
    milestoneBudgetStatusDao,
    activityService
  });
  const transferDao = transferDaoBuilder({
    transferModel: models.fund_transfer,
    transferStatusModel: models.transfer_status
  });
  const transferService = transferServiceBuilder({
    fastify,
    transferDao
  });
  const projectDao = projectDaoBuilder({
    projectModel: models.project,
    userDao
  });
  const projectStatusDao = projectStatusDaoBuilder({
    projectStatusModel: models.project_status
  });
  const projectService = projectServiceBuilder({
    fastify,
    projectDao,
    milestoneService,
    projectStatusDao,
    photoService,
    transferService,
    userDao
  });
  const userProjectDao = userProjectDaoBuilder(models.user_project);
  const userProjectService = userProjectServiceBuilder({
    fastify,
    userProjectDao
  });

  exports.helper = {
    services: {
      fileService,
      activityService,
      milestoneService,
      photoService,
      projectService,
      questionnaireService,
      transferService,
      userProjectService,
      userService
    },
    daos: {
      activityDao,
      activityFileDao,
      activityPhotoDao,
      answerDao,
      answerQuestionDao,
      configsDao,
      fileDao,
      milestoneBudgetStatusDao,
      milestoneDao,
      oracleActivityDao,
      photoDao,
      projectDao,
      projectStatusDao,
      questionDao,
      roleDao,
      transferDao,
      userDao,
      userFunderDao,
      userProjectDao,
      userRegistrationStatusDao,
      userSocialEntrepreneurDao
    }
  };
};

exports.helperBuilder = helperBuilder;
exports.helper = {};
