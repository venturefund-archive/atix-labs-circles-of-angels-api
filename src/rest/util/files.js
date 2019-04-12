const fs = require('fs');
const path = require('path');
const configs = require('../../../config/configs');

exports.getFileFromPath = filepath => {
  const file = fs.createReadStream(filepath, 'utf8');
  return file;
};

const getCoverPhotoPath = (projectId, photoName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectId}/coverPhoto${path.extname(photoName)}`;
};

const getCardPhotoPath = (projectId, photoName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectId}/cardPhoto${path.extname(photoName)}`;
};

const getPitchProposalPath = (projectId, proposalName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectId}/pitchProposal${path.extname(proposalName)}`;
};

const getProjectAgreementPath = (projectId, agreementName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectId}/agreement${path.extname(agreementName)}`;
}

const getMilestonesPath = (projectId, milestoneName) => {
  return `${
    configs.fileServer.filePath
  }/projects/${projectId}/milestones${path.extname(milestoneName)}`;
};

exports.addPathToFilesProperties = ({
  projectId,
  coverPhoto,
  cardPhoto,
  pitchProposal,
  projectAgreement,
  milestones
}) => {
  if (coverPhoto) {
    coverPhoto.path = getCoverPhotoPath(projectId, coverPhoto.name);
  }
  if (cardPhoto) {
    cardPhoto.path = getCardPhotoPath(projectId, cardPhoto.name);
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
