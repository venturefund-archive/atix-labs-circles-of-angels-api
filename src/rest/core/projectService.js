/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const mkdirp = require('mkdirp-promise');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const { isEmpty, uniq } = require('lodash');
const { forEachPromise } = require('../util/promises');
const {
  addPathToFilesProperties,
  addTimestampToFilename
} = require('../util/files');
const {
  projectStatus,
  blockchainStatus,
  userRoles
} = require('../util/constants');
const MAX_PHOTO_SIZE = 500000;

const { savePhotoJpgFormat } = require('../util/files');

const unlinkPromise = promisify(fs.unlink);

const cardPhotoSize = 700;
const coverPhotoSize = 1400;

const projectService = ({
  fastify,
  projectDao,
  milestoneService,
  photoService,
  transferService,
  userDao,
  projectExperienceDao
}) => ({
  async createProjectThumbnail({
    projectName,
    countryOfImpact,
    timeframe,
    goalAmount,
    file
  }) {
    if (!(projectName && countryOfImpact && timeframe && goalAmount && file))
      throw Error(); // TODO
  },

  async updateProjectThumbnail() {},

  async getProjectThumbnail() {},

  async createProjectDetail() {},

  async updateProjectDetail() {},

  async getProjectDetail() {},

  async createProjectProposal() {},

  async updateProjectProposal() {},

  async getProjectProposal() {},

  async deleteMilestoneOfProject() {},

  async editActivityOfMilestone() {},

  async deleteActivityOfMilestone() {},

  async uploadMilestoneFile() {},

  async processMilestoneFile() {},

  async getProjectMilestones() {},

  async publishProject() {}
});

module.exports = projectService;
