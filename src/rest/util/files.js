/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const fs = require('fs');
const configs = require('config');
const sharp = require('sharp');
const mkdirp = require('mkdirp-promise');

exports.getFileFromPath = filepath => {
  const file = fs.createReadStream(filepath, 'utf8');
  return file;
};

const getCoverPhotoPath = () =>
  `${configs.fileServer.filePath}/projects/coverPhotos/`;

const getCardPhotoPath = () =>
  `${configs.fileServer.filePath}/projects/cardPhotos/`;

// const getPitchProposalPath = (projectId, proposalName) =>
//   `${
//     configs.fileServer.filePath
//   }/projects/${projectId}/pitchProposal${path.extname(proposalName)}`;

// const getProjectAgreementPath = (projectId, agreementName) =>
//   `${configs.fileServer.filePath}/projects/${projectId}/agreement${path.extname(
//     agreementName
//   )}`;

// const getMilestonesPath = (projectId, milestoneName) =>
//   `${
//     configs.fileServer.filePath
//   }/projects/${projectId}/milestones${path.extname(milestoneName)}`;

const savePhotoJpgFormat = async (image, savePath, maxWidth = 1250) =>
  new Promise((resolve, reject) => {
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

const fileSaver = {
  // milestone: { saver: milestoneSaver, getPath: getMilestonesPath }, // TODO
  thumbnail: { saver: savePhotoJpgFormat, getBasePath: getCardPhotoPath },
  coverPhoto: { saver: savePhotoJpgFormat, getBasePath: getCoverPhotoPath }
};

exports.saveFile = async (type, { file, maxWidth }) => {
  const saver = fileSaver[type];
  const hash = file.md5;
  const fileExtension = hash.concat('.jpeg');
  const path = saver
    .getBasePath()
    .concat(hash.charAt(0))
    .concat('/');
  await mkdirp(path);
  await savePhotoJpgFormat(file, path.concat(fileExtension));
  return path.concat(fileExtension);
};
