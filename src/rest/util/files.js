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

const getMilestonesPath = () =>
  `${configs.fileServer.filePath}/projects/milestones/`;

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

const milestoneSaver = async (file, savePath) => file.mv(savePath);

const fileSaver = {
  milestones: {
    save: milestoneSaver,
    getBasePath: getMilestonesPath,
    fileExtension: '.xlsx'
  },
  thumbnail: {
    save: savePhotoJpgFormat,
    getBasePath: getCardPhotoPath,
    fileExtension: '.jpeg'
  },
  coverPhoto: {
    save: savePhotoJpgFormat,
    getBasePath: getCoverPhotoPath,
    fileExtension: '.jpeg'
  }
};

exports.saveFile = async (type, file) => {
  const saver = fileSaver[type];
  const hash = file.md5;
  const fileExtension = hash.concat(saver.fileExtension);
  let path = saver
    .getBasePath()
    .concat(hash.charAt(0))
    .concat('/');
  await mkdirp(path);
  path = path.concat(fileExtension);
  await saver.save(file, path);
  return path;
};
