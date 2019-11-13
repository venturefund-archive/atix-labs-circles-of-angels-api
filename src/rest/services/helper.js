/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const activityServiceBuilder = require('../core/activityService');
const fileServiceBuilder = require('../core/fileService');
const milestoneServiceBuilder = require('../core/milestoneService');
const photoServiceBuilder = require('../core/photoService');
const projectServiceBuilder = require('../core/projectService');
const questionnaireServiceBuilder = require('../core/questionnaireService');
const transferServiceBuilder = require('../core/transferService');
const userProjectServiceBuilder = require('../core/userProjectService');
const passRecoveryServiceBuilder = require('../core/passRecoveryService');

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
const transferDaoBuilder = require('../dao/transferDao');
const userDaoBuilder = require('../dao/userDao');
const userFunderDaoBuilder = require('../dao/userFunderDao');
const userProjectDaoBuilder = require('../dao/userProjectDao');
const userRegistrationStatusDaoBuilder = require('../dao/userRegistrationStatusDao');
const userSocialEntrepreneurDaoBuilder = require('../dao/userSocialEntrepreneurDao');
const passRecoveryDaoBuilder = require('../dao/passRecoveryDao');
const projectExperienceDaoBuilder = require('../dao/projectExperienceDao');
const blockchainBlockDaoBuilder = require('../dao/blockchainBlockDao');
const transactionDaoBuilder = require('../dao/transactionDao');

const helperBuilder = async fastify => {
  const { models } = fastify;
  const blockchainBlockDao = blockchainBlockDaoBuilder(models.blockchain_block);
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
  const projectExperienceDao = projectExperienceDaoBuilder(
    models.project_experience
  );
  const answerQuestionDao = answerQuestionDaoBuilder(models.answer_question);
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
  const userFunderDao = userFunderDaoBuilder(models.user_funder);
  const userSocialEntrepreneurDao = userSocialEntrepreneurDaoBuilder(
    models.user_social_entrepreneur
  );
  const userService = undefined
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
    userDao,
    projectExperienceDao
  });
  const userProjectDao = userProjectDaoBuilder(models.user_project);
  const userProjectService = userProjectServiceBuilder({
    fastify,
    userProjectDao
  });

  const passRecoveryService = passRecoveryServiceBuilder({
    fastify,
    passRecoveryDao: passRecoveryDaoBuilder(fastify.models.pass_recovery),
    userDao
  });

  const transactionDao = transactionDaoBuilder(fastify.models.transaction);

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
      userService,
      passRecoveryService
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
      transferDao,
      userDao,
      userFunderDao,
      userProjectDao,
      userRegistrationStatusDao,
      userSocialEntrepreneurDao,
      projectExperienceDao,
      blockchainBlockDao,
      transactionDao
    }
  };
};

exports.helperBuilder = helperBuilder;
