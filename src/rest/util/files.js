/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const fs = require('fs');
const path = require('path');
const configs = require('config');
const sharp = require('sharp');

exports.getFileFromPath = filepath => {
  const file = fs.createReadStream(filepath, 'utf8');
  return file;
};

const getCoverPhotoPath = projectId =>
  `${configs.fileServer.filePath}/projects/${projectId}/coverPhoto.jpg`;

const getCardPhotoPath = projectId =>
  `${configs.fileServer.filePath}/projects/${projectId}/cardPhoto.jpg`;

const getPitchProposalPath = (projectId, proposalName) =>
  `${
    configs.fileServer.filePath
  }/projects/${projectId}/pitchProposal${path.extname(proposalName)}`;

const getProjectAgreementPath = (projectId, agreementName) =>
  `${configs.fileServer.filePath}/projects/${projectId}/agreement${path.extname(
    agreementName
  )}`;

const getMilestonesPath = (projectId, milestoneName) =>
  `${
    configs.fileServer.filePath
  }/projects/${projectId}/milestones${path.extname(milestoneName)}`;

exports.addPathToFilesProperties = ({
  projectId,
  coverPhoto,
  cardPhoto,
  pitchProposal,
  projectAgreement,
  milestones
}) => {
  if (coverPhoto) {
    coverPhoto.path = getCoverPhotoPath(projectId);
  }
  if (cardPhoto) {
    cardPhoto.path = getCardPhotoPath(projectId);
  }
  if (pitchProposal) {
    pitchProposal.path = getPitchProposalPath(projectId, pitchProposal.name);
  }
  if (projectAgreement) {
    projectAgreement.path = getProjectAgreementPath(
      projectId,
      projectAgreement.name
    );
  }
  if (milestones) {
    milestones.path = getMilestonesPath(projectId, milestones.name);
  }
};

exports.addTimestampToFilename = filename => {
  const fileExtension = path.extname(filename);
  const currentDate = new Date();
  const timeString = `${`0${currentDate.getUTCHours()}`.slice(
    -2
  )}${`0${currentDate.getUTCMinutes()}`.slice(
    -2
  )}${`0${currentDate.getUTCSeconds()}`.slice(
    -2
  )}${`0${currentDate.getUTCMilliseconds()}`.slice(-2)}`;

  const timestampString = [
    currentDate.getUTCFullYear(),
    `0${currentDate.getUTCMonth() + 1}`.slice(-2),
    `0${currentDate.getUTCDate()}`.slice(-2),
    timeString
  ].join('-');

  const nameWithTimestamp = filename.replace(
    fileExtension,
    `_${timestampString}`.concat(fileExtension)
  );

  return nameWithTimestamp;
};

exports.savePhotoJpgFormat = async (image, savePath, maxWidth) => {
  return new Promise((resolve, reject) => {
    sharp(image.data)
      .resize({
        width: maxWidth,
        options: {
          fit: 'outside'
        }
      })
      .flatten()
      .jpeg()
      .toFile(savePath, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
  });
};
