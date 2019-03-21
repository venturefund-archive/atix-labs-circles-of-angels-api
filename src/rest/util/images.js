const fs = require('fs');

/**
 * Method to convert image file to base64
 * @param path absolute path to image file
 * @returns a base64 string
 */
exports.getBase64htmlFromPath = path => {
  try {
    const bitmap = fs.readFileSync(path);
    const format = path.split('.').slice(-1)[0];
    // convert binary data to base64 encoded string
    const base64 = new Buffer.from(bitmap).toString('base64');
    const res = `data:image/${format};base64, ${base64}`;
    return res;
  } catch (error) {
    console.error(error);
    return '';
  }
};
