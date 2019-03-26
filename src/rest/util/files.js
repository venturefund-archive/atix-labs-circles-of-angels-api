const fs = require('fs');
const path = require('path');
const configs = require('../../../config/configs');

exports.getFileFromPath = filepath => {
  const file = fs.createReadStream(filepath, 'utf8');
  return file;
};

const getCoverPhotoPath = (projectName, photoName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectName}/coverPhoto${path.extname(photoName)}`;
};

const getCardPhotoPath = (projectName, photoName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectName}/cardPhoto${path.extname(photoName)}`;
};

const getPitchProposalPath = (projectName, proposalName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectName}/pitchProposal${path.extname(proposalName)}`;
};

const getMilestonesPath = (projectName, milestoneName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectName}/milestones${path.extname(milestoneName)}`;
};

exports.addPathToFilesProperties = (
  projectName,
  coverPhoto,
  cardPhoto,
  pitchProposal,
  milestones
) => {
  coverPhoto.path = getCoverPhotoPath(projectName, coverPhoto.name);
  cardPhoto.path = getCardPhotoPath(projectName, cardPhoto.name);
  pitchProposal.path = getPitchProposalPath(projectName, pitchProposal.name);
  milestones.path = getMilestonesPath(projectName, milestones.name);
};
